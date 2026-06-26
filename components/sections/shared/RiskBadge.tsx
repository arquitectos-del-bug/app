'use client'

interface RiskBadgeProps {
  level: 'BAJO' | 'MODERADO' | 'ALTO'
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export function RiskBadge({ level, size = 'md', animate = false }: RiskBadgeProps) {
  const levelConfig = {
    BAJO: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    MODERADO: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    ALTO: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  }

  const config = levelConfig[level]

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border font-semibold ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} ${animate ? 'pulse-risk' : ''}`}
    >
      {level}
    </div>
  )
}
