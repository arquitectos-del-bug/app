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

interface MockData {
  score: number
  nivel: 'BAJO' | 'MODERADO' | 'ALTO'
  desglose: {
    cauce: number
    lluvia: number
    vulnerabilidad: number
    cauceCercano: string
    distanciaMetros: number
  }
  distrito: string
  lluviaMm: number
  recommendations: EvacuationStep[]
}

const MOCK_DATA_MAP: Record<string, MockData> = {
  quirio: {
    score: 95,
    nivel: 'ALTO',
    distrito: 'Lurigancho-Chosica, Lima',
    lluviaMm: 45.8,
    desglose: {
      cauce: 40,
      lluvia: 35,
      vulnerabilidad: 20,
      cauceCercano: 'Quebrada Quirio',
      distanciaMetros: 80,
    },
    recommendations: [
      { id: 1, icon: '🚨', title: 'Alerta Extrema', description: 'Evacuar de inmediato a la zona alta de Quirio (Losa Deportiva o Colegio Pablo Patrón).' },
      { id: 2, icon: '🎒', title: 'Mochila Lista', description: 'Lleva tu mochila de emergencia con radio a pilas, linterna y agua embotellada.' },
      { id: 3, icon: '🚫', title: 'Peligro en Cauce', description: 'No intentes cruzar el cauce de la quebrada bajo ninguna circunstancia.' },
      { id: 4, icon: '👥', title: 'Ayuda Comunitaria', description: 'Ayuda a niños y ancianos a subir a las zonas seguras identificadas.' }
    ]
  },
  carossio: {
    score: 88,
    nivel: 'ALTO',
    distrito: 'Lurigancho-Chosica, Lima',
    lluviaMm: 38.2,
    desglose: {
      cauce: 38,
      lluvia: 30,
      vulnerabilidad: 20,
      cauceCercano: 'Quebrada Carossio',
      distanciaMetros: 120,
    },
    recommendations: [
      { id: 1, icon: '🚨', title: 'Evacuación Activa', description: 'Dirigirse al punto de reunión familiar en la Plaza de Armas de Chosica.' },
      { id: 2, icon: '📻', title: 'Radio Informativa', description: 'Mantente sintonizado a los avisos de Defensa Civil en la radio local.' },
      { id: 3, icon: '⚡', title: 'Corte de Servicios', description: 'Desconecta la energía eléctrica y el gas antes de salir de casa.' },
      { id: 4, icon: '🧗', title: 'Rutas Pintadas', description: 'Sigue las rutas señalizadas con pintura reflectante en las paredes.' }
    ]
  },
  pedregal: {
    score: 78,
    nivel: 'ALTO',
    distrito: 'Lurigancho-Chosica, Lima',
    lluviaMm: 32.0,
    desglose: {
      cauce: 35,
      lluvia: 23,
      vulnerabilidad: 20,
      cauceCercano: 'Quebrada Pedregal',
      distanciaMetros: 240,
    },
    recommendations: [
      { id: 1, icon: '⚠️', title: 'Riesgo Inminente', description: 'Prepárate para evacuar hacia la zona segura del Club Regatas Chosica.' },
      { id: 2, icon: '🛡️', title: 'Documentos a Salvo', description: 'Protege tus documentos valiosos en bolsas herméticas y llévalos contigo.' },
      { id: 3, icon: '🚧', title: 'Calles Inundadas', description: 'Evita transitar por calles inundadas o con flujos de agua rápidos.' },
      { id: 4, icon: '📞', title: 'Números de Emergencia', description: 'Llama al 115 de Defensa Civil si necesitas asistencia para evacuar.' }
    ]
  },
  santa_eulalia: {
    score: 55,
    nivel: 'MODERADO',
    distrito: 'Santa Eulalia, Huarochirí',
    lluviaMm: 12.5,
    desglose: {
      cauce: 25,
      lluvia: 10,
      vulnerabilidad: 20,
      cauceCercano: 'Río Santa Eulalia',
      distanciaMetros: 850,
    },
    recommendations: [
      { id: 1, icon: '👀', title: 'Vigilancia Activa', description: 'Monitorea el nivel del río y mantente atento a los ruidos de la quebrada.' },
      { id: 2, icon: '🌧️', title: 'Lluvia Persistente', description: 'Si la lluvia se intensifica por más de 1 hora, inicia la evacuación preventiva.' },
      { id: 3, icon: '🎒', title: 'Mochila a la Mano', description: 'Asegura tu mochila de emergencia en un lugar de fácil acceso.' },
      { id: 4, icon: '🌳', title: 'Refugios Naturales', description: 'Identifica las zonas altas y árboles fuertes lejos del cauce.' }
    ]
  },
  centro_lima: {
    score: 12,
    nivel: 'BAJO',
    distrito: 'Cercado de Lima, Lima',
    lluviaMm: 0.5,
    desglose: {
      cauce: 5,
      lluvia: 7,
      vulnerabilidad: 0,
      cauceCercano: 'Río Rímac',
      distanciaMetros: 2800,
    },
    recommendations: [
      { id: 1, icon: '✅', title: 'Situación Normal', description: 'El riesgo de huaicos en esta zona es extremadamente bajo.' },
      { id: 2, icon: '🧼', title: 'Alcantarillado Limpio', description: 'Mantén limpias las alcantarillas y canaletas de tu vivienda para lluvias locales.' },
      { id: 3, icon: '📰', title: 'Reportes INDECI', description: 'Sigue los reportes oficiales de INDECI sobre el estado de las quebradas en Lima Este.' },
      { id: 4, icon: '🤝', title: 'Solidaridad Activa', description: 'Sé solidario y permanece atento a las necesidades de familiares en zonas de riesgo.' }
    ]
  }
}

