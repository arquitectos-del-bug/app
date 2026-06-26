'use client'

import { useLocation } from '@/context/LocationContext'
import { Droplet, MapPin, AlertTriangle, RefreshCw } from 'lucide-react'

interface LocationGateProps {
  children: React.ReactNode
}

const MOCK_PRESETS = [
  { name: '🏔️ Quebrada Quirio (Riesgo Alto - Chosica)', lat: -11.9345, lon: -76.6912, distrito: 'Lurigancho-Chosica, Lima' },
  { name: '🏔️ Quebrada Carossio (Riesgo Alto - Chosica)', lat: -11.9312, lon: -76.6845, distrito: 'Lurigancho-Chosica, Lima' },
  { name: '🏔️ Quebrada Pedregal (Riesgo Alto - Chosica)', lat: -11.9423, lon: -76.6778, distrito: 'Lurigancho-Chosica, Lima' },
  { name: '⛰️ Santa Eulalia (Riesgo Medio)', lat: -11.9178, lon: -76.6256, distrito: 'Santa Eulalia, Huarochirí' },
  { name: '🏛️ Centro de Lima (Riesgo Bajo - Seguro)', lat: -12.0463, lon: -77.0310, distrito: 'Cercado de Lima, Lima' }
]

export function LocationGate({ children }: LocationGateProps) {
  const { lat, loading, error, setSimulatedLocation } = useLocation()

  if (lat !== null) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8 text-center overflow-y-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
        <Droplet className="w-8 h-8 text-primary fill-primary/30" />
      </div>

      <h1 className="text-2xl font-black text-text-primary tracking-wider font-heading mb-1">
        YakuAlert
      </h1>
      <p className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-8">
        Sistema de Alerta Temprana
      </p>

      {error ? (
        <>
          <div className="bg-surface border border-risk-high/30 rounded-2xl p-6 max-w-xs w-full mb-6 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-risk-high/10 border border-risk-high/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-risk-high" />
            </div>
            <h2 className="text-base font-bold text-text-primary mb-2">
              Acceso denegado
            </h2>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Bloqueaste el acceso a tu ubicación. Para usar YakuAlert debes habilitarla manualmente en tu navegador.
            </p>
            <div className="bg-secondary border border-border rounded-xl p-3 text-left space-y-1.5">
              <p className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Cómo activarlo:</p>
              <p className="text-[10px] text-text-muted">1. Toca el icono de candado en la barra del navegador</p>
              <p className="text-[10px] text-text-muted">2. Busca "Ubicación" y cámbialo a "Permitir"</p>
              <p className="text-[10px] text-text-muted">3. Recarga la página</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3.5 bg-surface hover:bg-secondary border border-border text-text-primary font-bold tracking-wider rounded-xl transition-all text-sm mb-4"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </>
      ) : (
        <>
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-xs w-full mb-6 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-text-primary mb-2">
              Necesitamos tu ubicación
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              YakuAlert calcula el riesgo real de huaicos e inundaciones usando tu posición GPS exacta.
              Sin ella, no podemos darte alertas precisas.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-black tracking-wider rounded-xl transition-all shadow-lg shadow-primary/20 uppercase text-sm mb-4"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Permitir acceso a ubicación
              </>
            )}
          </button>
        </>
      )}

      {/* Simulator Preset Selection */}
      <div className="w-full max-w-xs mt-2">
        <div className="relative flex py-3 items-center text-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-[10px] text-text-muted uppercase tracking-wider font-bold">
            Simulador de Ubicación
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="space-y-2 mt-2">
          {MOCK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setSimulatedLocation(preset.lat, preset.lon, preset.distrito)}
              className="w-full text-left px-4 py-2.5 bg-surface hover:bg-secondary border border-border rounded-xl text-xs text-text-primary transition-all flex items-center justify-between group shadow-sm"
            >
              <span className="font-semibold text-text-muted group-hover:text-text-primary transition-colors">
                {preset.name.split(' (')[0].replace(/🏔️ |⛰️ |🏛️ /, '')}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                preset.name.includes('Alto') 
                  ? 'text-red-400 bg-red-500/10 border-red-500/20' 
                  : preset.name.includes('Medio') 
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {preset.name.includes('Alto') ? 'Alto' : preset.name.includes('Medio') ? 'Medio' : 'Bajo'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!error && (
        <p className="text-[10px] text-text-muted mt-6 max-w-[240px]">
          Tu ubicación nunca se almacena en servidores externos. Solo se usa localmente.
        </p>
      )}
    </div>
  )
}

