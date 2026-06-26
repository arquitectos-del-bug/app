'use client'

interface Signal {
  icon: string
  label: string
  value: number
  status: 'red' | 'amber' | 'green' | 'slate'
  description: string
}

interface SignalBreakdownProps {
  signals: Signal[]
}

export function SignalBreakdown({ signals }: SignalBreakdownProps) {
  const statusColors = {
    red: 'bg-risk-high/10 text-risk-high border-risk-high/20',
    amber: 'bg-risk-moderate/10 text-risk-moderate border-risk-moderate/20',
    green: 'bg-risk-low/10 text-risk-low border-risk-low/20',
    slate: 'bg-muted text-text-muted border-border',
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {signals.map((signal) => (
        <div
          key={signal.label}
          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${statusColors[signal.status || 'slate']}`}
        >
          <span>{signal.icon}</span>
          <span className="truncate">
            {signal.label}: {signal.description}
          </span>
        </div>
      ))}
    </div>
  )
}
