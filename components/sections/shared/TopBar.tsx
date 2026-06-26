'use client'

import { useState, useEffect } from 'react'
import { Droplet, MapPin, Sun, Moon, ChevronDown, Compass } from 'lucide-react'
import { useLocation } from '@/context/LocationContext'

interface TopBarProps {
  location?: string
}

const MOCK_PRESETS = [
  { name: '🏔️ Quebrada Quirio (Riesgo Alto - Chosica)', lat: -11.9345, lon: -76.6912, distrito: 'Lurigancho-Chosica, Lima' },
  { name: '🏔️ Quebrada Carossio (Riesgo Alto - Chosica)', lat: -11.9312, lon: -76.6845, distrito: 'Lurigancho-Chosica, Lima' },
  { name: '🏔️ Quebrada Pedregal (Riesgo Alto - Chosica)', lat: -11.9423, lon: -76.6778, distrito: 'Lurigancho-Chosica, Lima' },
  { name: '⛰️ Santa Eulalia (Riesgo Medio)', lat: -11.9178, lon: -76.6256, distrito: 'Santa Eulalia, Huarochirí' },
  { name: '🏛️ Centro de Lima (Riesgo Bajo - Seguro)', lat: -12.0463, lon: -77.0310, distrito: 'Cercado de Lima, Lima' }
]

export function TopBar({ location: propLocation }: TopBarProps) {
  const { distrito, loading, isMocked, setSimulatedLocation, resetLocation } = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)

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
    : distrito || propLocation || '—'

  return (
    <div className="flex items-center justify-between bg-surface border-b border-border px-4 py-4 z-25 relative">
      {/* Logo + Wordmark - Oculto en escritorio */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <Droplet className="w-5 h-5 fill-white" />
        </div>
        <span className="font-bold text-lg text-text-primary">YakuAlert</span>
      </div>

      {/* Espaciador en escritorio */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-2 relative">
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

        {/* Location Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none ${
              isMocked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 hover:bg-amber-500/20'
                : 'bg-slate-700/10 border-border/50 dark:bg-slate-700/50 text-text-muted hover:text-text-primary hover:border-border'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isMocked ? 'text-amber-500 dark:text-amber-400 animate-pulse' : 'text-primary'}`} />
            <span className="truncate max-w-[120px]" title={displayLocation}>
              {displayLocation.split(',')[0]}
            </span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              {/* Overlay invisible to close menu */}
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-xl z-40 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-border/50 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Simular Ubicación</span>
                  {isMocked && (
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">Simulado</span>
                  )}
                </div>

                {isMocked && (
                  <button
                    onClick={() => {
                      resetLocation()
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-primary hover:bg-primary/10 transition-colors font-bold border-b border-border/30 mb-1"
                  >
                    <Compass className="w-4 h-4" />
                    Usar Ubicación Real (GPS)
                  </button>
                )}

                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {MOCK_PRESETS.map((preset) => {
                    const isSelected = distrito === preset.distrito || (distrito && distrito.includes(preset.distrito.split(',')[0]))
                    return (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setSimulatedLocation(preset.lat, preset.lon, preset.distrito)
                          setMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-500/5 ${
                          isSelected ? 'text-primary font-bold bg-primary/5' : 'text-text-primary'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{preset.name.split(' (')[0].replace(/🏔️ |⛰️ |🏛️ /, '')}</span>
                          <span className="text-[9px] text-text-muted">{preset.distrito.split(',')[0]}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                          preset.name.includes('Alto') 
                            ? 'text-red-400 border-red-500/20 bg-red-500/5' 
                            : preset.name.includes('Medio') 
                              ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' 
                              : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                        }`}>
                          {preset.name.includes('Alto') ? 'Alto' : preset.name.includes('Medio') ? 'Medio' : 'Bajo'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

