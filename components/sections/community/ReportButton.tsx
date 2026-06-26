'use client'

import { useState } from 'react'
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react'
import type { ReportType } from '@/types/community'

interface ReportButtonProps {
  onSubmit: (tipo: ReportType, descripcion: string, distrito: string) => Promise<void>
  distrito: string
}

const TIPOS: { key: ReportType; emoji: string; label: string; color: string }[] = [
  { key: 'huaico',   emoji: '🌊', label: 'Huaico',        color: 'border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20' },
  { key: 'desborde', emoji: '💧', label: 'Desborde',       color: 'border-blue-500 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' },
  { key: 'bloqueo',  emoji: '🚧', label: 'Bloqueo vial',   color: 'border-amber-500 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' },
]

export function ReportButton({ onSubmit, distrito }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState<ReportType | null>(null)
  const [desc, setDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!tipo) return
    setSubmitting(true)
    try {
      await onSubmit(tipo, desc, distrito)
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setDone(false)
        setTipo(null)
        setDesc('')
      }, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        title="Reportar emergencia"
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-xl shadow-red-900/40 transition-all"
      >
        <AlertTriangle className="w-4 h-4" />
        Reportar
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-white text-base">Reportar emergencia</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <p className="font-bold text-white">¡Reporte enviado!</p>
                <p className="text-xs text-slate-400">Tu aviso ayuda a otros ciudadanos de la zona.</p>
              </div>
            ) : (
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
                    Descripción <span className="text-slate-600 font-normal normal-case">(opcional)</span>
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

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!tipo || submitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                >
                  {submitting ? 'Enviando...' : 'Enviar reporte'}
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
