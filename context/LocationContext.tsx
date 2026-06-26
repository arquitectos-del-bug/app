'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserLocation {
  lat: number | null
  lon: number | null
  distrito: string | null
  loading: boolean
  error: string | null
}

const STORAGE_KEY = 'yaku_location'
const COORD_THRESHOLD_DEG = 0.003

function coordsChanged(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  return Math.abs(lat1 - lat2) > COORD_THRESHOLD_DEG || Math.abs(lon1 - lon2) > COORD_THRESHOLD_DEG
}

const LocationContext = createContext<UserLocation>({
  lat: null,
  lon: null,
  distrito: null,
  loading: true,
  error: null,
})

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>({
    lat: null,
    lon: null,
    distrito: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Intentar restaurar ubicación cacheada
    const saved = localStorage.getItem(STORAGE_KEY)
    let cachedLat: number | null = null
    let cachedLon: number | null = null
    let cachedDistrito: string | null = null

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.lat && parsed.lon) {
          cachedLat = parsed.lat
          cachedLon = parsed.lon
          cachedDistrito = parsed.distrito || null
          setLocation({ lat: cachedLat, lon: cachedLon, distrito: cachedDistrito, loading: false, error: null })
        }
      } catch (e) {
        console.error('Error parseando yaku_location:', e)
      }
    }

    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, loading: false, error: 'Geolocalización no soportada' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords

        if (cachedLat && cachedLon && !coordsChanged(lat, lon, cachedLat, cachedLon)) {
          setLocation({ lat, lon, distrito: cachedDistrito, loading: false, error: null })
          return
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            { headers: { 'User-Agent': 'YakuAlert/1.0 ricardosv46@gmail.com' } }
          )

          let distrito: string | null = null
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, distrito: null }))
          setLocation({ lat, lon, distrito: null, loading: false, error: null })
        }
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: `Permiso de ubicación denegado: ${error.message}`,
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
