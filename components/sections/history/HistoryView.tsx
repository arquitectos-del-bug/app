'use client'

import { useState } from 'react'
import { historicalEventsData, historicalComparisonData } from '@/lib/mock-data'
import { HistoricalChart } from '../risk/HistoricalChart'

export function HistoryView() {
  const [activeTab, setActiveTab] = useState<'precipitation' | 'flow' | 'alerts'>(
    'precipitation'
  )

  const tabs = [
    { id: 'precipitation', label: 'Precipitación' },
    { id: 'flow', label: 'Caudal' },
    { id: 'alerts', label: 'Alertas' },
  ]

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-text-primary">Comparativa histórica</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-background sticky top-16 z-10">
        <div className="mx-auto max-w-sm flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'precipitation' | 'flow' | 'alerts')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-text-muted border-transparent hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === 'precipitation' && (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex gap-2 justify-center flex-wrap">
              {['Mar 2017', 'Mar 2023', 'Hoy'].map((period) => (
                <button
                  key={period}
                  className="px-4 py-2 rounded-full bg-surface border border-border text-text-primary text-sm hover:border-primary transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Chart */}
            <HistoricalChart
              data={historicalComparisonData}
              title="Caudal histórico — Río Rímac (m³/s)"
              maxValue={550}
            />

            {/* Historical Table */}
            <div className="rounded-xl bg-surface border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-800/50">
                      <th className="text-left px-4 py-3 text-text-muted font-medium">
                        Evento
                      </th>
                      <th className="text-right px-4 py-3 text-text-muted font-medium">
                        Pico lluvia
                      </th>
                      <th className="text-right px-4 py-3 text-text-muted font-medium">
                        Pico caudal
                      </th>
                      <th className="text-right px-4 py-3 text-text-muted font-medium">
                        Víctimas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalEventsData.map((event, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border ${
                          idx === historicalEventsData.length - 1
                            ? ''
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-text-primary">
                          {event.event}
                        </td>
                        <td className="px-4 py-3 text-right text-text-muted">
                          {event.peakRainfall}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold ${
                              idx === 0
                                ? 'text-red-400'
                                : idx === 1
                                  ? 'text-amber-400'
                                  : 'text-blue-400'
                            }`}
                          >
                            {event.peakFlow}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-text-muted">
                          {event.deaths}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <div className="space-y-4 text-center py-8">
            <div className="text-3xl">📊</div>
            <div className="text-text-muted">
              Análisis de caudal en desarrollo
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4 text-center py-8">
            <div className="text-3xl">📢</div>
            <div className="text-text-muted">
              Registro de alertas históricas en desarrollo
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
