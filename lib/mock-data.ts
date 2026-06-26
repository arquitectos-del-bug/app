// Mock data for YakuAlert

export const riskScoreData = {
  score: 72,
  level: 'ALTO' as const,
  timestamp: '2024-06-26T04:30:00Z',
  location: {
    name: 'Lurigancho-Chosica',
    region: 'Lima',
    latitude: -12.3034,
    longitude: -76.6458,
  },
  signals: [
    {
      icon: '🏔️',
      label: 'Cercanía a cauce',
      value: 40,
      status: 'red' as const,
      description: '+40 pts',
    },
    {
      icon: '🌧️',
      label: 'Lluvia 48h',
      value: 24,
      status: 'amber' as const,
      description: '+24 pts',
    },
    {
      icon: '⚠️',
      label: 'Alerta activa',
      value: 8,
      status: 'amber' as const,
      description: '+8 pts',
    },
  ],
}

export const quickStatsData = [
  {
    id: 'rainfall',
    icon: '💧',
    label: 'Lluvia 48h',
    value: '38.4',
    unit: 'mm',
    status: 'amber' as const,
  },
  {
    id: 'flow',
    icon: '🌊',
    label: 'Caudal Rímac',
    value: '312',
    unit: 'm³/s',
    badge: '↑ 2.4×',
    status: 'red' as const,
  },
  {
    id: 'lastAlert',
    icon: '📡',
    label: 'Última alerta',
    value: 'SENAMHI',
    unit: 'hace 2h',
    status: 'slate' as const,
  },
]

export const historicalComparisonData = [
  {
    name: 'Hoy',
    value: 312,
    color: '#3b82f6',
    isDashed: false,
  },
  {
    name: 'Pico 2017',
    value: 489,
    color: '#ef4444',
    isDashed: true,
  },
  {
    name: 'Pico 2023',
    value: 401,
    color: '#f59e0b',
    isDashed: true,
  },
]

export const evacuationPlanData = [
  {
    id: 1,
    icon: '🎒',
    title: 'Prepara tu mochila de emergencia',
    description:
      'Documentos, agua (3L por persona), linterna y radio a pilas. Tienes aprox. 90 min antes del pico de lluvia.',
  },
  {
    id: 2,
    icon: '🚶',
    title: 'Ruta de evacuación',
    description:
      'Sube por Jr. Los Ficus hacia el Colegio San Francisco (zona segura designada por INDECI Chosica, cota +45m).',
  },
  {
    id: 3,
    icon: '📞',
    title: 'Reporta y coordina',
    description:
      'Llama al 119 (INDECI) o al serenazgo de Lurigancho. Avisa a tus vecinos de mayor edad.',
  },
]

export const historicalEventsData = [
  {
    event: 'El Niño Costero 2017',
    peakRainfall: '89 mm/día',
    peakFlow: '489 m³/s',
    deaths: '177 muertes',
    year: '2017',
  },
  {
    event: 'Ciclón Yaku 2023',
    peakRainfall: '67 mm/día',
    peakFlow: '401 m³/s',
    deaths: '36 muertes',
    year: '2023',
  },
  {
    event: 'Situación actual',
    peakRainfall: '38 mm/día',
    peakFlow: '312 m³/s',
    deaths: 'En curso',
    year: '2026',
  },
]

export const mapLayersData = [
  {
    id: 'alerts-24h',
    icon: '🔴',
    label: 'Alertas 24h',
    enabled: true,
  },
  {
    id: 'senamhi-stations',
    icon: '🟠',
    label: 'Estaciones SENAMHI',
    enabled: true,
  },
  {
    id: 'historic-riverbeds',
    icon: '🟣',
    label: 'Cauces históricos',
    enabled: true,
  },
  {
    id: 'precipitation-tiff',
    icon: '🌧️',
    label: 'TIFF precipitación',
    enabled: false,
    warning: '(lento)',
  },
]

export const settingsData = {
  savedLocations: [
    {
      id: 'home',
      icon: '🏠',
      name: 'Casa',
      location: 'Lurigancho-Chosica',
    },
  ],
  alerts: {
    pushNotifications: false,
    vibration: true,
    autoUpdate: true,
  },
  about: {
    version: '1.0',
    dataSource: 'SENAMHI · Open-Meteo · COES',
    project: 'Proyecto Torneo VibeCoding — PUCP 2026',
  },
}
