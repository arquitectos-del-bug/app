import { NextResponse } from "next/server"
import { createAnthropicRecommendationsRepository } from "@/modules/recommendations/infrastructure/AnthropicRecommendationsRepository"
import { getRecommendations } from "@/modules/recommendations/application/getRecommendations"
import { createSupabaseHydrologyRepository } from "@/modules/hydrology/infrastructure/SupabaseHydrologyRepository"
import { createSupabaseAlertsRepository } from "@/modules/alerts/infrastructure/SupabaseAlertsRepository"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { score, nivel, distrito, lluviaMm, ptsCauce, ptsLluvia, ptsVuln } = body

    if (
      score === undefined ||
      !nivel ||
      !distrito ||
      lluviaMm === undefined ||
      ptsCauce === undefined ||
      ptsLluvia === undefined ||
      ptsVuln === undefined
    ) {
      return NextResponse.json({ error: "Faltan parámetros requeridos en el body" }, { status: 400 })
    }

    // 1. Obtener caudales de Supabase para contextualizar la IA
    const hydrologyRepo = createSupabaseHydrologyRepository()
    const flows = await hydrologyRepo.getRimacFlows()
    const caudalHoy = flows.find((f) => f.name === "Hoy")?.value || 312
    const caudal2017 = flows.find((f) => f.name === "Pico 2017")?.value || 489
    const caudal2023 = flows.find((f) => f.name === "Pico 2023")?.value || 401

    // 2. Obtener alertas de Supabase para contextualizar la IA
    const alertsRepo = createSupabaseAlertsRepository()
    const activeAlerts = await alertsRepo.getActiveAlerts(distrito)
    const alertaCOENText =
      activeAlerts.length > 0
        ? activeAlerts.map((a) => `Alerta ${a.nivel.toUpperCase()} por ${a.fuente}`).join(", ")
        : "Ninguna"

    // 3. Ejecutar recomendación
    const recommendationsRepo = createAnthropicRecommendationsRepository()
    const steps = await getRecommendations(recommendationsRepo, {
      score,
      nivel,
      distrito,
      lluviaMm,
      ptsCauce,
      ptsLluvia,
      ptsVuln,
      caudal: caudalHoy,
      caudal2017,
      caudal2023,
      alertaCOEN: alertaCOENText,
    })

    return NextResponse.json({ steps })
  } catch (error: any) {
    console.error("Error en API de recomendaciones:", error)
    // Fallback de resiliencia estática
    const level = "MODERADO"
    const staticSteps = [
      {
        id: 1,
        icon: "🎒",
        title: "Mochila a la mano",
        description: "Coloca tu mochila de emergencia cerca de la salida principal con botiquín y linternas.",
      },
      {
        id: 2,
        icon: "🚶",
        title: "Vías de evacuación",
        description: "Identifica las rutas seguras hacia zonas altas y mantente alejado del cauce del río.",
      },
      {
        id: 3,
        icon: "📞",
        title: "Alerta vecinal",
        description: "Sigue reportes oficiales y ten a la mano los números de Serenazgo y Bomberos.",
      },
    ]
    return NextResponse.json({ steps: staticSteps, fallback: true, error: error?.message })
  }
}
