import { RecommendationsRepository, RecommendationsRepositoryInput } from "../domain/RecommendationsRepository"
import { EvacuationStep } from "../domain/EvacuationPlan"

export async function getRecommendations(
  recommendationsRepo: RecommendationsRepository,
  input: RecommendationsRepositoryInput
): Promise<EvacuationStep[]> {
  return await recommendationsRepo.getRecommendations(input)
}
