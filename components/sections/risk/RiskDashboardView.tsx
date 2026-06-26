'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Map, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useRiskScore } from '@/hooks/useRiskScore'
import { RiskGauge } from './RiskGauge'
import { QuickStats } from './QuickStats'
import { SignalBreakdown } from './SignalBreakdown'
import { RiskLevelBanner } from './RiskLevelBanner'
import { HistoricalChart } from './HistoricalChart'
import { EvacuationPlanCard } from '../recommendations/EvacuationPlanCard'

export function RiskDashboardView() {
  const { lat, lon, distrito, loading: locLoading, error: locError } = useUserLocation()
  const {
    score,
    nivel,
    desglose,
    lluviaMm,
    recommendations,
    loading: riskLoading,
    error: riskError,
  } = useRiskScore(lat, lon)

  const [caudalHoy, setCaudalHoy] = useState<number>(312)
  const [historicalFlows, setHistoricalFlows] = useState([
    { name: 'Hoy', value: 312, color: '#3b82f6', isDashed: false },
    { name: 'Pico 2017', value: 489, color: '#ef4444', isDashed: true },
    { name: 'Pico 2023', value: 401, color: '#f59e0b', isDashed: true },
  ])
  const [hydrologyLoading, setHydrologyLoading] = useState(true)
  const [showExplainer, setShowExplainer] = useState(false)

  // Obtener datos de hidrología reales de Supabase
  useEffect(() => {
    async function fetchHydrology() {
      try {
        const res = await fetch('/api/hydrology')
        if (res.ok) {
          const data = await res.json()
          if (data.flows) {
            setHistoricalFlows(data.flows)
            const hoy = data.flows.find((f: any) => f.name === 'Hoy')?.value
            if (hoy) setCaudalHoy(hoy)
          }
        }
      } catch (e) {
        console.error('Error fetching hydrology for dashboard:', e)
      } finally {
        setHydrologyLoading(false)
      }
    }
    fetchHydrology()
  }, [])

  const isLoading = locLoading || riskLoading

  // Formatear señales dinámicamente
  const signals = desglose
    ? [
        {
          icon: '🏔️',
          label: 'Cercanía a cauce',
          value: desglose.cauce,
          status: (desglose.cauce > 25 ? 'red' : desglose.cauce > 10 ? 'amber' : 'slate') as 'red' | 'amber' | 'slate',
          description: `+${desglose.cauce} pts${
            desglose.cauceCercano
              ? ` (${desglose.cauceCercano} a ${desglose.distanciaMetros}m)`
              : ''
          }`,
        },
        {
          icon: '🌧️',
          label: 'Lluvia 48h',
          value: desglose.lluvia,
          status: (desglose.lluvia > 25 ? 'red' : desglose.lluvia > 10 ? 'amber' : 'slate') as 'red' | 'amber' | 'slate',
          description: `+${desglose.lluvia} pts (${lluviaMm?.toFixed(1) || 0} mm)`,
        },
        {
          icon: '⚠️',
          label: 'Alerta activa',
          value: desglose.vulnerabilidad,
          status: (desglose.vulnerabilidad > 0 ? 'red' : 'slate') as 'red' | 'amber' | 'slate',
          description: `+${desglose.vulnerabilidad} pts`,
        },
      ]
    : []

  // Estadísticas rápidas
  const quickStats = [
    {
      id: 'rainfall',
      icon: '💧',
      label: 'Lluvia 48h',
      value: lluviaMm !== null ? lluviaMm.toFixed(1) : '38.4',
      unit: 'mm',
      status: (lluviaMm && lluviaMm > 30 ? 'red' : lluviaMm && lluviaMm > 10 ? 'amber' : 'slate') as 'red' | 'amber' | 'slate',
    },
    {
      id: 'flow',
      icon: '🌊',
      label: 'Caudal Rímac',
      value: caudalHoy.toString(),
      unit: 'm³/s',
      badge: caudalHoy > 400 ? '↑ Crítico' : caudalHoy > 200 ? '↑ Alto' : 'Normal',
      status: (caudalHoy > 400 ? 'red' : caudalHoy > 200 ? 'amber' : 'slate') as 'red' | 'amber' | 'slate',
    },
    {
      id: 'lastAlert',
      icon: '📡',
      label: 'Alerta Distrito',
      value: score && score > 66 ? 'ROJO' : score && score > 33 ? 'NARANJA' : 'VERDE',
      unit: 'en vivo',
      status: (score && score > 66 ? 'red' : score && score > 33 ? 'amber' : 'slate') as 'red' | 'amber' | 'slate',
    },
  ]

  // Estado de carga premium
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skeleton Left */}
          <div className="bg-surface/50 border border-border rounded-2xl p-6 text-center space-y-4">
            <div className="w-40 h-40 rounded-full border-4 border-slate-700/50 border-t-blue-500 animate-spin mx-auto flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/3 mx-auto"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
          {/* Skeleton Right */}
          <div className="space-y-6">
            <div className="h-28 bg-surface/50 border border-border rounded-2xl"></div>
            <div className="h-32 bg-surface/50 border border-border rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Banner de error geográfico o de red */}
      {(locError || riskError) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300">
            <span className="font-semibold block">Modo de Resiliencia Activo</span>
            {locError ? 'Permiso de ubicación denegado.' : 'Conexión inestable con el servidor.'} Usando base de datos y cálculos locales.
          </div>
        </div>
      )}

      {/* Cabecera del Panel */}
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">Panel de Autoprotección</h2>
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="text-[11px] text-primary hover:text-blue-600 flex items-center gap-1 font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showExplainer ? 'Ocultar guía' : '¿Cómo se calcula?'}
        </button>
      </div>

      {/* Explicador de Algoritmo interactivo */}
      {showExplainer && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3.5 shadow-xl text-xs text-text-muted leading-relaxed animate-fade-in">
          <h3 className="font-bold text-text-primary text-sm border-b border-border/50 pb-2 flex items-center gap-1.5">
            🔍 Explicación del Algoritmo YakuAlert
          </h3>
          <p>
            Tu nivel de riesgo (0 a 100%) se calcula sumando tres señales comprobables tomadas de satélites y Defensa Civil:
          </p>
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <span className="text-base flex-shrink-0 mt-0.5">🏔️</span>
              <div>
                <strong className="text-text-primary block">Distancia a Quebradas (Máx. 40 puntos):</strong>
                <span className="text-[11px] block mt-0.5 leading-normal">
                  Calculado con fórmula Haversine. Si estás a menos de 200m de una quebrada o río inestable, sumas 40 pts. El peligro decae a 0 pts a los 2km.
                </span>
              </div>
            </div>
            <div className="flex gap-2.5 border-t border-border/30 pt-2.5">
              <span className="text-base flex-shrink-0 mt-0.5">🌧️</span>
              <div>
                <strong className="text-text-primary block">Lluvias Acumuladas 48h (Máx. 40 puntos):</strong>
                <span className="text-[11px] block mt-0.5 leading-normal">
                  Pronóstico satelital Open-Meteo. Lluvias inofensivas de 5mm o menos dan 0 pts. Escala lineal hasta lluvias torrenciales de 60mm o más (40 pts).
                </span>
              </div>
            </div>
            <div className="flex gap-2.5 border-t border-border/30 pt-2.5">
              <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
              <div>
                <strong className="text-text-primary block">Alertas del Distrito (Máx. 20 puntos):</strong>
                <span className="text-[11px] block mt-0.5 leading-normal">
                  Alertas vigentes emitidas por SENAMHI/COEN. Si hay alerta activa Naranja o Roja en tu distrito, se añaden 20 pts de vulnerabilidad.
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-2.5 flex justify-between text-[10px] font-bold text-text-primary">
            <span>Leyenda de Rangos:</span>
            <span className="text-emerald-500">🟢 Bajo (0-33)</span>
            <span className="text-amber-500">🟡 Medio (34-66)</span>
            <span className="text-red-500">🔴 Alto (67-100)</span>
          </div>
        </div>
      )}

      {/* Grid principal responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Columna Izquierda: Gauge + Banner de Alertas */}
        <div className="space-y-6 w-full">
          <div
            className={`rounded-2xl border bg-surface p-6 transition-all duration-300 ${
              score && score > 66
                ? 'border-risk-high border-l-4 risk-high-glow'
                : score && score > 33
                  ? 'border-risk-moderate border-l-4 risk-amber-glow'
                  : 'border-border shadow-lg'
            }`}
          >
            <RiskGauge score={score || 0} />
            <SignalBreakdown signals={signals} />

            {/* Leyenda */}
            <div className="mt-4 pt-3.5 border-t border-border/50 flex justify-around text-[10px] font-bold text-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30"></span>
                <span>Bajo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-md shadow-amber-500/30"></span>
                <span>Moderado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-md shadow-red-500/30"></span>
                <span>Alto Peligro</span>
              </div>
            </div>
          </div>

          <RiskLevelBanner score={score || 0} />
        </div>

        {/* Columna Derecha: Stats + Enlace Mapa + Chart */}
        <div className="space-y-6 w-full">
          <QuickStats stats={quickStats} />

          {/* Enlace Mapa */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden relative group shadow-lg">
            <div className="h-32 bg-slate-950 flex items-center justify-center relative border-b border-border">
              <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              <div className="text-center z-10 space-y-1 p-4">
                <div className="inline-flex p-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 mb-1 group-hover:scale-110 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-text-primary">Abrir mapa satelital interactivo</div>
                <div className="text-[10px] text-text-muted leading-relaxed">
                  Toca para ver las quebradas inestables y las rutas de evacuación recomendadas
                </div>
              </div>

              {/* Marcador animado */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </div>
            </div>
            <Link
              href="/mapa"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700/80 text-text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-t border-border/50"
            >
              Ver Mapa Satelital y Escapes →
            </Link>
          </div>

          <HistoricalChart
            data={historicalFlows}
            title="Comparativa de Caudal — Río Rímac"
          />
        </div>

      </div>

      {/* Plan de Evacuación IA a ancho completo */}
      <div className="w-full">
        <EvacuationPlanCard steps={recommendations} />
      </div>
      
    </div>
  )
}
