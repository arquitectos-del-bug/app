import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { CommunityReport, ReportType } from '@/types/community'

const OFFSETS: { dlat: number; dlon: number; tipo: ReportType; descripcion: string }[] = [
  { dlat:  0.002, dlon:  0.001, tipo: 'huaico',   descripcion: 'Derrumbe bloqueó bajada principal' },
  { dlat: -0.003, dlon:  0.002, tipo: 'huaico',   descripcion: 'Barro cubre la pista, no se puede pasar' },
  { dlat:  0.001, dlon: -0.003, tipo: 'desborde', descripcion: 'Río subió, calle completamente inundada' },
  { dlat: -0.004, dlon: -0.001, tipo: 'bloqueo',  descripcion: 'Huaico cortó la avenida principal' },
  { dlat:  0.003, dlon: -0.002, tipo: 'huaico',   descripcion: 'Deslizamiento activo sobre viviendas' },
  { dlat: -0.001, dlon:  0.003, tipo: 'desborde', descripcion: 'Acequia desbordada, agua en pasaje' },
  { dlat:  0.005, dlon:  0.000, tipo: 'huaico',   descripcion: 'Piedras y barro bajando del cerro' },
]

export async function POST(req: NextRequest) {
  const { lat, lon } = await req.json()
  if (!lat || !lon) return NextResponse.json({ error: 'lat/lon requeridos' }, { status: 400 })

  const now = Date.now()
  const reports: CommunityReport[] = OFFSETS.map(({ dlat, dlon, tipo, descripcion }, i) => ({
    lat: Number(lat) + dlat,
    lon: Number(lon) + dlon,
    tipo,
    descripcion,
    distrito: 'Simulación Demo',
    created_at: new Date(now - i * 5 * 60000), // escalona en el tiempo (5 min entre reportes)
  }))

  const db = await getDb()
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('community_reports').insertMany(reports as any[])
  }

  return NextResponse.json({ ok: true, inserted: reports.length, reports })
}
