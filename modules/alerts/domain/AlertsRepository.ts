import { ActiveAlert } from "./ActiveAlert"

export interface AlertsRepository {
  getActiveAlerts(distrito: string): Promise<ActiveAlert[]>
}
