import { supabase } from "../../../lib/supabase"
import { HydrologyReading } from "../domain/HydrologyReading"
import { HydrologyRepository } from "../domain/HydrologyRepository"

export function createSupabaseHydrologyRepository(): HydrologyRepository {
  return {
    getRimacFlows: async (): Promise<HydrologyReading[]> => {
      if (!supabase) return []

      const { data, error } = await supabase
        .from("hydrology_readings")
        .select("rio, caudal_m3s, fecha, fuente")
        .eq("rio", "Rímac")
        .order("fecha", { ascending: false })

      if (error || !data || data.length === 0) return []

      return data.map((d) => ({
        name: d.fecha.split("T")[0],
        value: Number(d.caudal_m3s),
        color: "#3b82f6",
        isDashed: false,
      }))
    },
  }
}
