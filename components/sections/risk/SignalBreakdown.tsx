'use client'

interface Signal {
  icon: string
  label: string
  value: number
  status: 'red' | 'amber' | 'green'
  description: string
}

interface SignalBreakdownProps {
  signals: Signal[]
}

export function SignalBreakdown({ signals }: SignalBreakdownProps) {
  const statusColors = {
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {signals.map((signal) => (
        <div
          key={signal.label}
          className={`px-3 py-2 rounded-full border text-xs font-medium flex items-center gap-2 ${statusColors[signal.status]}`}
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
