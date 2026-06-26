'use client'

import { useState, useEffect } from 'react'
import { EvacuationStep } from '@/modules/recommendations/domain/EvacuationPlan'

export interface RiskBreakdown {
  cauce: number
  lluvia: number
  vulnerabilidad: number
  cauceCercano: string | null
  distanciaMetros: number | null
}

export interface RiskScoreState {
  score: number | null
  nivel: 'BAJO' | 'MODERADO' | 'ALTO' | null
  desglose: RiskBreakdown | null
  distrito: string | null
  lluviaMm: number | null
  recommendations: EvacuationStep[]
  loading: boolean
  error: string | null
}

export function useRiskScore(lat: number | null, lon: number | null): RiskScoreState {
  const [state, setState] = useState<RiskScoreState>({
    score: null,
    nivel: null,
    desglose: null,
    distrito: null,
    lluviaMm: null,
    recommendations: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (lat === null || lon === null) return

    let isMounted = true

    async function fetchRiskAndRecommendations() {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const riskResponse = await fetch('/api/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lon }),
        })

        if (!riskResponse.ok) throw new Error('Error al obtener la evaluación de riesgo')

        const riskData = await riskResponse.json()
        if (!isMounted) return

        const recResponse = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: riskData.score,
            nivel: riskData.nivel,
            distrito: riskData.distrito,
            lluviaMm: riskData.lluviaMm,
            ptsCauce: riskData.desglose.cauce,
            ptsLluvia: riskData.desglose.lluvia,
            ptsVuln: riskData.desglose.vulnerabilidad,
            cauceCercano: riskData.desglose.cauceCercano,
            distanciaMetros: riskData.desglose.distanciaMetros,
          }),
        })

        let recommendations: EvacuationStep[] = []
        if (recResponse.ok) {
          const recData = await recResponse.json()
          recommendations = recData.steps || []
        }

        if (!isMounted) return

        setState({
          score: riskData.score,
          nivel: riskData.nivel,
          desglose: riskData.desglose,
          distrito: riskData.distrito,
          lluviaMm: riskData.lluviaMm,
          recommendations,
          loading: false,
          error: null,
        })
      } catch (err: any) {
        console.error('Error fetching risk score:', err)
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
          }))
        }
      }
    }

    fetchRiskAndRecommendations()
    return () => { isMounted = false }
  }, [lat, lon])

  return state
}
