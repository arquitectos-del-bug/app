'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useLocation } from '@/context/LocationContext'
import { useRiskScore } from '@/hooks/useRiskScore'
import { mapLayersData } from '@/lib/mock-data'

const LeafletMapContainer = dynamic(() => import('./LeafletMapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 grid-bg scanline flex flex-col items-center justify-center relative">
      <div className="text-center text-text-muted">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-sm font-semibold">Iniciando mapeo de cuencas en tiempo real...</div>
      </div>
    </div>
  ),
})

export function MapView() {
  const { lat, lon, distrito, loading: locLoading } = useLocation()
  const { score, nivel, loading: riskLoading } = useRiskScore(lat, lon)

  // Estados para las capas
  const [layers, setLayers] = useState({
    alerts24h: true,
    senamhiStations: true,
    historicRiverbeds: true,
  })

  const handleLayerChange = (id: string, checked: boolean) => {
    if (id === 'alerts-24h') setLayers((p) => ({ ...p, alerts24h: checked }))
    if (id === 'senamhi-stations') setLayers((p) => ({ ...p, senamhiStations: checked }))
    if (id === 'historic-riverbeds') setLayers((p) => ({ ...p, historicRiverbeds: checked }))
  }

  const isLoading = locLoading || riskLoading

  return (
    <div className="relative w-full h-[calc(100vh-56px)] bg-slate-950 overflow-hidden">
      {/* Mapa dinámico */}
      <div className="w-full h-full relative z-0">
        {!locLoading && lat !== null && lon !== null ? (
          <LeafletMapContainer
            userLat={lat}
            userLon={lon}
            userDistrito={distrito ?? ''}
            score={score || 50}
            nivel={nivel || 'MODERADO'}
            layers={layers}
          />
        ) : (
          <div className="w-full h-full bg-slate-950 grid-bg scanline flex flex-col items-center justify-center relative">
            <div className="text-center text-text-muted">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-sm font-semibold">Obteniendo coordenadas satelitales GPS...</div>
            </div>
          </div>
        )}
      </div>

      {/* Buscador flotante superior */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar lugar o quebrada..."
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-2xl"
          />
        </div>
      </div>

      {/* Panel flotante de capas */}
      <div className="absolute top-20 right-4 z-10 bg-surface border border-border rounded-xl p-3 shadow-2xl max-w-[170px]">
        <div className="font-bold text-text-primary text-xs mb-2.5 uppercase tracking-wider font-heading">
          Capas
        </div>
        <div className="space-y-2">
          {mapLayersData.map((layer) => {
            const isChecked =
              layer.id === 'alerts-24h'
                ? layers.alerts24h
                : layer.id === 'senamhi-stations'
                  ? layers.senamhiStations
                  : layers.historicRiverbeds

            return (
              <label key={layer.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleLayerChange(layer.id, e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border bg-secondary accent-primary"
                />
                <span className="text-base">{layer.icon}</span>
                <span className="text-xs text-text-primary truncate flex-1">{layer.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Tarjeta flotante inferior - Información de Riesgo en Vivo */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 bg-surface border border-border rounded-2xl p-4 w-[calc(100%-2rem)] max-w-sm shadow-2xl">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">
                Ubicación Satelital
              </div>
              <div className="text-base font-bold text-text-primary truncate max-w-[200px]">
                {isLoading ? 'Localizando...' : distrito}
              </div>
            </div>
            {!isLoading && (
              <span className="text-[10px] text-text-muted bg-secondary border border-border px-2 py-0.5 rounded-full font-mono">
                {lat?.toFixed(4)}, {lon?.toFixed(4)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-0.5">
                Nivel de peligro
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    score && score > 66
                      ? 'bg-risk-high animate-pulse shadow-md shadow-risk-high/30'
                      : score && score > 33
                        ? 'bg-risk-moderate shadow-md shadow-risk-moderate/30'
                        : 'bg-risk-low shadow-md shadow-risk-low/30'
                  }`}
                />
                <span className="text-sm font-extrabold font-heading text-text-primary">
                  {isLoading ? 'Calculando...' : `${score}% — ${nivel}`}
                </span>
              </div>
            </div>
            <Link
              href="/"
              className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-black tracking-wider rounded-lg transition-all text-xs shadow-md shadow-primary/20 uppercase"
            >
              Ver reporte →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
