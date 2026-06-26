'use client'

import { RiskGauge } from './RiskGauge'
import { QuickStats } from './QuickStats'
import { SignalBreakdown } from './SignalBreakdown'
import { RiskLevelBanner } from './RiskLevelBanner'
import { HistoricalChart } from './HistoricalChart'
import { EvacuationPlanCard } from '../recommendations/EvacuationPlanCard'
import {
  riskScoreData,
  quickStatsData,
  historicalComparisonData,
  evacuationPlanData,
} from '@/lib/mock-data'

export function RiskDashboardView() {
  return (
    <div className="pb-24">
      {/* Risk Gauge - Hero Element */}
      <div
        className={`rounded-xl border p-6 mx-4 mt-4 ${
          riskScoreData.score > 66
            ? 'bg-red-500/10 border-red-500/30 risk-high-glow'
            : 'bg-surface border-border'
        }`}
      >
        <RiskGauge score={riskScoreData.score} />
        <SignalBreakdown signals={riskScoreData.signals} />
      </div>

      {/* Evacuation Banner */}
      <div className="mx-4">
        <RiskLevelBanner score={riskScoreData.score} />
      </div>

      {/* Quick Stats */}
      <div className="mx-4">
        <QuickStats stats={quickStatsData} />
      </div>

      {/* Map Placeholder Card */}
      <div className="mx-4 rounded-xl bg-slate-900 border border-border overflow-hidden my-4">
        <div className="h-60 bg-slate-800 flex items-center justify-center relative">
          <div className="text-center text-text-muted">
            <div className="text-sm font-medium mb-1">🗺️ Mapa cargando...</div>
            <div className="text-xs">Visualización geoespacial en desarrollo</div>
          </div>

          {/* Mock markers */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="45" cy="35" r="4" fill="#ef4444" opacity="0.6" />
            <circle cx="45" cy="35" r="8" fill="#ef4444" opacity="0.3" />
            <circle cx="70" cy="60" r="3" fill="#f59e0b" opacity="0.5" />
            <circle cx="30" cy="70" r="3" fill="#f59e0b" opacity="0.5" />
          </svg>

          {/* Layer Controls - Top Right */}
          <div className="absolute top-3 right-3 bg-surface border border-border rounded-lg p-2 text-xs space-y-2 max-w-[120px]">
            <div className="font-semibold text-text-primary mb-2">Capas</div>
            {[
              { icon: '🔴', label: 'Alertas 24h' },
              { icon: '🟠', label: 'SENAMHI' },
              { icon: '🟣', label: 'Cauces' },
            ].map((layer) => (
              <div key={layer.label} className="flex items-center gap-2 text-text-muted">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3 h-3"
                  aria-label={layer.label}
                />
                <span>{layer.icon}</span>
                <span className="truncate text-xs">{layer.label}</span>
              </div>
            ))}
          </div>

          {/* Zoom Controls - Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-surface border border-border rounded-lg p-1 flex flex-col gap-1">
            <button
              className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded text-text-primary text-sm font-bold"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded text-text-primary text-sm font-bold"
              aria-label="Zoom out"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Historical Comparison */}
      <div className="mx-4">
        <HistoricalChart
          data={historicalComparisonData}
          title="Comparativa histórica — Río Rímac"
        />
      </div>

      {/* AI Evacuation Plan */}
      <div className="mx-4">
        <EvacuationPlanCard steps={evacuationPlanData} />
      </div>
    </div>
  )
}
