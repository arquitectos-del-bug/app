'use client'

import { useState } from 'react'
import { Trash2, Plus, Edit2 } from 'lucide-react'
import { settingsData } from '@/lib/mock-data'

export function ConfigView() {
  const [pushEnabled, setPushEnabled] = useState(settingsData.alerts.pushNotifications)
  const [vibrationEnabled, setVibrationEnabled] = useState(
    settingsData.alerts.vibration
  )
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(
    settingsData.alerts.autoUpdate
  )

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Section: Saved Locations */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Mi ubicación guardada
          </h2>
          <div className="space-y-2">
            {settingsData.savedLocations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between bg-surface border border-border rounded-lg p-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{location.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{location.name}</div>
                    <div className="text-xs text-text-muted">{location.location}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded transition-colors text-text-muted hover:text-text-primary"
                    aria-label="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-text-muted hover:text-red-400"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border rounded-lg text-text-muted hover:text-text-primary hover:border-primary transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              Agregar ubicación
            </button>
          </div>
        </section>

        {/* Section: Alerts */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Alertas
          </h2>
          <div className="space-y-3 bg-surface border border-border rounded-lg p-4">
            {/* Push Notifications */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-text-primary">Alertas push</span>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary rounded"
              />
            </label>

            {/* Vibration */}
            <label className="flex items-center justify-between cursor-pointer border-t border-border pt-3">
              <span className="text-sm text-text-primary">Vibración en riesgo alto</span>
              <input
                type="checkbox"
                checked={vibrationEnabled}
                onChange={(e) => setVibrationEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary rounded"
              />
            </label>

            {/* Auto Update */}
            <label className="flex items-center justify-between cursor-pointer border-t border-border pt-3">
              <div>
                <span className="text-sm text-text-primary block">
                  Actualización automática
                </span>
                <span className="text-xs text-text-muted">cada 10 min</span>
              </div>
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                className="w-5 h-5 accent-primary rounded"
              />
            </label>
          </div>
        </section>

        {/* Section: About */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3 uppercase tracking-wide">
            Sobre YakuAlert
          </h2>
          <div className="bg-surface border border-border rounded-lg p-4 space-y-3 text-sm">
            <div>
              <div className="text-text-muted mb-1">Motor de riesgo</div>
              <div className="text-text-primary">
                v{settingsData.about.version} — Reglas explicables, sin IA opaca
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-text-muted mb-1">Fuentes de datos</div>
              <div className="text-text-primary">{settingsData.about.dataSource}</div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-text-muted mb-1">Proyecto</div>
              <div className="text-text-primary text-xs leading-relaxed">
                {settingsData.about.project}
              </div>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-xs text-text-muted text-center pt-4 border-t border-border mt-8">
          <p>
            YakuAlert es una herramienta de información pública. Verifica siempre
            con autoridades locales.
          </p>
        </div>
      </div>
    </div>
  )
}
