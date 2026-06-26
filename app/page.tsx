'use client'

import { AppLayout } from '@/components/sections/shared/AppLayout'
import { RiskDashboardView } from '@/components/sections/risk/RiskDashboardView'

export default function Page() {
  return (
    <AppLayout>
      <RiskDashboardView />
    </AppLayout>
  )
}
