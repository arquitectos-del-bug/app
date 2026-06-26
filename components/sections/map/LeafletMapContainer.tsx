'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import dangerZonesData from '@/lib/danger-zones.json'
import type { CommunityReport } from '@/types/community'

// Ajustador dinámico de mapa
interface MapResizerProps {
  center: [number, number]
  zoom: number
}

function MapResizer({ center, zoom }: MapResizerProps) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
    setTimeout(() => {
      map.invalidateSize()
    }, 200)
  }, [center, zoom, map])
  return null
}

interface LeafletMapContainerProps {
  userLat: number
  userLon: number
  userDistrito: string
  score: number
  nivel: string
  layers: {
    alerts24h: boolean
    senamhiStations: boolean
    historicRiverbeds: boolean
  }
  reports?: CommunityReport[]
}

export default function LeafletMapContainer({
  userLat,
  userLon,
  userDistrito,
  score,
  nivel,
  layers,
  reports = [],
}: LeafletMapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')

  // Cargar GeoJSON de departamentos del Perú
  useEffect(() => {
    async function loadPeruGeoJson() {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/juaneladio/peru-geojson/master/peru_departamental_simple.geojson'
        )
        if (response.ok) {
          const data = await response.json()
          setGeoJsonData(data)
        }
      } catch (e) {
        console.error('Error cargando GeoJSON de departamentos:', e)
      }
    }
    loadPeruGeoJson()
  }, [])

  // Sincronizar tema con documentElement
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setCurrentTheme(isDark ? 'dark' : 'light')
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Limpiar el departamento del usuario para emparejar
  const getCleanUserDepartment = () => {
    const parts = userDistrito.split(',')
    const stateStr = parts[parts.length - 1]?.trim().toUpperCase() || ''
    // Remover prefijos comunes como "DEPARTAMENTO DE " o "PROVINCIA DE "
    return stateStr
      .replace(/DEPARTAMENTO DE\s+/gi, '')
      .replace(/PROVINCIA DE\s+/gi, '')
      .trim()
  }

  const userDept = getCleanUserDepartment()

  // Estilo para cada polígono de departamento
  const getGeoJsonStyle = (feature: any) => {
    const deptName = (feature.properties.NOMBDEP || '').toUpperCase().trim()
    const isUserDept = userDept && deptName === userDept
    
    const userDeptColor = currentTheme === 'dark' ? '#00f0ff' : '#0284c7'
    const borderDeptColor = currentTheme === 'dark' ? '#1f2937' : '#cbd5e1'

    return {
      fillColor: isUserDept ? userDeptColor : 'transparent',
      fillOpacity: isUserDept ? 0.15 : 0,
      color: isUserDept ? userDeptColor : borderDeptColor,
      weight: isUserDept ? 2.5 : 0.8,
      opacity: isUserDept ? 0.9 : 0.3,
    }
  }

  // Eventos para cada departamento (Popup + Hover)
  const onEachDepartment = (feature: any, layer: any) => {
    const deptName = feature.properties.NOMBDEP || 'Región'
    const cleanDeptName = deptName.toUpperCase().trim()
    const isUserDept = userDept && cleanDeptName === userDept
    const hoverColor = currentTheme === 'dark' ? '#00f0ff' : '#0284c7'

    layer.bindPopup(`
      <div class="p-1">
        <h4 class="font-bold text-xs uppercase tracking-wider text-text-primary font-heading">${deptName}</h4>
        <p class="text-[10px] text-text-muted mt-1">Monitoreo de cuencas activo en YakuAlert.</p>
        ${
          isUserDept
            ? `<div class="mt-2 text-[9px] font-black tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded inline-block border border-primary/20">📍 TU DEPARTAMENTO</div>`
            : ''
        }
      </div>
    `)

    layer.on({
      mouseover: (e: any) => {
        const l = e.target
        l.setStyle({
          fillOpacity: 0.2,
          fillColor: hoverColor,
          opacity: 0.9,
          color: hoverColor,
          weight: 2,
        })
      },
      mouseout: (e: any) => {
        const l = e.target
        l.setStyle(getGeoJsonStyle(feature))
      },
    })
  }

  // Marcadores de Leaflet
  const userIcon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-primary opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-primary border-2 border-background shadow-lg"></span>
      </div>
    `,
    className: 'custom-user-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  const warningIcon = L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-risk-high/20 border-2 border-risk-high shadow-risk-high/30 shadow-lg text-risk-high font-bold animate-pulse text-xs">
        ⚠️
      </div>
    `,
    className: 'custom-warning-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const reportIcon = (tipo: string) => {
    const cfg: Record<string, { emoji: string; bg: string; border: string }> = {
      huaico:   { emoji: '🌊', bg: 'rgba(239,68,68,0.25)',  border: '#ef4444' },
      desborde: { emoji: '💧', bg: 'rgba(59,130,246,0.25)', border: '#3b82f6' },
      bloqueo:  { emoji: '🚧', bg: 'rgba(245,158,11,0.25)', border: '#f59e0b' },
    }
    const { emoji, bg, border } = cfg[tipo] ?? cfg.huaico
    return L.divIcon({
      html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${bg};border:2px solid ${border};font-size:14px;box-shadow:0 0 8px ${border}66">${emoji}</div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  function timeAgo(date: Date | string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (diff < 1) return 'ahora mismo'
    if (diff < 60) return `hace ${diff} min`
    return `hace ${Math.floor(diff / 60)}h`
  }

  const userCenter: [number, number] = [userLat, userLon]

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={userCenter}
        zoom={14}
        zoomControl={false}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <MapResizer center={userCenter} zoom={14} />

        {/* Capa de Mapa Base Oscura / Clara según el tema actual */}
        <TileLayer
          key={currentTheme}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            currentTheme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
          }
        />

        {/* Capa GeoJSON de departamentos del Perú */}
        {geoJsonData && (
          <GeoJSON
            key={userDept} // Fuerza redibujo al cambiar el departamento del usuario
            data={geoJsonData}
            style={getGeoJsonStyle}
            onEachFeature={onEachDepartment}
          />
        )}

        {/* Marcador del Usuario */}
        <Marker position={userCenter} icon={userIcon}>
          <Popup className="custom-popup">
            <div className="p-1.5">
              <h3 className="font-bold text-sm text-text-primary font-heading">Tu ubicación</h3>
              <p className="text-xs text-text-muted mt-1">{userDistrito}</p>
              <div className="mt-2 text-xs font-semibold text-risk-high bg-risk-high/10 px-2 py-1 rounded inline-block border border-risk-high/20">
                Score Riesgo: {score}% ({nivel})
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Renderizado de Zonas de Peligro (Quebradas) */}
        {layers.historicRiverbeds &&
          dangerZonesData.map((zone) => {
            const pathCoords = zone.coords.map((c) => [c.lat, c.lon] as [number, number])
            const isRimac = zone.id.includes('rimac')
            const color = isRimac
              ? (currentTheme === 'dark' ? '#ff0055' : '#dc2626')
              : (currentTheme === 'dark' ? '#ff9f1c' : '#d97706')

            return (
              <div key={zone.id}>
                <Polyline
                  positions={pathCoords}
                  pathOptions={{
                    color,
                    weight: isRimac ? 6 : 4,
                    opacity: 0.8,
                  }}
                />

                {zone.coords.map((c, idx) => (
                  <Circle
                    key={`${zone.id}-${idx}`}
                    center={[c.lat, c.lon]}
                    radius={150 * zone.peligrosidad}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.15,
                      stroke: false,
                    }}
                  />
                ))}

                {pathCoords.length > 0 && (
                  <Marker
                    position={pathCoords[Math.floor(pathCoords.length / 2)] as [number, number]}
                    icon={warningIcon}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <h4 className="font-bold text-sm text-text-primary font-heading">{zone.nombre}</h4>
                        <p className="text-xs text-text-muted mt-1">Cuenca: {zone.cuenca}</p>
                        <p className="text-xs text-risk-high font-semibold mt-1">
                          Nivel de peligro: {Math.round(zone.peligrosidad * 100)}%
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </div>
            )
          })}
        {/* Community reports */}
        {reports.map((r, idx) => (
          <Marker
            key={idx}
            position={[r.lat, r.lon]}
            icon={reportIcon(r.tipo)}
          >
            <Popup className="custom-popup">
              <div className="p-1.5">
                <h4 className="font-bold text-sm capitalize">{r.tipo}</h4>
                {r.descripcion && <p className="text-xs text-text-muted mt-1">{r.descripcion}</p>}
                <p className="text-[10px] text-text-muted mt-1">📍 {r.distrito}</p>
                <p className="text-[10px] text-text-muted">{timeAgo(r.created_at)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  )
}
