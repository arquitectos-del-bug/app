import { RainfallRepository } from "../domain/RainfallRepository"

export function createOpenMeteoRainfallRepository(): RainfallRepository {
  return {
    getRainfall48h: async (lat: number, lon: number): Promise<number> => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&forecast_days=2`
        )
        if (!response.ok) {
          throw new Error(`Open-Meteo API error: ${response.statusText}`)
        }
        const data = await response.json()
        const hourlyPrecip = data.hourly?.precipitation || []
        // Sumar toda la precipitación acumulada de las 48h
        const totalPrecip = hourlyPrecip.reduce((acc: number, curr: number) => acc + (curr || 0), 0)
        return Math.round(totalPrecip * 10) / 10
      } catch (error) {
        console.error("Open-Meteo fallback:", error)
        return 38.4 // Lluvia por defecto para demo/degradación elegante
      }
    },
  }
}
