import { GeocodingRepository } from "../domain/GeocodingRepository"
import { areCoordinatesValid } from "../domain/Coordinates"

export async function getDistrictName(
  geocodingRepository: GeocodingRepository,
  lat: number,
  lon: number
): Promise<string> {
  if (!areCoordinatesValid(lat, lon)) {
    throw new Error(`Coordenadas inválidas: lat=${lat}, lon=${lon}`)
  }
  return await geocodingRepository.getDistrictName(lat, lon)
}
