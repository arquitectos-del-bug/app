import { DangerZone } from "./DangerZone"

export interface DangerZonesRepository {
  getDangerZones(): Promise<DangerZone[]>
}
