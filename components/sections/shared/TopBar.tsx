'use client'

import { useState, useEffect } from 'react'
import { Droplet, MapPin, Sun, Moon } from 'lucide-react'
import { useLocation } from '@/context/LocationContext'

interface TopBarProps {
  location?: string
}

export function TopBar({ location: propLocation }: TopBarProps) {
  const { distrito, loading } = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Cargar inicialización del tema
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedTheme = localStorage.getItem('yaku_theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Default a oscuro (command center vibe)
      document.documentElement.classList.add('dark')
      localStorage.setItem('yaku_theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('yaku_theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const displayLocation = loading
    ? 'Localizando...'
    : distrito || propLocation || 'Lurigancho-Chosica, Lima'

  return (
    <div className="flex items-center justify-between bg-surface border-b border-border px-4 py-4 z-20 relative">
      {/* Logo + Wordmark - Oculto en escritorio */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <Droplet className="w-5 h-5 fill-white" />
        </div>
        <span className="font-bold text-lg text-text-primary">YakuAlert</span>
      </div>

      {/* Espaciador en escritorio */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-slate-500/10 rounded-lg transition-colors text-text-muted hover:text-text-primary flex items-center justify-center border border-border/40"
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-500" />
          )}
        </button>

        {/* Location Chip */}
        <div className="flex items-center gap-1 bg-slate-700/10 border border-border/50 dark:bg-slate-700/50 rounded-full px-3 py-1.5 text-xs text-text-muted">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate max-w-[120px]" title={displayLocation}>
            {displayLocation}
          </span>
        </div>
      </div>
    </div>
  )
}
