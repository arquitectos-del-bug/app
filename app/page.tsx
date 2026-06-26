'use client'

import { TopBar } from '@/components/sections/shared/TopBar'
import { BottomNav } from '@/components/sections/shared/BottomNav'
import { RiskDashboardView } from '@/components/sections/risk/RiskDashboardView'

export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <TopBar location="Lurigancho-Chosica, Lima" />
      <RiskDashboardView />
      <BottomNav />
    </div>
  )
}
