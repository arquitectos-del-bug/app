'use client'

import { useState, useEffect } from 'react'
import { historicalEventsData } from '@/lib/mock-data'
import { HistoricalChart } from '../risk/HistoricalChart'
import { RefreshCw } from 'lucide-react'

export function HistoryView() {
  const [activeTab, setActiveTab] = useState<'precipitation' | 'flow' | 'alerts'>(
    'precipitation'
  )
  const [historicalFlows, setHistoricalFlows] = useState([
    { name: 'Hoy', value: 312, color: '#3b82f6', isDashed: false },
    { name: 'Pico 2017', value: 489, color: '#ef4444', isDashed: true },
    { name: 'Pico 2023', value: 401, color: '#f59e0b', isDashed: true },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHydrology() {
      try {
        const res = await fetch('/api/hydrology')
        if (res.ok) {
          const data = await res.json()
          if (data.flows) {
            setHistoricalFlows(data.flows)
          }
        }
      } catch (e) {
        console.error('Error loading history flows:', e)
      } finally {
        setLoading(false)
      }
    }
    loadHydrology()
  }, [])

  const tabs = [
    { id: 'precipitation', label: 'Caudal del Río' },
    { id: 'flow', label: 'Lluvia 48h' },
    { id: 'alerts', label: 'Quebradas' },
  ]

  // Encontrar valores para la tabla dinámica
  const caudalHoy = historicalFlows.find((f) => f.name === 'Hoy')?.value || 312
  const caudal2017 = historicalFlows.find((f) => f.name === 'Pico 2017')?.value || 489
  const caudal2023 = historicalFlows.find((f) => f.name === 'Pico 2023')?.value || 401

  const dynamicEvents = historicalEventsData.map((event) => {
    if (event.year === '2017') return { ...event, peakFlow: `${caudal2017} m³/s` }
    if (event.year === '2023') return { ...event, peakFlow: `${caudal2023} m³/s` }
    return { ...event, peakFlow: `${caudalHoy} m³/s` }
  })

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
        <h1 className="text-xl font-bold text-text-primary">Comparativa histórica</h1>
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Lado izquierdo (Main): Gráfico y Tabla (ocupa col-span-2 en escritorio) */}
        <div className="lg:col-span-2 space-y-6 w-full">
          {/* Chart */}
          {loading ? (
            <div className="bg-surface border border-border rounded-2xl p-8 flex items-center justify-center min-h-[220px]">
              <div className="text-center text-text-muted space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p className="text-xs">Cargando caudales históricos de Supabase...</p>
              </div>
            </div>
          ) : (
            <HistoricalChart
              data={historicalFlows}
              title="Caudal histórico — Río Rímac (m³/s)"
              maxValue={550}
            />
          )}

          {/* Historical Table */}
          <div className="rounded-xl bg-surface border border-border overflow-hidden shadow-lg">
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left px-4 py-3.5 text-text-muted font-black text-xs uppercase tracking-widest font-heading">
                      Evento
                    </th>
                    <th className="text-right px-4 py-3.5 text-text-muted font-black text-xs uppercase tracking-widest font-heading">
                      Pico lluvia
                    </th>
                    <th className="text-right px-4 py-3.5 text-text-muted font-black text-xs uppercase tracking-widest font-heading">
                      Pico caudal
                    </th>
                    <th className="text-right px-4 py-3.5 text-text-muted font-black text-xs uppercase tracking-widest font-heading">
                      Impacto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicEvents.map((event, idx) => (
                    <tr key={idx} className="border-b border-border/40 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-text-primary text-xs">
                        {event.event}
                      </td>
                      <td className="px-4 py-3.5 text-right text-text-muted text-xs">
                        {event.peakRainfall}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs">
                        <span
                          className={`font-mono font-bold ${
                            idx === 0
                              ? 'text-risk-high'
                              : idx === 1
                                ? 'text-risk-moderate'
                                : 'text-primary'
                          }`}
                        >
                          {event.peakFlow}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-text-muted text-xs">
                        {event.deaths}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lado derecho (Sidebar de información): Pestañas y detalles */}
        <div className="space-y-6 w-full">
          {/* Tab Navigation - En escritorio actúa como menú vertical */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-lg">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest pb-2 border-b border-border/40">
              Filtro de Comparativa
            </h2>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'precipitation' | 'flow' | 'alerts')}
                  className={`flex-1 lg:w-full text-center lg:text-left px-4 py-3 text-xs font-bold rounded-xl transition-all border whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-transparent text-text-muted border-border hover:text-text-primary hover:bg-slate-500/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detalle de la categoría seleccionada */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg min-h-[160px] flex flex-col justify-center">
            {activeTab === 'precipitation' && (
              <div className="text-center space-y-3">
                <span className="text-4xl">🌊</span>
                <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">Caudal Fluvial</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Lecturas del volumen de agua por segundo del Río Rímac. Los picos muestran las crecidas críticas registradas en los desastres de 2017 y 2023.
                </p>
              </div>
            )}

            {activeTab === 'flow' && (
              <div className="text-center space-y-3">
                <span className="text-4xl animate-bounce">🌧️</span>
                <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">Lluvias Registradas</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Historial de precipitaciones acumuladas en Chosica y Santa Eulalia. La saturación del suelo aumenta drásticamente el riesgo de huaicos.
                </p>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="text-center space-y-3">
                <span className="text-4xl">📡</span>
                <h3 className="font-bold text-xs text-text-primary uppercase tracking-wide">Zonas Críticas</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Registro georeferenciado de la activación de quebradas críticas (Quirio, Carossio, Pedregal) y desbordes históricos.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
