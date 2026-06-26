import { DangerZonesRepository } from "../domain/DangerZonesRepository"
import { RainfallRepository } from "../domain/RainfallRepository"
import { RiskResult, calcularRiesgo } from "../domain/riskCalculator"

export async function calculateRisk(
  dangerZonesRepo: DangerZonesRepository,
  rainfallRepo: RainfallRepository,
  lat: number,
  lon: number,
  alertaActiva: boolean
): Promise<RiskResult> {
  const cauces = await dangerZonesRepo.getDangerZones()
  const lluviaMm = await rainfallRepo.getRainfall48h(lat, lon)

  return calcularRiesgo({
    lat,
    lon,
    lluviaMm,
    cauces,
    alertaActiva,
  })
}
