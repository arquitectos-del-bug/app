export interface DangerZone {
  id: string
  nombre: string
  distrito: string
  rio: string
  cuenca: string
  peligrosidad: number
  coords: { lat: number; lon: number }[]
}
