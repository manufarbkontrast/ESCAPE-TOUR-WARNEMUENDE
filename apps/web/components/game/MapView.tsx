'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Station, GeoPoint } from '@escape-tour/shared'
import { useLocationStore } from '@/stores/locationStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapViewProps {
  readonly stations: readonly Station[]
  readonly currentStationIndex: number
  readonly onStationSelect?: (stationIndex: number) => void
}

type StationStatus = 'completed' | 'current' | 'locked'

interface StationMarkerInfo {
  readonly station: Station
  readonly status: StationStatus
  readonly index: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WARNEMUENDE_CENTER: [number, number] = [12.0853, 54.1797]
const DEFAULT_ZOOM = 15
const DEFAULT_PITCH = 60
const DEFAULT_BEARING = -17.6

const MARKER_COLORS: Record<StationStatus, string> = {
  completed: '#22c55e',
  current: '#edaa3b',
  locked: '#6b7280',
} as const

const MAP_STYLE = 'mapbox://styles/mapbox/standard'

// ---------------------------------------------------------------------------
// Haversine distance utility
// ---------------------------------------------------------------------------

const calculateHaversineDistance = (
  point1: GeoPoint,
  point2: GeoPoint,
): number => {
  const R = 6371e3
  const phi1 = (point1.lat * Math.PI) / 180
  const phi2 = (point2.lat * Math.PI) / 180
  const deltaPhi = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLambda = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

// ---------------------------------------------------------------------------
// Marker creation helpers
// ---------------------------------------------------------------------------

const createStationMarkerElement = (info: StationMarkerInfo): HTMLElement => {
  const el = document.createElement('div')
  el.className = 'station-marker'

  const color = MARKER_COLORS[info.status]
  const size = info.status === 'current' ? 36 : 28
  const labelText = String(info.index + 1)

  el.innerHTML = `
    <div
      style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid ${info.status === 'current' ? '#f3c56c' : 'rgba(255,255,255,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${info.status === 'locked' ? '#d1d5db' : '#0b1929'};
        font-weight: 700;
        font-size: ${info.status === 'current' ? '14px' : '12px'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: transform 0.2s;
        ${info.status === 'current' ? 'animation: markerPulse 2s ease-in-out infinite;' : ''}
      "
    >
      ${info.status === 'locked' ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>` : labelText}
    </div>
  `

  return el
}

const createUserMarkerElement = (): HTMLElement => {
  const el = document.createElement('div')
  el.className = 'user-location-marker'

  el.innerHTML = `
    <div style="position: relative; width: 20px; height: 20px;">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background-color: rgba(59, 130, 246, 0.3);
        animation: userPulse 2s ease-in-out infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #3b82f6;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>
    </div>
  `

  return el
}

// ---------------------------------------------------------------------------
// CSS keyframes injection
// ---------------------------------------------------------------------------

const injectAnimationStyles = (): void => {
  if (document.getElementById('mapview-animations')) return

  const style = document.createElement('style')
  style.id = 'mapview-animations'
  style.textContent = `
    @keyframes markerPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 170, 59, 0.4); }
      50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(237, 170, 59, 0); }
    }
    @keyframes userPulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(2); opacity: 0; }
    }
  `
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MapLegend() {
  return (
    <div className="absolute top-4 left-4 z-10 rounded-lg bg-navy-900/95 p-3 shadow-lg backdrop-blur-sm">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sand-300">
        Legende
      </h3>
      <ul className="space-y-1.5">
        <li className="flex items-center gap-2 text-xs text-sand-100">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: MARKER_COLORS.completed }}
          />
          Abgeschlossen
        </li>
        <li className="flex items-center gap-2 text-xs text-sand-100">
          <span
            className="inline-block h-3 w-3 rounded-full border-2 border-brass-300"
            style={{ backgroundColor: MARKER_COLORS.current }}
          />
          Aktuelle Station
        </li>
        <li className="flex items-center gap-2 text-xs text-sand-100">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: MARKER_COLORS.locked }}
          />
          Gesperrt
        </li>
        <li className="flex items-center gap-2 text-xs text-sand-100">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
          Dein Standort
        </li>
      </ul>
    </div>
  )
}

interface StationInfoPanelProps {
  readonly station: Station
  readonly distance: string | null
  readonly stationNumber: number
}

function StationInfoPanel({
  station,
  distance,
  stationNumber,
}: StationInfoPanelProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 rounded-lg border border-brass-500/30 bg-navy-900/95 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brass-500 text-xs font-bold text-navy-900">
              {stationNumber}
            </span>
            <h3 className="font-display text-lg font-semibold text-sand-50">
              {station.nameDe}
            </h3>
          </div>
          {station.subtitleDe && (
            <p className="mb-2 text-sm text-sand-300">
              {station.subtitleDe}
            </p>
          )}
          {station.locationName && (
            <p className="text-xs text-sand-400">
              {station.locationName}
            </p>
          )}
        </div>

        {distance !== null && (
          <div className="ml-4 flex flex-col items-center rounded-lg bg-navy-800 px-3 py-2">
            <svg
              className="mb-1 h-4 w-4 text-brass-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-bold text-brass-400">{distance}</span>
            <span className="text-[10px] text-sand-400">Entfernung</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MapView component
// ---------------------------------------------------------------------------

export function MapView({ stations, currentStationIndex, onStationSelect }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const { userLocation, startWatching, isTracking } = useLocationStore()

  // Derive station marker data immutably
  const stationMarkers: readonly StationMarkerInfo[] = useMemo(
    () =>
      stations.map((station, index) => ({
        station,
        index,
        status: (
          index < currentStationIndex
            ? 'completed'
            : index === currentStationIndex
              ? 'current'
              : 'locked'
        ) as StationStatus,
      })),
    [stations, currentStationIndex],
  )

  // Current station data
  const currentStation = stations[currentStationIndex] ?? null

  // Distance to current station
  const distanceToCurrentStation = useMemo(() => {
    if (!userLocation || !currentStation) return null

    const userPoint: GeoPoint = {
      lat: userLocation.lat,
      lng: userLocation.lng,
    }

    return calculateHaversineDistance(userPoint, currentStation.location)
  }, [userLocation, currentStation])

  const formattedDistance = useMemo(
    () =>
      distanceToCurrentStation !== null
        ? formatDistance(distanceToCurrentStation)
        : null,
    [distanceToCurrentStation],
  )

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      setMapError('Mapbox token is not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN.')
      return
    }

    mapboxgl.accessToken = token

    injectAnimationStyles()

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: WARNEMUENDE_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
        attributionControl: false,
      })

      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        'bottom-right',
      )

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        'top-right',
      )

      map.on('style.load', () => {
        // Add terrain DEM source for 3D elevation
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        })

        // Enable 3D terrain (Warnemünde is flat → subtle exaggeration)
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

        // Configure Standard style for daytime with 3D buildings
        map.setConfigProperty('basemap', 'lightPreset', 'day')
        map.setConfigProperty('basemap', 'show3dObjects', true)

        setIsMapLoaded(true)
      })

      map.on('error', (e) => {
        setMapError(`Map error: ${e.error?.message ?? 'Unknown error'}`)
      })

      mapRef.current = map
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize map'
      setMapError(message)
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      userMarkerRef.current?.remove()
      userMarkerRef.current = null

      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Start location tracking
  useEffect(() => {
    if (!isTracking) {
      startWatching()
    }
  }, [isTracking, startWatching])

  // Place station markers
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    const newMarkers = stationMarkers.map((info) => {
      const el = createStationMarkerElement(info)

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([info.station.location.lng, info.station.location.lat])
        .addTo(mapRef.current!)

      // Attach click listener to the Mapbox marker wrapper element
      // so it captures all clicks regardless of internal DOM structure
      const markerEl = marker.getElement()
      if (info.status !== 'locked' && onStationSelect) {
        markerEl.addEventListener('click', (e) => {
          e.stopPropagation()
          onStationSelect(info.index)
        })
        markerEl.style.cursor = 'pointer'
      } else {
        markerEl.style.cursor = info.status === 'locked' ? 'not-allowed' : 'pointer'
      }

      return marker
    })

    markersRef.current = newMarkers
  }, [stationMarkers, isMapLoaded, onStationSelect])

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !userLocation) return

    if (!userMarkerRef.current) {
      const el = createUserMarkerElement()
      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current)
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat])
    }
  }, [userLocation, isMapLoaded])

  // Center map on current station when it changes
  const centerOnCurrentStation = useCallback(() => {
    if (!mapRef.current || !currentStation) return

    mapRef.current.flyTo({
      center: [currentStation.location.lng, currentStation.location.lat],
      zoom: 16,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      duration: 2000,
    })
  }, [currentStation])

  useEffect(() => {
    if (isMapLoaded) {
      centerOnCurrentStation()
    }
  }, [isMapLoaded, centerOnCurrentStation])

  // Error state
  if (mapError) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg bg-navy-800/50 p-8">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-400">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-[400px] w-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-navy-900">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-brass-500 border-t-transparent" />
            <p className="text-sm text-sand-300">Karte wird geladen...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {isMapLoaded && <MapLegend />}

      {/* Re-center button */}
      {isMapLoaded && currentStation && (
        <button
          onClick={centerOnCurrentStation}
          className="absolute top-4 right-16 z-10 rounded-lg bg-navy-900/95 p-2.5 shadow-lg backdrop-blur-sm transition-colors hover:bg-navy-800"
          aria-label="Karte auf aktuelle Station zentrieren"
        >
          <svg
            className="h-5 w-5 text-brass-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
        </button>
      )}

      {/* Current station info panel */}
      {isMapLoaded && currentStation && (
        <StationInfoPanel
          station={currentStation}
          distance={formattedDistance}
          stationNumber={currentStationIndex + 1}
        />
      )}
    </div>
  )
}
