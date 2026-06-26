'use client'

import { useState, useEffect } from 'react'

export interface UserLocation {
  lat: number
  lon: number
  distrito: string
  loading: boolean
  error: string | null
}

const STORAGE_KEY = 'yaku_location'

// Coordenadas por defecto (Lurigancho-Chosica, Lima) en caso de error o denegación
const DEFAULT_LAT = -11.9340
const DEFAULT_LON = -76.6880
const DEFAULT_DISTRITO = 'Lurigancho-Chosica, Lima'

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
    distrito: DEFAULT_DISTRITO,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Cargar ubicación previamente guardada
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.lat && parsed.lon) {
          setLocation((prev) => ({
            ...prev,
            lat: parsed.lat,
            lon: parsed.lon,
            distrito: parsed.distrito || prev.distrito,
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

        try {
          // Consultar Nominatim para obtener el distrito en español
          const userAgent = 'YakuAlert/1.0 ricardosv46@gmail.com'
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            {
              headers: {
                'User-Agent': userAgent,
              },
            }
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
              if (district && state) {
                distrito = `${district}, ${state}`
              } else if (district) {
                distrito = district
              } else if (state) {
                distrito = state
              }
            }
          }

          const newLocation = {
            lat,
            lon,
            distrito,
            loading: false,
            error: null,
          }

          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, distrito }))
          setLocation(newLocation)
        } catch (err: any) {
          console.error('Error al geolocalizar reversamente con Nominatim:', err)
          // Mantener coordenadas pero usar el distrito por defecto o coordenadas solas
          const newLocation = {
            lat,
            lon,
            distrito: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            loading: false,
            error: null,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, distrito: newLocation.distrito }))
          setLocation(newLocation)
        }
      },
      (error) => {
        console.warn('Error de geolocalización o permisos denegados:', error.message)
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: `Error de geolocalización: ${error.message}. Usando Chosica por defecto.`,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  return location
}
