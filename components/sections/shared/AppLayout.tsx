'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, Settings, Droplet, Radio } from 'lucide-react'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { LocationProvider } from '@/context/LocationContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/mapa', label: 'Mapa', icon: Map },
    { href: '/config', label: 'Configuración', icon: Settings },
  ]

  return (
    <LocationProvider>
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* 1. SIDEBAR NAV - DESKTOP ONLY */}
      <aside className="hidden md:flex w-64 border-r border-border bg-surface flex-col justify-between sticky top-0 h-screen z-30 shadow-xl">
        <div className="flex flex-col pt-6 px-4">
          
          {/* Logo y Titular del Centro de Comando */}
          <div className="flex items-center gap-2 px-2 pb-6 border-b border-border/50">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base text-text-primary tracking-wider">YakuAlert</span>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Satélite Activo
              </span>
            </div>
          </div>

          {/* Menú de Navegación Vertical */}
          <nav className="mt-8 space-y-1.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10'
                      : 'bg-transparent text-text-muted border-transparent hover:text-text-primary hover:bg-slate-500/5'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-border/50 bg-slate-800/20 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-medium mb-1">
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            <span>Centro de Alerta Temprana</span>
          </div>
          <div className="text-[9px] text-text-muted opacity-80">
            v1.1 · DSC-PUCP 2026
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        
        {/* Barra superior común (responsiva interna) */}
        <TopBar />
        
        {/* Cuerpo del contenido de la página */}
        <main className="flex-1 w-full max-w-sm md:max-w-6xl mx-auto px-4 py-6 md:py-8">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM NAV - MOBILE ONLY */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
    </LocationProvider>
  )
}
