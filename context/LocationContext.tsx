'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserLocation {
  lat: number | null
  lon: number | null
  distrito: string | null
  loading: boolean
  error: string | null
  isMocked: boolean
  setSimulatedLocation: (lat: number, lon: number, distrito: string | null) => void
  resetLocation: () => void
}

const STORAGE_KEY = 'yaku_location'
const MOCK_STORAGE_KEY = 'yaku_mock_location'
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
  isMocked: false,
  setSimulatedLocation: () => {},
  resetLocation: () => {},
})

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<{
    lat: number | null
    lon: number | null
    distrito: string | null
    loading: boolean
    error: string | null
    isMocked: boolean
  }>({
    lat: null,
    lon: null,
    distrito: null,
    loading: true,
    error: null,
    isMocked: false,
  })

  const [realLocation, setRealLocation] = useState<{
    lat: number | null
    lon: number | null
    distrito: string | null
    error: string | null
  }>({
    lat: null,
    lon: null,
    distrito: null,
    error: null,
  })

  const setSimulatedLocation = (lat: number, lon: number, distrito: string | null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({ lat, lon, distrito }))
    }
    setLocation({
      lat,
      lon,
      distrito,
      loading: false,
      error: null,
      isMocked: true,
    })
  }

  const resetLocation = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MOCK_STORAGE_KEY)
    }
    if (realLocation.lat !== null) {
      setLocation({
        lat: realLocation.lat,
        lon: realLocation.lon,
        distrito: realLocation.distrito,
        loading: false,
        error: realLocation.error,
        isMocked: false,
      })
    } else {
      setLocation((prev) => ({ ...prev, loading: true, isMocked: false }))
      triggerGeolocation()
    }
  }

  const triggerGeolocation = () => {
    if (!navigator.geolocation) {
      const err = 'Geolocalización no soportada'
      setRealLocation((prev) => ({ ...prev, error: err }))
      
      const mockSaved = localStorage.getItem(MOCK_STORAGE_KEY)
      if (!mockSaved) {
        setLocation((prev) => ({ ...prev, loading: false, error: err }))
      }
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords

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
            }
          } catch (e) {
            console.error('Error parseando yaku_location:', e)
          }
        }

        if (cachedLat && cachedLon && !coordsChanged(lat, lon, cachedLat, cachedLon)) {
          const real = { lat, lon, distrito: cachedDistrito, error: null }
          setRealLocation(real)
          
          const mockSaved = localStorage.getItem(MOCK_STORAGE_KEY)
          if (!mockSaved) {
            setLocation({ ...real, loading: false, isMocked: false })
          }
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
          const real = { lat, lon, distrito, error: null }
          setRealLocation(real)

          const mockSaved = localStorage.getItem(MOCK_STORAGE_KEY)
          if (!mockSaved) {
            setLocation({ ...real, loading: false, isMocked: false })
          }
        } catch {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, distrito: null }))
          const real = { lat, lon, distrito: null, error: null }
          setRealLocation(real)

          const mockSaved = localStorage.getItem(MOCK_STORAGE_KEY)
          if (!mockSaved) {
            setLocation({ ...real, loading: false, isMocked: false })
          }
        }
      },
      (error) => {
        const errMsg = `Permiso de ubicación denegado: ${error.message}`
        const real = { lat: null, lon: null, distrito: null, error: errMsg }
        setRealLocation(real)

        const mockSaved = localStorage.getItem(MOCK_STORAGE_KEY)
        if (!mockSaved) {
          setLocation({
            ...real,
            loading: false,
            isMocked: false,
          })
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Primero revisar si ya hay una ubicación mockeada en caché
    const mockSaved = localStorage.getItem(MOCK_STORAGE_KEY)
    if (mockSaved) {
      try {
        const parsed = JSON.parse(mockSaved)
        if (parsed.lat && parsed.lon) {
          setLocation({
            lat: parsed.lat,
            lon: parsed.lon,
            distrito: parsed.distrito || null,
            loading: false,
            error: null,
            isMocked: true,
          })
        }
      } catch (e) {
        console.error('Error parseando mock location cacheada:', e)
      }
    }

    triggerGeolocation()
  }, [])

  return (
    <LocationContext.Provider
      value={{
        ...location,
        setSimulatedLocation,
        resetLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation(): UserLocation {
  return useContext(LocationContext)
}

