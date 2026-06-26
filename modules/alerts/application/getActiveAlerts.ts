import { AlertsRepository } from "../domain/AlertsRepository"
import { ActiveAlert } from "../domain/ActiveAlert"

export async function getActiveAlerts(alertsRepo: AlertsRepository, distrito: string): Promise<ActiveAlert[]> {
  // Limpiamos el nombre del distrito para búsquedas más flexibles
  const cleanDistrito = distrito.split(",")[0]?.trim() || distrito
  return await alertsRepo.getActiveAlerts(cleanDistrito)
}
