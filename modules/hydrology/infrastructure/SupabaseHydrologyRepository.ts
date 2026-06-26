import { supabase } from "../../../lib/supabase"
import { HydrologyReading } from "../domain/HydrologyReading"
import { HydrologyRepository } from "../domain/HydrologyRepository"

export function createSupabaseHydrologyRepository(): HydrologyRepository {
  return {
    getRimacFlows: async (): Promise<HydrologyReading[]> => {
      const fallbackData: HydrologyReading[] = [
        {
          name: "Hoy",
          value: 312,
          color: "#3b82f6",
          isDashed: false,
        },
        {
          name: "Pico 2017",
          value: 489,
          color: "#ef4444",
          isDashed: true,
        },
        {
          name: "Pico 2023",
          value: 401,
          color: "#f59e0b",
          isDashed: true,
        },
      ]

      try {
        if (!supabase) {
          console.warn("Supabase no configurado. Usando fallback de caudal.")
          return fallbackData
        }
        // Consultar la tabla hydrology_readings
        const { data, error } = await supabase
          .from("hydrology_readings")
          .select("rio, caudal_m3s, fecha, fuente")
          .eq("rio", "Rímac")

        if (error || !data || data.length === 0) {
          console.warn("Error al consultar Supabase o no hay datos. Usando fallback de resiliencia:", error?.message)
          return fallbackData
        }

        // Mapear los datos de Supabase a la estructura de la aplicación
        // Buscamos: fecha actual (o la de hoy), pico 2017 y pico 2023.
        const hoyReading = data.find((d) => d.fecha.startsWith("2026") || d.fuente === "mock")
        const pico2017Reading = data.find((d) => d.fecha === "2017-03-15")
        const pico2023Reading = data.find((d) => d.fecha === "2023-03-10")

        return [
          {
            name: "Hoy",
            value: Number(hoyReading?.caudal_m3s || 312),
            color: "#3b82f6",
            isDashed: false,
          },
          {
            name: "Pico 2017",
            value: Number(pico2017Reading?.caudal_m3s || 489),
            color: "#ef4444",
            isDashed: true,
          },
          {
            name: "Pico 2023",
            value: Number(pico2023Reading?.caudal_m3s || 401),
            color: "#f59e0b",
            isDashed: true,
          },
        ]
      } catch (error) {
        console.error("Excepción al consultar Supabase Hydrology. Usando fallback:", error)
        return fallbackData
      }
    },
  }
}
