'use client'

// Re-exporta desde el contexto centralizado para compatibilidad con código existente.
// La lógica de geolocalización vive en LocationProvider (context/LocationContext.tsx),
// que garantiza una sola llamada a Nominatim por sesión independientemente de cuántos
// componentes consuman este hook.
export type { UserLocation } from '@/context/LocationContext'
export { useLocation as useUserLocation } from '@/context/LocationContext'
