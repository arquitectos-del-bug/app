'use client'

interface StatCard {
  id: string
  icon: string
  label: string
  value: string
  unit: string
  badge?: string
  status: 'red' | 'amber' | 'green' | 'slate'
}

interface QuickStatsProps {
  stats: StatCard[]
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statusBorders = {
    red: 'border-red-500/30 bg-red-500/10',
    amber: 'border-amber-500/30 bg-amber-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    slate: 'border-slate-600 bg-slate-800/50',
  }

  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`rounded-xl border p-3 text-center ${statusBorders[stat.status]}`}
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-xs text-text-muted mb-2 truncate">{stat.label}</div>
          <div className="text-lg font-bold text-text-primary">{stat.value}</div>
          <div className="text-xs text-text-muted">{stat.unit}</div>
          {stat.badge && (
            <div className="text-xs font-semibold text-red-400 mt-1">{stat.badge}</div>
          )}
        </div>
      ))}
    </div>
  )
}
