export type ReportType = 'huaico' | 'desborde' | 'bloqueo'

export interface CommunityReport {
  _id?: string
  lat: number
  lon: number
  tipo: ReportType
  descripcion: string
  distrito: string
  created_at: Date | string
}

export interface CommunityAlert {
  count: number
  radio_km: number
  tipos: ReportType[]
}
