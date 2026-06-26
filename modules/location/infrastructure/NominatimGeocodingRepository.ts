import { GeocodingRepository } from "../domain/GeocodingRepository"

export function createNominatimGeocodingRepository(): GeocodingRepository {
  return {
    getDistrictName: async (lat: number, lon: number): Promise<string> => {
      try {
        const userAgent = process.env.NOMINATIM_USER_AGENT || "YakuAlert/1.0 (contact: ricardosv46@gmail.com)"
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
          {
            headers: {
              "User-Agent": userAgent,
            },
          }
        )
        if (!response.ok) {
          throw new Error(`Error en Nominatim: ${response.statusText}`)
        }
        const data = await response.json()
        const address = data.address
        if (!address) return "Ubicación Desconocida"

        const district =
          address.suburb ||
          address.city_district ||
          address.district ||
          address.town ||
          address.village ||
          address.city
        const state = address.state || address.region

        if (district && state) {
          return `${district}, ${state}`
        }
        return district || state || "Ubicación Desconocida"
      } catch (error) {
        console.error("Nominatim fallback:", error)
        return "Lurigancho-Chosica, Lima"
      }
    },
  }
}
