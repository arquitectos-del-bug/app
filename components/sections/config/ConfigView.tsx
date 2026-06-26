'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Edit2, Check } from 'lucide-react'

const SETTINGS_KEY = 'yaku_settings'
const THEME_KEY = 'yaku_theme'

export function ConfigView() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Cargar configuración inicial
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Cargar ajustes
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setPushEnabled(!!parsed.alerts?.pushNotifications)
        setVibrationEnabled(parsed.alerts?.vibration !== false)
        setAutoUpdateEnabled(parsed.alerts?.autoUpdate !== false)
      } catch (e) {
        console.error('Error cargando yaku_settings:', e)
      }
    }

    // Cargar tema
    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Guardar configuración al cambiar
  const saveSettings = (updated: any) => {
    if (typeof window === 'undefined') return
    const newSettings = {
      alerts: {
        pushNotifications: updated.pushEnabled !== undefined ? updated.pushEnabled : pushEnabled,
        vibration: updated.vibrationEnabled !== undefined ? updated.vibrationEnabled : vibrationEnabled,
        autoUpdate: updated.autoUpdateEnabled !== undefined ? updated.autoUpdateEnabled : autoUpdateEnabled,
      },
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  const handlePushChange = (val: boolean) => {
    setPushEnabled(val)
    saveSettings({ pushEnabled: val })
  }

  const handleVibrationChange = (val: boolean) => {
    setVibrationEnabled(val)
    saveSettings({ vibrationEnabled: val })
  }

  const handleAutoUpdateChange = (val: boolean) => {
    setAutoUpdateEnabled(val)
    saveSettings({ autoUpdateEnabled: val })
  }

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  const savedLocations = [
    {
      id: 'home',
      icon: '🏠',
      name: 'Casa',
      location: 'Lurigancho-Chosica',
    },
  ]

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
        <h1 className="text-xl font-bold text-text-primary">Configuración</h1>
        {savedSuccess && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-fade-in border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> Guardado
          </span>
        )}
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Columna Izquierda: Tema y Alertas */}
        <div className="space-y-6 w-full">
          {/* Theme Selector */}
          <section className="bg-surface border border-border rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Tema de la Aplicación
            </h2>
            <div className="flex gap-2 bg-slate-500/5 border border-border/40 rounded-xl p-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-transparent text-text-muted border-transparent hover:text-text-primary'
                }`}
              >
                ☀️ Claro
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-transparent text-text-muted border-transparent hover:text-text-primary'
                }`}
              >
                🌙 Oscuro
              </button>
            </div>
          </section>

          {/* Alerts & Haptics */}
          <section className="bg-surface border border-border rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">
              Alertas y Hápticos
            </h2>
            <div className="space-y-3 pt-1">
              {/* Push Notifications */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-text-primary font-medium">Alertas push inmediatas</span>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => handlePushChange(e.target.checked)}
                  className="w-4.5 h-4.5 accent-primary rounded bg-slate-800 border-border"
                />
              </label>

              {/* Vibration */}
              <label className="flex items-center justify-between cursor-pointer border-t border-border/50 pt-3">
                <span className="text-xs text-text-primary font-medium">Vibración háptica en riesgo alto</span>
                <input
                  type="checkbox"
                  checked={vibrationEnabled}
                  onChange={(e) => handleVibrationChange(e.target.checked)}
                  className="w-4.5 h-4.5 accent-primary rounded bg-slate-800 border-border"
                />
              </label>

              {/* Auto Update */}
              <label className="flex items-center justify-between cursor-pointer border-t border-border/50 pt-3">
                <div>
                  <span className="text-xs text-text-primary font-medium block">
                    Actualización en segundo plano
                  </span>
                  <span className="text-[10px] text-text-muted">cada 10 min por satélite</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoUpdateEnabled}
                  onChange={(e) => handleAutoUpdateChange(e.target.checked)}
                  className="w-4.5 h-4.5 accent-primary rounded bg-slate-800 border-border"
                />
              </label>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Ubicaciones e Información */}
        <div className="space-y-6 w-full">
          {/* Saved Locations */}
          <section className="bg-surface border border-border rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold text-text-muted mb-3 uppercase tracking-widest">
              Ubicación de Referencia
            </h2>
            <div className="space-y-2">
              {savedLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between bg-background border border-border rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{location.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary text-sm">{location.name}</div>
                      <div className="text-xs text-text-muted">{location.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 hover:bg-slate-500/10 rounded-lg transition-colors text-text-muted hover:text-text-primary"
                      aria-label="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-text-muted hover:text-red-400"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border rounded-xl text-text-muted hover:text-text-primary hover:border-primary transition-colors text-xs font-semibold">
                <Plus className="w-4.5 h-4.5" />
                Agregar ubicación de emergencia
              </button>
            </div>
          </section>

          {/* Sobre YakuAlert */}
          <section className="bg-surface border border-border rounded-2xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold text-text-muted mb-3 uppercase tracking-widest">
              Sobre YakuAlert
            </h2>
            <div className="space-y-3 text-xs leading-relaxed text-text-muted">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Motor de riesgo</div>
                <div className="text-text-primary font-medium">
                  v1.2 — Algoritmo explicable con Haversine y Open-Meteo
                </div>
              </div>
              <div className="border-t border-border/50 pt-3">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Fuentes oficiales</div>
                <div className="text-text-primary font-medium">SENAMHI · COES · OpenStreetMap · INDECI</div>
              </div>
              <div className="border-t border-border/50 pt-3">
                <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">Proyecto Hackathon</div>
                <div className="text-text-primary font-medium">
                  Desarrollado para el Torneo de VibeCoding de DSC-PUCP, 2026.
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* Footer Note */}
      <div className="text-[10px] text-text-muted text-center pt-4 border-t border-border/50 mt-8">
        <p>
          YakuAlert es una plataforma de apoyo informativo. Siempre prioriza las
          órdenes directas de Defensa Civil y las autoridades locales.
        </p>
      </div>
    </div>
  )
}
