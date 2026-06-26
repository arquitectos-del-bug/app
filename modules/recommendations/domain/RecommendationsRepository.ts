import { EvacuationStep } from "./EvacuationPlan"

export interface RecommendationsRepositoryInput {
  score: number
  nivel: string
  distrito: string
  lluviaMm: number
  ptsCauce: number
  ptsLluvia: number
  ptsVuln: number
  caudal: number
  caudal2017: number
  caudal2023: number
  alertaCOEN: string
}

export interface RecommendationsRepository {
  getRecommendations(input: RecommendationsRepositoryInput): Promise<EvacuationStep[]>
}
