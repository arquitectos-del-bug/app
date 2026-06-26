import { DangerZone } from "../domain/DangerZone"
import { DangerZonesRepository } from "../domain/DangerZonesRepository"
import dangerZonesData from "../../../lib/danger-zones.json"

export function createLocalDangerZonesRepository(): DangerZonesRepository {
  return {
    getDangerZones: async (): Promise<DangerZone[]> => {
      return dangerZonesData as DangerZone[]
    },
  }
}
