export interface GeocodingRepository {
  getDistrictName(lat: number, lon: number): Promise<string>
}
