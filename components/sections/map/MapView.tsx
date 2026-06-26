'use client'

import { Search, ZoomIn, ZoomOut } from 'lucide-react'
import { mapLayersData } from '@/lib/mock-data'

export function MapView() {
  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden pb-24">
      {/* Full-screen map placeholder */}
      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
        <div className="text-center text-text-muted">
          <div className="text-2xl mb-2">🗺️</div>
          <div className="font-medium">Mapa — Lurigancho-Chosica</div>
          <div className="text-xs mt-1">En tiempo real</div>
        </div>

        {/* Mock map markers */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Alert markers */}
          <circle cx="40" cy="45" r="3" fill="#ef4444" opacity="0.8" />
          <circle cx="40" cy="45" r="6" fill="#ef4444" opacity="0.4" />
          <circle cx="65" cy="60" r="2.5" fill="#f59e0b" opacity="0.7" />
          <circle cx="65" cy="60" r="5" fill="#f59e0b" opacity="0.3" />
          <circle cx="30" cy="70" r="2.5" fill="#f59e0b" opacity="0.7" />
          <circle cx="30" cy="70" r="5" fill="#f59e0b" opacity="0.3" />
        </svg>
      </div>

      {/* Floating Search Bar - Top */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar lugar o dirección..."
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Floating Layer Control - Top Right */}
      <div className="absolute top-4 right-4 z-20 bg-surface border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <div className="font-semibold text-text-primary text-sm mb-3">Capas del mapa</div>
        <div className="space-y-2.5">
          {mapLayersData.map((layer) => (
            <label key={layer.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={layer.enabled}
                className="w-4 h-4 rounded border-border bg-slate-700 accent-primary"
              />
              <span className="text-2xl">{layer.icon}</span>
              <span className="text-sm text-text-primary flex-1">{layer.label}</span>
              {layer.warning && (
                <span className="text-xs text-text-muted">{layer.warning}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Floating Zoom Controls - Bottom Left */}
      <div className="absolute bottom-24 left-4 z-20 bg-surface border border-border rounded-lg overflow-hidden flex flex-col shadow-lg">
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-700 transition-colors text-text-primary font-bold border-b border-border"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center hover:bg-slate-700 transition-colors text-text-primary font-bold"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Bottom Sheet - Location Info */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 bg-surface border border-border rounded-t-2xl p-4 w-[calc(100%-2rem)] max-w-sm">
        <div className="space-y-3">
          <div>
            <div className="text-xs text-text-muted mb-1">Ubicación actual</div>
            <div className="text-lg font-semibold text-text-primary">
              Lurigancho-Chosica
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Nivel de riesgo</div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold">
              72 — ALTO
            </div>
          </div>
          <button className="w-full py-2.5 bg-primary hover:bg-blue-600 text-background font-semibold rounded-lg transition-colors text-sm mt-2">
            Ver detalle completo →
          </button>
        </div>
      </div>
    </div>
  )
}
