import { NextResponse } from "next/server"
import { createSupabaseAlertsRepository } from "@/modules/alerts/infrastructure/SupabaseAlertsRepository"
import { getActiveAlerts } from "@/modules/alerts/application/getActiveAlerts"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const distrito = searchParams.get("distrito") || ""

    const alertsRepo = createSupabaseAlertsRepository()
    const alerts = await getActiveAlerts(alertsRepo, distrito)

    return NextResponse.json({ alerts })
  } catch (error: any) {
    console.error("Error en API de alertas:", error)
    return NextResponse.json({ alerts: [], error: error?.message }, { status: 500 })
  }
}
