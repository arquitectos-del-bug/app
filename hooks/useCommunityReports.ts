'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CommunityReport, CommunityAlert, ReportType } from '@/types/community'

interface UseCommunityReportsResult {
  reports: CommunityReport[]
  communityAlert: CommunityAlert | null
  loading: boolean
  addReport: (tipo: ReportType, descripcion: string, distrito: string) => Promise<void>
}

export function useCommunityReports(lat: number | null, lon: number | null): UseCommunityReportsResult {
  const [reports, setReports] = useState<CommunityReport[]>([])
  const [communityAlert, setCommunityAlert] = useState<CommunityAlert | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReports = useCallback(async () => {
    if (!lat || !lon) return
    try {
      const res = await fetch(`/api/reports?lat=${lat}&lon=${lon}`)
      if (!res.ok) return
      const data = await res.json()
      setReports(data.reports ?? [])
      setCommunityAlert(data.communityAlert ?? null)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [lat, lon])

  useEffect(() => {
    fetchReports()
    const id = setInterval(fetchReports, 60_000)
    return () => clearInterval(id)
  }, [fetchReports])

  const addReport = useCallback(
    async (tipo: ReportType, descripcion: string, distrito: string) => {
      if (!lat || !lon) return
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, tipo, descripcion, distrito }),
      })
      const data = await res.json()
      if (data.ok) {
        await fetchReports()
        if (data.communityAlert) setCommunityAlert(data.communityAlert)
      }
    },
    [lat, lon, fetchReports]
  )

  return { reports, communityAlert, loading, addReport }
}
