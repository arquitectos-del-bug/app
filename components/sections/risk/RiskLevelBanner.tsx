'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface RiskLevelBannerProps {
  score: number
}

export function RiskLevelBanner({ score }: RiskLevelBannerProps) {
  const shouldShow = score > 66

  useEffect(() => {
    if (shouldShow && typeof window !== 'undefined' && navigator.vibrate) {
      // Verificar si la vibración está habilitada en la configuración
      try {
        const savedSettings = localStorage.getItem('yaku_settings')
        let vibrationEnabled = true
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          if (parsed.alerts?.vibration === false) {
            vibrationEnabled = false
          }
        }
        if (vibrationEnabled) {
          navigator.vibrate(500)
        }
      } catch (e) {
        console.error('No se pudo ejecutar vibración haptica:', e)
      }
    }
  }, [shouldShow])

  if (!shouldShow) return null

  return (
    <div className="w-full bg-risk-high/10 border border-risk-high/35 rounded-xl px-4 py-3 flex items-center gap-3 pulse-risk my-4 shadow-lg shadow-risk-high/5">
      <AlertTriangle className="w-6 h-6 text-risk-high flex-shrink-0" />
      <div className="flex-1">
        <div className="font-black font-heading text-risk-high text-sm tracking-wider">EVACUACIÓN RECOMENDADA</div>
        <div className="text-xs text-text-primary/95 font-medium mt-0.5">Sigue el plan de evacuación inmediatamente</div>
      </div>
    </div>
  )
}