function getMockKey(lat: number, lon: number): string | null {
  if (Math.abs(lat - (-11.9345)) < 0.001 && Math.abs(lon - (-76.6912)) < 0.001) return 'quirio'
  if (Math.abs(lat - (-11.9312)) < 0.001 && Math.abs(lon - (-76.6845)) < 0.001) return 'carossio'
  if (Math.abs(lat - (-11.9423)) < 0.001 && Math.abs(lon - (-76.6778)) < 0.001) return 'pedregal'
  if (Math.abs(lat - (-11.9178)) < 0.001 && Math.abs(lon - (-76.6256)) < 0.001) return 'santa_eulalia'
  if (Math.abs(lat - (-12.0463)) < 0.001 && Math.abs(lon - (-77.0310)) < 0.001) return 'centro_lima'
  return null
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

      const mockKey = getMockKey(lat as number, lon as number)
      if (mockKey && MOCK_DATA_MAP[mockKey]) {
        // Simular tiempo de carga de red para mejor feedback visual
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (!isMounted) return
        const mockData = MOCK_DATA_MAP[mockKey]!
        setState({
          score: mockData.score,
          nivel: mockData.nivel,
          desglose: mockData.desglose,
          distrito: mockData.distrito,
          lluviaMm: mockData.lluviaMm,
          recommendations: mockData.recommendations,
          loading: false,
          error: null,
        })
        return
      }

      try {
        const riskResponse = await fetch('/api/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lon }),
        })

        if (!riskResponse.ok) throw new Error('Error al obtener la evaluación de riesgo')

        const riskData = await riskResponse.json()
        if (!isMounted) return

        let recommendations: EvacuationStep[] = []
        try {
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

          if (recResponse.ok) {
            const recData = await recResponse.json()
            recommendations = recData.steps || []
          }
        } catch (recErr) {
          console.error('Error al llamar API de recomendaciones, se usarán fallbacks locales:', recErr)
        }

        if (!isMounted) return

        // Generar recomendaciones locales si el servicio API de OpenAI falló o devolvió vacío
        if (recommendations.length === 0) {
          if (riskData.nivel === 'ALTO') {
            recommendations = [
              { id: 1, icon: '🚨', title: 'Alerta Extrema', description: 'Prepárate para evacuar de inmediato hacia las zonas seguras señalizadas por Defensa Civil.' },
              { id: 2, icon: '🎒', title: 'Mochila de Emergencia', description: 'Mantén a la mano tu mochila equipada con linterna, radio a pilas y víveres esenciales.' },
              { id: 3, icon: '🚫', title: 'Peligro en Cauce', description: 'No intentes cruzar ríos ni quebradas activas bajo ninguna circunstancia.' },
              { id: 4, icon: '📢', title: 'Comunicación Oficial', description: 'Sintoniza la radio local para alertas en tiempo real y reportes oficiales.' }
            ]
          } else if (riskData.nivel === 'MODERADO') {
            recommendations = [
              { id: 1, icon: '👀', title: 'Monitoreo de Lluvias', description: 'Observa de forma continua la cantidad de lluvia acumulada y ruidos extraños en los cerros.' },
              { id: 2, icon: '🧹', title: 'Limpieza de Techos', description: 'Limpia las bajadas de agua de tu techo y retira basura de las alcantarillas de tu calle.' },
              { id: 3, icon: '🎒', title: 'Preparación Preventiva', description: 'Asegúrate de tener armada la mochila de emergencia familiar.' },
              { id: 4, icon: '🧗', title: 'Zonas de Seguridad', description: 'Identifica y conversa con tu familia sobre las rutas de evacuación más cercanas.' }
            ]
          } else {
            recommendations = [
              { id: 1, icon: '✅', title: 'Situación Normal', description: 'Por el momento no se registran factores de riesgo significativos en tu sector.' },
              { id: 2, icon: '🧼', title: 'Mantenimiento de Desagües', description: 'Verifica que los drenajes pluviales estén libres de obstrucciones.' },
              { id: 3, icon: '📰', title: 'Prevención Continua', description: 'Infórmate sobre el plan de contingencia de tu distrito ante la temporada de lluvias.' },
              { id: 4, icon: '🤝', title: 'Coordinación Vecinal', description: 'Participa en los simulacros y charlas de prevención organizadas por tu municipio.' }
            ]
          }
        }

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

