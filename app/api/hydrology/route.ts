import { NextResponse } from "next/server"
import { createSupabaseHydrologyRepository } from "@/modules/hydrology/infrastructure/SupabaseHydrologyRepository"
import { getRiverFlows } from "@/modules/hydrology/application/getRiverFlows"

export async function GET() {
  try {
    const hydrologyRepo = createSupabaseHydrologyRepository()
    const flows = await getRiverFlows(hydrologyRepo)

    return NextResponse.json({ flows })
  } catch (error: any) {
    console.error("Error en API de hidrología:", error)
    // Fallback de resiliencia
    const fallbackData = [
      { name: "Hoy", value: 312, color: "#3b82f6", isDashed: false },
      { name: "Pico 2017", value: 489, color: "#ef4444", isDashed: true },
      { name: "Pico 2023", value: 401, color: "#f59e0b", isDashed: true },
    ]
    return NextResponse.json({ flows: fallbackData, error: error?.message })
  }
}
