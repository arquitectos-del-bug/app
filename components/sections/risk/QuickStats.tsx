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
    red: 'border-border bg-surface text-text-primary border-t-4 border-t-risk-high shadow-md',
    amber: 'border-border bg-surface text-text-primary border-t-4 border-t-risk-moderate shadow-md',
    green: 'border-border bg-surface text-text-primary border-t-4 border-t-risk-low shadow-md',
    slate: 'border-border bg-surface text-text-primary shadow-sm',
  }

  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`rounded-xl border p-3 text-center transition-all ${statusBorders[stat.status || 'slate']}`}
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1.5 truncate">{stat.label}</div>
          <div className="text-lg font-extrabold font-heading text-text-primary">{stat.value}</div>
          <div className="text-[10px] text-text-muted font-medium">{stat.unit}</div>
          {stat.badge && (
            <div className="text-[9px] font-black uppercase tracking-widest text-risk-high mt-1">{stat.badge}</div>
          )}
        </div>
      ))}
    </div>
  )
}
