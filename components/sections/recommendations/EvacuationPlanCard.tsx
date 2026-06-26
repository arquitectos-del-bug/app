'use client'

import { RotateCcw } from 'lucide-react'

interface EvacuationStep {
  id: number
  icon: string
  title: string
  description: string
}

interface EvacuationPlanCardProps {
  steps: EvacuationStep[]
}

export function EvacuationPlanCard({ steps }: EvacuationPlanCardProps) {
  return (
    <div className="rounded-xl bg-surface border border-border p-4 my-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-text-primary mb-0.5">
            🤖 Plan de evacuación — IA
          </div>
          <div className="text-xs text-text-muted">Claude Haiku</div>
        </div>
        <button
          className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Actualizar plan"
        >
          <RotateCcw className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-3">
            <div className="text-2xl flex-shrink-0">{step.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-text-primary">
                {step.id}. {step.title}
              </div>
              <div className="text-xs text-text-muted mt-1 leading-relaxed">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border text-xs text-text-muted">
        Generado hace 3 min · actualizar
      </div>
    </div>
  )
}
