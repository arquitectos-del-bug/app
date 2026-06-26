'use client'

import { TopBar } from '@/components/sections/shared/TopBar'
import { BottomNav } from '@/components/sections/shared/BottomNav'
import { HistoryView } from '@/components/sections/history/HistoryView'

export default function HistoryPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <TopBar location="Lurigancho-Chosica, Lima" />
      <HistoryView />
      <BottomNav />
    </div>
  )
}
