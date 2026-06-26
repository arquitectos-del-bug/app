'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserLocation {
  lat: number
  lon: number
  distrito: string
  loading: boolean
  error: string | null
}

const DEFAULT_LAT = -11.9340
const DEFAULT_LON = -76.6880
const DEFAULT_DISTRITO = 'Lurigancho-Chosica, Lima'
const STORAGE_KEY = 'yaku_location'
const COORD_THRESHOLD_DEG = 0.003 // ~330m, evita llamar Nominatim si el usuario no se movió

function coordsChanged(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  return Math.abs(lat1 - lat2) > COORD_THRESHOLD_DEG || Math.abs(lon1 - lon2) > COORD_THRESHOLD_DEG
}

const LocationContext = createContext<UserLocation>({
  lat: DEFAULT_LAT,
  lon: DEFAULT_LON,
  distrito: DEFAULT_DISTRITO,
  loading: true,
  error: null,
})

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>({
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
    distrito: DEFAULT_DISTRITO,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cachedLat = DEFAULT_LAT
    let cachedLon = DEFAULT_LON
    let cachedDistrito = DEFAULT_DISTRITO

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.lat && parsed.lon) {
          cachedLat = parsed.lat
          cachedLon = parsed.lon
          cachedDistrito = parsed.distrito || DEFAULT_DISTRITO
          setLocation((prev) => ({
            ...prev,
            lat: cachedLat,
            lon: cachedLon,
            distrito: cachedDistrito,
            loading: false,
          }))
        }
      } catch (e) {
        console.error('Error parseando yaku_location de LocalStorage:', e)
      }
    }

    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocalización no soportada por el navegador',
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords

        // Si las coordenadas no cambiaron significativamente, reutilizar el distrito cacheado
        if (!coordsChanged(lat, lon, cachedLat, cachedLon)) {
          setLocation({ lat, lon, distrito: cachedDistrito, loading: false, error: null })
          return
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            { headers: { 'User-Agent': 'YakuAlert/1.0 ricardosv46@gmail.com' } }
          )

          let distrito = DEFAULT_DISTRITO
          if (response.ok) {
            const data = await response.json()
            const address = data.address
            if (address) {
              const district =
                address.suburb ||
                address.city_district ||
                address.district ||
                address.town ||
                address.village ||
                address.city
              const state = address.state || address.region
              if (district && state) distrito = `${district}, ${state}`
              else if (district) distrito = district
              else if (state) distrito = state
            }
          }

          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, distrito }))
          setLocation({ lat, lon, distrito, loading: false, error: null })
        } catch {
          const distrito = `${lat.toFixed(4)}, ${lon.toFixed(4)}`
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, distrito }))
          setLocation({ lat, lon, distrito, loading: false, error: null })
        }
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: `Error de geolocalización: ${error.message}. Usando Chosica por defecto.`,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>
}

export function useLocation(): UserLocation {
  return useContext(LocationContext)
}
