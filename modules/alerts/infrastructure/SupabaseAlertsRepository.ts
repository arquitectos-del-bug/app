import { supabase } from "../../../lib/supabase"
import { ActiveAlert } from "../domain/ActiveAlert"
import { AlertsRepository } from "../domain/AlertsRepository"

export function createSupabaseAlertsRepository(): AlertsRepository {
  return {
    getActiveAlerts: async (distrito: string): Promise<ActiveAlert[]> => {
      const isChosica = distrito.toLowerCase().includes("chosica") || distrito.toLowerCase().includes("lurigancho")
      const fallbackAlerts: ActiveAlert[] = isChosica
        ? [
            {
              distrito: "Lurigancho-Chosica",
              nivel: "naranja",
              fuente: "SENAMHI",
              vigencia_desde: new Date().toISOString(),
              vigencia_hasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          ]
        : []

      try {
        if (!supabase) {
          console.warn("Supabase no configurado. Usando fallback de alertas.")
          return fallbackAlerts
        }
        const { data, error } = await supabase
          .from("active_alerts")
          .select("id, distrito, nivel, fuente, vigencia_desde, vigencia_hasta")
          .ilike("distrito", `%${distrito}%`)

        if (error) {
          console.warn("Error al consultar active_alerts en Supabase:", error.message)
          return fallbackAlerts
        }

        if (!data || data.length === 0) {
          return fallbackAlerts
        }

        return data as ActiveAlert[]
      } catch (error) {
        console.error("Excepción al consultar Supabase active_alerts:", error)
        return fallbackAlerts
      }
    },
  }
}
