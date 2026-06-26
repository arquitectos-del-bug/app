export interface RiskDesglose {
  cauce: number
  lluvia: number
  vulnerabilidad: number
  cauceCercano: string | null
  distanciaMetros: number | null
}

export interface RiskResult {
  score: number
  nivel: 'BAJO' | 'MODERADO' | 'ALTO'
  desglose: RiskDesglose
}
