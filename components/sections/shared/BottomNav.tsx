'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map, BarChart3, Settings } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/mapa', label: 'Mapa', icon: Map },
    { href: '/historia', label: 'Historia', icon: BarChart3 },
    { href: '/config', label: 'Config', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border md:hidden">
      <div className="mx-auto max-w-sm px-4 flex justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-4 px-2 transition-colors text-xs font-medium gap-1 ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
