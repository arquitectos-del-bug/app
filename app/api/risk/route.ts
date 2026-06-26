import { NextResponse } from "next/server"
import { createNominatimGeocodingRepository } from "@/modules/location/infrastructure/NominatimGeocodingRepository"
import { getDistrictName } from "@/modules/location/application/getDistrictName"
import { createLocalDangerZonesRepository } from "@/modules/risk/infrastructure/LocalDangerZonesRepository"
import { createOpenMeteoRainfallRepository } from "@/modules/risk/infrastructure/OpenMeteoRainfallRepository"
import { calculateRisk } from "@/modules/risk/application/calculateRisk"

async function queryWfsSpatialAlert(lat: number, lon: number): Promise<boolean> {
  const typeName = "g_prono_pp_24h:view_aviso24h"
  const url = `https://idesep.senamhi.gob.pe/geoserver/g_prono_pp_24h/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=${typeName}&outputFormat=application/json&cql_filter=INTERSECTS(geom, POINT(${lon} ${lat}))`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "YakuAlert-App" },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return false

    const data = await response.json() as { features?: { properties: Record<string, string> }[] }

    if (data.features && data.features.length > 0) {
      const nivel = data.features[0].properties?.nivel ?? ""
      return nivel.includes("3") || nivel.includes("4")
    }

    return false
  } catch (err) {
    console.error("Error al consultar WFS GeoServer del SENAMHI:", err)
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lat, lon } = body

    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json({ error: "Latitud y Longitud deben ser números" }, { status: 400 })
    }

    // 1. Obtener distrito
    const geocodingRepo = createNominatimGeocodingRepository()
    const districtName = await getDistrictName(geocodingRepo, lat, lon)

    // 2. Consulta espacial en vivo al WFS de SENAMHI
    const alertaActiva = await queryWfsSpatialAlert(lat, lon)

    // 3. Ejecutar cálculo de riesgo
    const dangerZonesRepo = createLocalDangerZonesRepository()
    const rainfallRepo = createOpenMeteoRainfallRepository()

    const result = await calculateRisk(dangerZonesRepo, rainfallRepo, lat, lon, alertaActiva)
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
