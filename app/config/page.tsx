'use client'

import { TopBar } from '@/components/sections/shared/TopBar'
import { BottomNav } from '@/components/sections/shared/BottomNav'
import { ConfigView } from '@/components/sections/config/ConfigView'

export default function ConfigPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <TopBar location="Lurigancho-Chosica, Lima" />
      <ConfigView />
      <BottomNav />
    </div>
  )
}
