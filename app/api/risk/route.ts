import { NextResponse } from "next/server"
import { createNominatimGeocodingRepository } from "@/modules/location/infrastructure/NominatimGeocodingRepository"
import { getDistrictName } from "@/modules/location/application/getDistrictName"
import { createSupabaseAlertsRepository } from "@/modules/alerts/infrastructure/SupabaseAlertsRepository"
import { getActiveAlerts } from "@/modules/alerts/application/getActiveAlerts"
import { createLocalDangerZonesRepository } from "@/modules/risk/infrastructure/LocalDangerZonesRepository"
import { createOpenMeteoRainfallRepository } from "@/modules/risk/infrastructure/OpenMeteoRainfallRepository"
import { calculateRisk } from "@/modules/risk/application/calculateRisk"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lat, lon } = body

    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json({ error: "Latitud y Longitud deben ser números" }, { status: 400 })
    }

    // 1. Obtener distrito y región
    const geocodingRepo = createNominatimGeocodingRepository()
    const districtName = await getDistrictName(geocodingRepo, lat, lon)

    // 2. Obtener alertas activas de Supabase
    const alertsRepo = createSupabaseAlertsRepository()
    const activeAlerts = await getActiveAlerts(alertsRepo, districtName)
    const alertaActiva = activeAlerts.some((a) => a.nivel === "naranja" || a.nivel === "rojo")

    // 3. Ejecutar cálculo de riesgo
    const dangerZonesRepo = createLocalDangerZonesRepository()
    const rainfallRepo = createOpenMeteoRainfallRepository()

    const result = await calculateRisk(dangerZonesRepo, rainfallRepo, lat, lon, alertaActiva)

    // Obtener lluvia acumulada para el reporte
    const lluviaMm = await rainfallRepo.getRainfall48h(lat, lon)

    return NextResponse.json({
      score: result.score,
      nivel: result.nivel,
      desglose: {
        cauce: result.desglose.cauce,
        lluvia: result.desglose.lluvia,
        vulnerabilidad: result.desglose.vulnerabilidad,
        cauceCercano: result.desglose.cauceCercano,
        distanciaMetros: result.desglose.distanciaMetros,
      },
      distrito: districtName,
      lluviaMm,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error en API de riesgo:", error)
    // Degradación elegante en caso de fallo crítico en el servidor
    return NextResponse.json({
      score: 50,
      nivel: "MODERADO",
      desglose: {
        cauce: 20,
        lluvia: 20,
        vulnerabilidad: 10,
        cauceCercano: "Cauce Principal Rímac",
        distanciaMetros: 1200,
      },
      distrito: "Lurigancho-Chosica, Lima",
      lluviaMm: 15,
      timestamp: new Date().toISOString(),
      fallback: true,
      error: error?.message || "Internal Server Error",
    })
  }
}
