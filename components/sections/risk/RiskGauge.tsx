'use client'

import { useMemo } from 'react'

interface RiskGaugeProps {
  score: number
  maxScore?: number
}

export function RiskGauge({ score, maxScore = 100 }: RiskGaugeProps) {
  // Calculate stroke dash for the arc (270-degree arc centered at 80,80 with radius 60)
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const arcLength = (270 / 360) * circumference
  const offset = arcLength * (1 - score / maxScore)

  // Determine dynamic color variable based on score
  const color = useMemo(() => {
    if (score < 34) return 'var(--risk-low)'
    if (score < 67) return 'var(--risk-moderate)'
    return 'var(--risk-high)'
  }, [score])

  // Get raw rgba color for dynamic filter glow
  const getGlowColor = (s: number) => {
    if (s < 34) return 'rgba(5, 255, 176, 0.25)'   // neon mint/green
    if (s < 67) return 'rgba(255, 159, 28, 0.25)'  // neon amber
    return 'rgba(255, 0, 85, 0.3)'                 // neon red
  }

  const glowColor = getGlowColor(score)

  // Level label
  const getLevel = (s: number) => {
    if (s < 34) return 'BAJO RIESGO'
    if (s < 67) return 'RIESGO MODERADO'
    return 'ALTO RIESGO'
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* SVG Circular Gauge */}
      <svg
        width="200"
        height="180"
        viewBox="0 0 160 160"
        className="overflow-visible"
      >
        {/* Background arc (gray) */}
        <path
          d="M 37.57 122.43 A 60 60 0 1 1 122.43 122.43"
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.5"
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
          d="M 37.57 122.43 A 60 60 0 1 1 122.43 122.43"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength}
          className="gauge-arc"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>

      {/* Score Display */}
      <div className="flex flex-col items-center gap-1 mt-2">
        <div className="text-5xl font-extrabold font-heading text-text-primary">{score}%</div>
        <div
          className="text-xs font-black tracking-widest uppercase font-heading"
          style={{ color }}
        >
          {getLevel(score)}
        </div>
      </div>
    </div>
  )
}
