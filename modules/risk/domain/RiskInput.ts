import { DangerZone } from "./DangerZone"

export interface RiskInput {
  lat: number
  lon: number
  lluviaMm: number
  cauces: DangerZone[]
  alertaActiva: boolean
}
