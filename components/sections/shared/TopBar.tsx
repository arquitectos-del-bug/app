'use client'

import { Droplet, MapPin } from 'lucide-react'

interface TopBarProps {
  location?: string
}

export function TopBar({ location = 'Lurigancho-Chosica, Lima' }: TopBarProps) {
  return (
    <div className="flex items-center justify-between bg-surface border-b border-border px-4 py-4">
      {/* Logo + Wordmark */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <Droplet className="w-5 h-5 fill-white" />
        </div>
        <span className="font-bold text-lg text-text-primary">YakuAlert</span>
      </div>

      {/* Location Chip */}
      <div className="flex items-center gap-1 bg-slate-700/50 rounded-full px-3 py-1.5 text-xs text-text-muted">
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px]">{location}</span>
      </div>
    </div>
  )
}
