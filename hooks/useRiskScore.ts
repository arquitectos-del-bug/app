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
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (lat === null || lon === null) return

    let isMounted = true

    async function fetchRiskAndRecommendations() {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        // 1. Obtener Score de Riesgo
        const riskResponse = await fetch('/api/risk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lat, lon }),
        })

        if (!riskResponse.ok) {
          throw new Error('Error al obtener la evaluación de riesgo')
        }

        const riskData = await riskResponse.json()

        if (!isMounted) return

        // 2. Obtener recomendaciones basadas en el riesgo
        const recResponse = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: riskData.score,
            nivel: riskData.nivel,
            distrito: riskData.distrito,
            lluviaMm: riskData.lluviaMm,
            ptsCauce: riskData.desglose.cauce,
            ptsLluvia: riskData.desglose.lluvia,
            ptsVuln: riskData.desglose.vulnerabilidad,
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
            error: err.message || 'Error de conexión con el servidor',
            // Fallback con datos estables
            score: 50,
            nivel: 'MODERADO',
            distrito: 'Lurigancho-Chosica, Lima',
            lluviaMm: 15,
            desglose: {
              cauce: 20,
              lluvia: 20,
              vulnerabilidad: 10,
              cauceCercano: 'Cauce Principal Rímac',
              distanciaMetros: 1200,
            },
            recommendations: [
              {
                id: 1,
                icon: '🎒',
                title: 'Mochila a la mano',
                description: 'Prepara tu mochila de emergencia con alimentos no perecibles, agua y radio a pilas.',
              },
              {
                id: 2,
                icon: '🚶',
                title: 'Ruta de evacuación',
                description: 'Reconoce las vías hacia zonas seguras elevadas y evita quebradas activas.',
              },
              {
                id: 3,
                icon: '📞',
                title: 'Mantente alerta',
                description: 'Monitorea las noticias de INDECI y mantén comunicación con el vecindario.',
              },
            ],
          }))
        }
      }
    }

    fetchRiskAndRecommendations()

    return () => {
      isMounted = false
    }
  }, [lat, lon])

  return state
}
