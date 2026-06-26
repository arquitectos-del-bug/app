'use client'

import { AlertTriangle } from 'lucide-react'

interface RiskLevelBannerProps {
  score: number
}

export function RiskLevelBanner({ score }: RiskLevelBannerProps) {
  const shouldShow = score > 66

  if (!shouldShow) return null

  return (
    <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3 pulse-risk my-4">
      <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-bold text-red-400 text-sm">EVACUACIÓN RECOMENDADA</div>
        <div className="text-xs text-red-300 mt-0.5">Sigue el plan de evacuación inmediatamente</div>
      </div>
    </div>
  )
}
