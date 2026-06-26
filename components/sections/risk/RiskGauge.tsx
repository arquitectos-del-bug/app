'use client'

import { useMemo } from 'react'

interface RiskGaugeProps {
  score: number
  maxScore?: number
}

export function RiskGauge({ score, maxScore = 100 }: RiskGaugeProps) {
  // Calculate stroke dash for the arc (270-degree arc)
  const circumference = 2 * Math.PI * 45 // radius = 45
  const arcLength = (270 / 360) * circumference
  const offset = arcLength * (1 - score / maxScore)

  // Determine color based on score
  const getColor = (s: number) => {
    if (s < 34) return '#22c55e' // green
    if (s < 67) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const color = getColor(score)

  // Level label
  const getLevel = (s: number) => {
    if (s < 34) return 'BAJO RIESGO'
    if (s < 67) return 'RIESGO MODERADO'
    return 'ALTO RIESGO'
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* SVG Circular Gauge */}
      <svg
        width="200"
        height="180"
        viewBox="0 0 160 160"
        className="overflow-visible"
      >
        {/* Background arc (gray) */}
        <path
          d="M 80 20 A 60 60 0 0 1 138 120"
          fill="none"
          stroke="#475569"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Animated progress arc */}
        <defs>
          <style>{`
            @keyframes dash {
              from {
                stroke-dashoffset: ${arcLength};
              }
              to {
                stroke-dashoffset: ${offset};
              }
            }
            .gauge-arc {
              animation: dash 1.5s ease-out forwards;
              transition: stroke 0.3s ease;
            }
          `}</style>
        </defs>

        <path
          d="M 80 20 A 60 60 0 0 1 138 120"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength}
          className="gauge-arc"
          filter="drop-shadow(0 0 8px rgba(239, 68, 68, 0.3))"
        />
      </svg>

      {/* Score Display */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <div className="text-5xl font-bold text-primary">{score}</div>
        <div
          className="text-lg font-semibold"
          style={{ color }}
        >
          {getLevel(score)}
        </div>
      </div>
    </div>
  )
}
