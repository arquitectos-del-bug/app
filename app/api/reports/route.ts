import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { CommunityReport, CommunityAlert, ReportType } from '@/types/community'

const THRESHOLD_COUNT = 5
const THRESHOLD_KM = 2
const THRESHOLD_HOURS = 2

// Demo data shown when MongoDB is not configured — near Chosica to trigger the alert
const DEMO_REPORTS: CommunityReport[] = [
  { lat: -11.934, lon: -76.693, tipo: 'huaico',   descripcion: 'Derrumbe bloqueó bajada Quirio',       distrito: 'Lurigancho-Chosica', created_at: new Date(Date.now() - 25 * 60000) },
  { lat: -11.936, lon: -76.691, tipo: 'huaico',   descripcion: 'Barro en pista altura km 37',           distrito: 'Lurigancho-Chosica', created_at: new Date(Date.now() - 40 * 60000) },
  { lat: -11.932, lon: -76.695, tipo: 'desborde', descripcion: 'Río sube, calle inundada',              distrito: 'Lurigancho-Chosica', created_at: new Date(Date.now() - 18 * 60000) },
  { lat: -11.940, lon: -76.688, tipo: 'bloqueo',  descripcion: 'Huaico cortó av. Nicolás Ayllón',       distrito: 'Lurigancho-Chosica', created_at: new Date(Date.now() - 55 * 60000) },
  { lat: -11.929, lon: -76.697, tipo: 'huaico',   descripcion: 'Deslizamiento activo sobre viviendas',  distrito: 'Lurigancho-Chosica', created_at: new Date(Date.now() - 12 * 60000) },
  { lat: -11.938, lon: -76.694, tipo: 'desborde', descripcion: 'Acequia desbordada, agua en pasaje',    distrito: 'Lurigancho-Chosica', created_at: new Date(Date.now() - 70 * 60000) },
  { lat: -12.045, lon: -77.031, tipo: 'desborde', descripcion: 'Agua hasta las rodillas en pista',      distrito: 'San Juan de Lurigancho', created_at: new Date(Date.now() - 90 * 60000) },
]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function checkThreshold(reports: CommunityReport[], lat: number, lon: number): CommunityAlert | null {
  const cutoff = Date.now() - THRESHOLD_HOURS * 60 * 60000
  const nearby = reports.filter(r => {
    const ts = new Date(r.created_at).getTime()
    return ts > cutoff && haversineKm(lat, lon, r.lat, r.lon) <= THRESHOLD_KM
  })
  if (nearby.length < THRESHOLD_COUNT) return null
  return {
    count: nearby.length,
    radio_km: THRESHOLD_KM,
    tipos: [...new Set(nearby.map(r => r.tipo))] as ReportType[],
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lon = parseFloat(searchParams.get('lon') || '0')

  const db = await getDb()
  let reports: CommunityReport[]

  if (db) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60000)
    const raw = await db
      .collection('community_reports')
      .find({ created_at: { $gte: cutoff } })
      .sort({ created_at: -1 })
      .limit(100)
      .toArray()
    reports = raw as unknown as CommunityReport[]
  } else {
    reports = DEMO_REPORTS
  }

  const communityAlert = lat && lon ? checkThreshold(reports, lat, lon) : null
  return NextResponse.json({ reports, communityAlert, demo: !db })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lat, lon, tipo, descripcion, distrito } = body

  if (!lat || !lon || !tipo) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const report: CommunityReport = {
    lat: Number(lat),
    lon: Number(lon),
    tipo,
    descripcion: descripcion || '',
    distrito: distrito || '',
    created_at: new Date(),
  }

  const db = await getDb()
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('community_reports').insertOne(report as any)
  }

  // Re-fetch recent to check threshold
  let allRecent: CommunityReport[]
  if (db) {
    const cutoff = new Date(Date.now() - THRESHOLD_HOURS * 60 * 60000)
    const raw = await db.collection('community_reports').find({ created_at: { $gte: cutoff } }).toArray()
    allRecent = raw as unknown as CommunityReport[]
  } else {
    allRecent = [...DEMO_REPORTS, report]
  }

  const communityAlert = checkThreshold(allRecent, Number(lat), Number(lon))
  return NextResponse.json({ ok: true, report, communityAlert, demo: !db })
}
