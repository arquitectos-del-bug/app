import { supabase } from "../../../lib/supabase"
import { ActiveAlert } from "../domain/ActiveAlert"
import { AlertsRepository } from "../domain/AlertsRepository"

export function createSupabaseAlertsRepository(): AlertsRepository {
  return {
    getActiveAlerts: async (distrito: string): Promise<ActiveAlert[]> => {
      if (!supabase) return []

      const { data, error } = await supabase
        .from("active_alerts")
        .select("id, distrito, nivel, fuente, vigencia_desde, vigencia_hasta")
        .ilike("distrito", `%${distrito}%`)

      if (error || !data) return []

      return data as ActiveAlert[]
    },
  }
}
