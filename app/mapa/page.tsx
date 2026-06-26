'use client'

import { TopBar } from '@/components/sections/shared/TopBar'
import { BottomNav } from '@/components/sections/shared/BottomNav'
import { MapView } from '@/components/sections/map/MapView'

export default function MapPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <TopBar location="Lurigancho-Chosica, Lima" />
      <MapView />
      <BottomNav />
    </div>
  )
}
