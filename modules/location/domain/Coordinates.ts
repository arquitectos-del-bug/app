export interface Coordinates {
  lat: number
  lon: number
}

export function areCoordinatesValid(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}
