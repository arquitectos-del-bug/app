export interface RainfallRepository {
  getRainfall48h(lat: number, lon: number): Promise<number>
}
