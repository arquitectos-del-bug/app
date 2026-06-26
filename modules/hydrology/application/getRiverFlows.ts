import { HydrologyRepository } from "../domain/HydrologyRepository"
import { HydrologyReading } from "../domain/HydrologyReading"

export async function getRiverFlows(hydrologyRepo: HydrologyRepository): Promise<HydrologyReading[]> {
  return await hydrologyRepo.getRimacFlows()
}
