'use client'

import { useState } from 'react'
import { AlertTriangle, X, CheckCircle2, Zap } from 'lucide-react'
import type { ReportType } from '@/types/community'

interface ReportButtonProps {
  onSubmit: (tipo: ReportType, descripcion: string, distrito: string) => Promise<void>
  onSeedDemo?: () => Promise<void>
  distrito: string
}

const TIPOS: { key: ReportType; emoji: string; label: string; color: string }[] = [
  { key: 'huaico',   emoji: '🌊', label: 'Huaico',      color: 'border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20' },
  { key: 'desborde', emoji: '💧', label: 'Desborde',     color: 'border-blue-500 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' },
  { key: 'bloqueo',  emoji: '🚧', label: 'Bloqueo vial', color: 'border-amber-500 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' },
]

type DoneState = 'none' | 'report' | 'seed'

export function ReportButton({ onSubmit, onSeedDemo, distrito }: ReportButtonProps) {
  const [open, setOpen]           = useState(false)
  const [tipo, setTipo]           = useState<ReportType | null>(null)
  const [desc, setDesc]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [seeding, setSeeding]     = useState(false)
  const [done, setDone]           = useState<DoneState>('none')

  const resetModal = () => {
    setOpen(false)
    setDone('none')
    setTipo(null)
    setDesc('')
  }

  const handleSubmit = async () => {
    if (!tipo) return
    setSubmitting(true)
    try {
      await onSubmit(tipo, desc, distrito)
      setDone('report')
      setTimeout(resetModal, 2200)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSeed = async () => {
    if (!onSeedDemo) return
    setSeeding(true)
    try {
      await onSeedDemo()
      setDone('seed')
      setTimeout(resetModal, 2500)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <>
      {/* FAB principal */}
      <button
        onClick={() => setOpen(true)}
        title="Reportar emergencia"
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-900/40 transition-all"
      >
        <AlertTriangle className="w-4 h-4" />
        Reportar
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white text-base">Reportar emergencia</h3>
              </div>
              <button onClick={resetModal} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Done: reporte único */}
            {done === 'report' && (
              <div className="flex flex-col items-center gap-3 py-10 text-center px-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <p className="font-bold text-white">¡Reporte enviado!</p>
                <p className="text-xs text-slate-400">Tu aviso ayuda a otros ciudadanos de la zona.</p>
              </div>
            )}

            {/* Done: seed demo */}
            {done === 'seed' && (
              <div className="flex flex-col items-center gap-3 py-10 text-center px-6">
                <div className="text-4xl">🚨</div>
                <p className="font-bold text-white">¡7 reportes simulados!</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El umbral se activó. Revisa el banner de alerta comunitaria y los marcadores en el mapa.
                </p>
              </div>
            )}

            {/* Formulario normal */}
            {done === 'none' && (
              <div className="p-5 space-y-4">

                {/* Tipo */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">¿Qué ocurre?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTipo(t.key)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all ${t.color} ${
                          tipo === t.key ? 'ring-2 ring-offset-1 ring-offset-[#0f172a] ring-current scale-105' : ''
                        }`}
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Descripción{' '}
                    <span className="text-slate-600 font-normal normal-case">(opcional)</span>
                  </p>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Ej: Barro cubre la pista altura cuadra 3..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                </div>

                {/* Distrito */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>📍</span>
                  <span className="truncate">{distrito || 'Ubicación actual'}</span>
                </div>

                {/* Submit real */}
                <button
                  onClick={handleSubmit}
                  disabled={!tipo || submitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                >
                  {submitting ? 'Enviando...' : 'Enviar reporte'}
                </button>

                {/* Divisor demo */}
                {onSeedDemo && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-700" />
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">demo</span>
                      <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Botón simulación */}
                    <button
                      onClick={handleSeed}
                      disabled={seeding}
                      className="w-full py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 disabled:opacity-40 text-violet-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {seeding ? 'Simulando...' : 'Simular 7 reportes y disparar alerta'}
                    </button>
                    <p className="text-[10px] text-slate-600 text-center -mt-2">
                      Inserta 7 reportes demo en tu zona para mostrar la alerta comunitaria
                    </p>
                  </>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
