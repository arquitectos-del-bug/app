import { DangerZone } from "./DangerZone"
import { RiskInput } from "./RiskInput"
import { RiskResult } from "./RiskResult"

// Haversine: distancia en metros entre dos coordenadas
export function haversineMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Distancia mínima entre el usuario y cualquier punto del cauce
export function distanciaAlCauce(lat: number, lon: number, cauce: DangerZone): number {
  return Math.min(...cauce.coords.map((c) => haversineMetros(lat, lon, c.lat, c.lon)))
}

// Señal 1 — Cercanía a cauce (0–40 pts)
// < 200m → 40 pts, decae linealmente hasta 0 pts a 2000m
export function puntajeCauce(lat: number, lon: number, cauces: DangerZone[]): {
  pts: number
  cauceCercano: string | null
  distanciaMetros: number | null
} {
  if (cauces.length === 0) return { pts: 0, cauceCercano: null, distanciaMetros: null }

  let minDistancia = Infinity
  let cauceCercano: DangerZone | null = null

  for (const cauce of cauces) {
    const d = distanciaAlCauce(lat, lon, cauce)
    if (d < minDistancia) {
      minDistancia = d
      cauceCercano = cauce
    }
  }

  const DISTANCIA_MAX = 2000
  const DISTANCIA_CRITICA = 200
  const peligrosidad = cauceCercano?.peligrosidad ?? 1

  let pts = 0
  if (minDistancia <= DISTANCIA_CRITICA) {
    pts = 40 * peligrosidad
  } else if (minDistancia < DISTANCIA_MAX) {
    const factor = 1 - (minDistancia - DISTANCIA_CRITICA) / (DISTANCIA_MAX - DISTANCIA_CRITICA)
    pts = 40 * factor * peligrosidad
  }

  return {
    pts: Math.round(pts),
    cauceCercano: cauceCercano?.nombre ?? null,
    distanciaMetros: Math.round(minDistancia),
  }
}

// Señal 2 — Lluvia 48h (0–40 pts)
// < 5mm → 0, escala lineal hasta 60mm = 40 pts
export function puntajeLluvia(lluviaMm: number): number {
  const LLUVIA_MIN = 5
  const LLUVIA_MAX = 60
  if (lluviaMm < LLUVIA_MIN) return 0
  const factor = Math.min((lluviaMm - LLUVIA_MIN) / (LLUVIA_MAX - LLUVIA_MIN), 1)
  return Math.round(40 * factor)
}

// Señal 3 — Vulnerabilidad del distrito (0–20 pts)
export function puntajeVulnerabilidad(alertaActiva: boolean): number {
  return alertaActiva ? 20 : 0
}

export function nivelDesdeScore(score: number): 'BAJO' | 'MODERADO' | 'ALTO' {
  if (score <= 33) return 'BAJO'
  if (score <= 66) return 'MODERADO'
  return 'ALTO'
}

export function calcularRiesgo(input: RiskInput): RiskResult {
  const { lat, lon, lluviaMm, cauces, alertaActiva } = input

  const { pts: cauce, cauceCercano, distanciaMetros } = puntajeCauce(lat, lon, cauces)
  const lluvia = puntajeLluvia(lluviaMm)
  const vulnerabilidad = puntajeVulnerabilidad(alertaActiva)

  const score = Math.min(cauce + lluvia + vulnerabilidad, 100)

  return {
    score,
    nivel: nivelDesdeScore(score),
    desglose: { cauce, lluvia, vulnerabilidad, cauceCercano, distanciaMetros },
  }
}
