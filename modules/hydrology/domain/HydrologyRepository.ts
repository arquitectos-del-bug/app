import { HydrologyReading } from "./HydrologyReading"

export interface HydrologyRepository {
  getRimacFlows(): Promise<HydrologyReading[]>
}
