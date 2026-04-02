'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Station, GeoPoint } from '@escape-tour/shared'
import { LocateFixed, MapPin, AlertTriangle, Navigation } from 'lucide-react'
import { useLocationStore } from '@/stores/locationStore'


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapViewProps {
 readonly stations: readonly Station[]
 readonly currentStationIndex: number
 readonly onStationSelect?: (stationIndex: number) => void
 readonly showRoute?: boolean
 readonly isDemo?: boolean
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
const WARNEMUENDE_BOUNDS: mapboxgl.LngLatBoundsLike = [
 [12.065, 54.165],  // Southwest (links-unten)
 [12.110, 54.195],  // Northeast (rechts-oben)
]
const DEFAULT_ZOOM = 15
const DEFAULT_PITCH = 60
const DEFAULT_BEARING = -17.6
const MARKER_SIZE_CURRENT = 48
const MARKER_SIZE_OTHER = 38
const FLY_TO_DURATION_MS = 2_000
const TERRAIN_EXAGGERATION = 1.5
const DEM_MAX_ZOOM = 14
const ROUTE_FETCH_DEBOUNCE_MS = 3_000
// Max distance (meters) from Warnemünde center to consider user "nearby"
const MAX_ROUTE_DISTANCE_M = 5_000

const MARKER_COLORS: Record<StationStatus, string> = {
 completed: '#22c55e',
 current: '#ffffff',
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

const LOCK_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`

const createStationMarkerElement = (info: StationMarkerInfo): HTMLElement => {
 const el = document.createElement('div')
 el.className = 'station-marker'

 const color = MARKER_COLORS[info.status]
 const size = info.status === 'current' ? MARKER_SIZE_CURRENT : MARKER_SIZE_OTHER
 const fontSize = info.status === 'current' ? '18px' : '14px'
 const borderColor = info.status === 'current' ? '#e7e5e4' : 'rgba(255,255,255,0.5)'
 const textColor = info.status === 'locked' ? '#d1d5db' : 'rgb(10,10,10)'
 const labelText = String(info.index + 1)
 const pulseAnimation = info.status === 'current' ? 'animation: markerPulse 2s ease-in-out infinite;' : ''
 const circleContent = info.status === 'locked' ? LOCK_ICON_SVG : labelText
 const showLabel = info.status === 'current'

 const nameLabelHtml = showLabel
  ? `<div style="
    background: rgba(10, 10, 10, 0.85);
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  ">${info.station.nameDe.replace(/[<>&"']/g, (c: string) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c] ?? c)}</div>`
  : ''

 el.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
   <div style="
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background-color: ${color};
    border: 3px solid ${borderColor};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${textColor};
    font-weight: 700;
    font-size: ${fontSize};
    box-shadow: 0 2px 12px rgba(0,0,0,0.5);
    cursor: pointer;
    transition: transform 0.2s;
    ${pulseAnimation}
  ">${circleContent}</div>
   ${nameLabelHtml}
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
   0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
   50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
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
  <div
   className="absolute top-4 left-4 z-10 rounded-2xl p-3"
   style={{
    background: 'rgba(10, 10, 10, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
   }}
  >
   <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">
    Legende
   </h3>
   <ul className="space-y-1.5">
    <li className="flex items-center gap-2 text-xs text-white/70">
     <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: MARKER_COLORS.completed }}
     />
     Abgeschlossen
    </li>
    <li className="flex items-center gap-2 text-xs text-white/70">
     <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: MARKER_COLORS.current, boxShadow: '0 0 6px rgba(255, 255, 255, 0.2)' }}
     />
     Aktuelle Station
    </li>
    <li className="flex items-center gap-2 text-xs text-white/70">
     <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: MARKER_COLORS.locked }}
     />
     Gesperrt
    </li>
    <li className="flex items-center gap-2 text-xs text-white/70">
     <span className="inline-block h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-blue-500" />
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
  <div
   className="absolute bottom-4 left-4 right-4 z-10 rounded-2xl p-4"
   style={{
    background: 'rgba(10, 10, 10, 0.88)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.02)',
   }}
  >
   <div className="flex items-start justify-between">
    <div className="flex-1">
     <div className="mb-1 flex items-center gap-2.5">
      <span
       className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-dark-950"
       style={{
        background: '#ffffff',
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.15)',
       }}
      >
       {stationNumber}
      </span>
      <h3 className="text-base font-semibold text-white tracking-tight">
       {station.nameDe}
      </h3>
     </div>
     {station.subtitleDe && (
      <p className="ml-[38px] mb-1 text-xs text-white/60">
       {station.subtitleDe}
      </p>
     )}
     {station.locationName && (
      <p className="ml-[38px] text-[11px] text-white/40">
       {station.locationName}
      </p>
     )}
    </div>

    {distance !== null && (
     <div
      className="ml-4 flex flex-col items-center rounded-xl px-3 py-2"
      style={{
       background: 'rgba(255, 255, 255, 0.03)',
       border: '1px solid rgba(255, 255, 255, 0.04)',
      }}
     >
      <MapPin className="mb-1 h-3.5 w-3.5 text-white" strokeWidth={1.5} />
      <span className="text-sm font-bold text-white tabular-nums">{distance}</span>
      <span className="text-[10px] text-white/40">Entfernung</span>
     </div>
    )}
   </div>
  </div>
 )
}

// ---------------------------------------------------------------------------
// Navigation Panel — turn-by-turn overlay
// ---------------------------------------------------------------------------

interface NavigationPanelProps {
 readonly steps: readonly RouteStep[]
 readonly totalDistance: number
 readonly totalDuration: number
 readonly stationName: string
}

function NavigationPanel({ steps, totalDistance, totalDuration, stationName }: NavigationPanelProps) {
 // Show first non-depart step as "next", fall back to first step
 const nextStep = steps.find((s) => s.maneuverType !== 'depart') ?? steps[0]
 if (!nextStep) return null

 return (
  <div
   className="absolute top-4 left-4 right-16 z-10 rounded-2xl overflow-hidden"
   style={{
    background: 'rgba(10, 10, 10, 0.92)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
   }}
  >
   {/* Current instruction */}
   <div className="flex items-center gap-3 px-4 py-3">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
     {maneuverIcon(nextStep.maneuverType)}
    </span>
    <div className="flex-1 min-w-0">
     <p className="text-base font-semibold text-white leading-tight truncate">
      {nextStep.instruction}
     </p>
     {nextStep.distance > 0 && (
      <p className="text-sm text-white/50 mt-0.5">
       {formatDistance(nextStep.distance)}
      </p>
     )}
    </div>
   </div>

   {/* Summary bar */}
   <div
    className="flex items-center justify-between px-4 py-2.5"
    style={{ background: 'rgba(255, 255, 255, 0.04)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
   >
    <div className="flex items-center gap-1.5">
     <Navigation className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
     <span className="text-sm font-semibold text-white/70">{stationName}</span>
    </div>
    <div className="flex items-center gap-3">
     <span className="text-sm font-bold text-white tabular-nums">{formatDistance(totalDistance)}</span>
     <span className="text-sm text-white/50 tabular-nums">{formatDuration(totalDuration)}</span>
    </div>
   </div>
  </div>
 )
}

// ---------------------------------------------------------------------------
// Walking route helpers
// ---------------------------------------------------------------------------

interface RouteStep {
 readonly instruction: string
 readonly distance: number
 readonly duration: number
 readonly maneuverType: string
}

interface WalkingRouteResult {
 readonly steps: readonly RouteStep[]
 readonly totalDistance: number
 readonly totalDuration: number
}

const fetchWalkingRoute = async (
 from: { lng: number; lat: number },
 to: { lng: number; lat: number },
 token: string,
): Promise<WalkingRouteResult | null> => {
 const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${from.lng},${from.lat};${to.lng},${to.lat}?steps=true&language=de&overview=false&access_token=${encodeURIComponent(token)}`

 try {
  const response = await fetch(url)
  if (!response.ok) return null

  const data = await response.json()
  const route = data?.routes?.[0]
  if (!route) return null

  const leg = route.legs?.[0]
  const steps: RouteStep[] = (leg?.steps ?? []).map((s: Record<string, unknown>) => ({
   instruction: (s.maneuver as Record<string, unknown>)?.instruction as string ?? '',
   distance: s.distance as number ?? 0,
   duration: s.duration as number ?? 0,
   maneuverType: (s.maneuver as Record<string, unknown>)?.type as string ?? '',
  }))

  return {
   steps,
   totalDistance: leg?.distance as number ?? 0,
   totalDuration: leg?.duration as number ?? 0,
  }
 } catch {
  return null
 }
}

// Map maneuver types to arrow symbols
const maneuverIcon = (type: string): string => {
 switch (type) {
  case 'turn':
  case 'end of road':
   return '↱'
  case 'depart':
   return '↑'
  case 'arrive':
   return '◎'
  case 'roundabout':
  case 'rotary':
   return '↻'
  case 'fork':
   return '⑂'
  case 'merge':
   return '⤙'
  default:
   return '→'
 }
}

const formatDuration = (seconds: number): string => {
 const mins = Math.round(seconds / 60)
 if (mins < 1) return '< 1 Min.'
 return `${mins} Min.`
}


// ---------------------------------------------------------------------------
// MapView component
// ---------------------------------------------------------------------------

export function MapView({ stations, currentStationIndex, onStationSelect, showRoute = false, isDemo = false }: MapViewProps) {
 const mapContainerRef = useRef<HTMLDivElement | null>(null)
 const mapRef = useRef<mapboxgl.Map | null>(null)
 const markersRef = useRef<mapboxgl.Marker[]>([])
 const userMarkerRef = useRef<mapboxgl.Marker | null>(null)

 const [isMapLoaded, setIsMapLoaded] = useState(false)
 const [mapError, setMapError] = useState<string | null>(null)
 const [navigationInfo, setNavigationInfo] = useState<{
  readonly steps: readonly RouteStep[]
  readonly totalDistance: number
  readonly totalDuration: number
 } | null>(null)

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

 // In demo mode, ALWAYS simulate a position ~200m south-west of the current station
 // so the walking route is visible regardless of real GPS
 const effectiveUserLocation = useMemo(() => {
  if (isDemo && currentStation) {
   return {
    lat: currentStation.location.lat - 0.0018,
    lng: currentStation.location.lng - 0.0012,
    accuracy: 10,
    timestamp: Date.now(),
   }
  }
  return userLocation
 }, [userLocation, isDemo, currentStation])

 // Distance to current station
 const distanceToCurrentStation = useMemo(() => {
  if (!effectiveUserLocation || !currentStation) return null

  const userPoint: GeoPoint = {
   lat: effectiveUserLocation.lat,
   lng: effectiveUserLocation.lng,
  }

  return calculateHaversineDistance(userPoint, currentStation.location)
 }, [effectiveUserLocation, currentStation])

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
    maxBounds: WARNEMUENDE_BOUNDS,
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
     maxzoom: DEM_MAX_ZOOM,
    })

    // Enable 3D terrain (Warnemünde is flat → subtle exaggeration)
    map.setTerrain({ source: 'mapbox-dem', exaggeration: TERRAIN_EXAGGERATION })

    // Vintage look: faded theme with warm dusk lighting
    map.setConfigProperty('basemap', 'theme', 'faded')
    map.setConfigProperty('basemap', 'lightPreset', 'dusk')
    map.setConfigProperty('basemap', 'show3dObjects', true)

    // Hide all non-game labels for a clean, game-focused map
    map.setConfigProperty('basemap', 'showPointOfInterestLabels', false)
    map.setConfigProperty('basemap', 'showTransitLabels', false)
    map.setConfigProperty('basemap', 'showPlaceLabels', false)
    map.setConfigProperty('basemap', 'showRoadLabels', false)

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

  // Sort: locked first, completed second, current last (= rendered on top)
  const sortedMarkers = [...stationMarkers].sort((a, b) => {
   const order: Record<StationStatus, number> = { locked: 0, completed: 1, current: 2 }
   return order[a.status] - order[b.status]
  })

  const newMarkers = sortedMarkers.map((info) => {
   const el = createStationMarkerElement(info)

   const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
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
  if (!mapRef.current || !isMapLoaded || !effectiveUserLocation) return

  if (!userMarkerRef.current) {
   const el = createUserMarkerElement()
   userMarkerRef.current = new mapboxgl.Marker({ element: el })
    .setLngLat([effectiveUserLocation.lng, effectiveUserLocation.lat])
    .addTo(mapRef.current)
  } else {
   userMarkerRef.current.setLngLat([effectiveUserLocation.lng, effectiveUserLocation.lat])
  }
 }, [effectiveUserLocation, isMapLoaded])

 // Center map on current station when it changes
 const centerOnCurrentStation = useCallback(() => {
  if (!mapRef.current || !currentStation) return

  mapRef.current.flyTo({
   center: [currentStation.location.lng, currentStation.location.lat],
   zoom: 16,
   pitch: DEFAULT_PITCH,
   bearing: DEFAULT_BEARING,
   duration: FLY_TO_DURATION_MS,
  })
 }, [currentStation])

 useEffect(() => {
  if (isMapLoaded && !showRoute) {
   centerOnCurrentStation()
  }
 }, [isMapLoaded, centerOnCurrentStation, showRoute])

 // Walking route: fetch + draw when showRoute is active
 const lastRouteFetchRef = useRef<number>(0)

 useEffect(() => {
  if (!mapRef.current || !isMapLoaded) return

  // Clear navigation when not in navigation mode
  if (!showRoute) {
   setNavigationInfo(null)
   return
  }

  if (!currentStation) return

  const map = mapRef.current
  const to = { lng: currentStation.location.lng, lat: currentStation.location.lat }

  // Check if user is close enough to Warnemünde to show a walking route
  const userIsNearby = effectiveUserLocation
   ? calculateHaversineDistance(
      { lat: effectiveUserLocation.lat, lng: effectiveUserLocation.lng },
      { lat: WARNEMUENDE_CENTER[1], lng: WARNEMUENDE_CENTER[0] },
     ) < MAX_ROUTE_DISTANCE_M
   : false

  // If user is too far away or no location, just zoom to the station
  if (!effectiveUserLocation || !userIsNearby) {
   setNavigationInfo(null)
   map.flyTo({
    center: [to.lng, to.lat],
    zoom: 16.5,
    pitch: DEFAULT_PITCH,
    bearing: DEFAULT_BEARING,
    duration: FLY_TO_DURATION_MS,
   })
   return
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return

  // Debounce route fetches so we don't spam the API as user moves
  const now = Date.now()
  if (now - lastRouteFetchRef.current < ROUTE_FETCH_DEBOUNCE_MS) return
  lastRouteFetchRef.current = now

  const from = { lng: effectiveUserLocation.lng, lat: effectiveUserLocation.lat }

  fetchWalkingRoute(from, to, token).then((result) => {
   if (!result || !mapRef.current) return

   setNavigationInfo({
    steps: result.steps,
    totalDistance: result.totalDistance,
    totalDuration: result.totalDuration,
   })

   // Fit map to show user + destination
   const bounds = new mapboxgl.LngLatBounds()
   bounds.extend([from.lng, from.lat])
   bounds.extend([to.lng, to.lat])

   map.fitBounds(bounds, {
    padding: { top: 120, bottom: 160, left: 60, right: 60 },
    minZoom: 14,
    maxZoom: 17,
    pitch: 50,
    duration: FLY_TO_DURATION_MS,
   })
  })
 }, [showRoute, effectiveUserLocation, currentStation, isMapLoaded])

 // Error state
 if (mapError) {
  return (
   <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl p-8" style={{ background: 'rgba(10, 10, 10, 0.5)' }}>
    <div className="text-center">
     <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400/70" strokeWidth={1.5} />
     <p className="text-sm text-red-400/80">{mapError}</p>
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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-dark-900">
     <div className="text-center">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      <p className="text-sm text-white/70 font-semibold">Karte wird geladen...</p>
     </div>
    </div>
   )}

   {/* Navigation panel — shown when walking route is active */}
   {isMapLoaded && showRoute && navigationInfo && currentStation && (
    <NavigationPanel
     steps={navigationInfo.steps}
     totalDistance={navigationInfo.totalDistance}
     totalDuration={navigationInfo.totalDuration}
     stationName={currentStation.nameDe}
    />
   )}

   {/* Legend — hidden when navigation panel is shown */}
   {isMapLoaded && !navigationInfo && <MapLegend />}

   {/* Re-center button */}
   {isMapLoaded && currentStation && (
    <button
     onClick={centerOnCurrentStation}
     className="absolute top-4 right-16 z-10 btn-icon-md text-white"
     aria-label="Karte auf aktuelle Station zentrieren"
    >
     <LocateFixed className="h-4.5 w-4.5" strokeWidth={1.5} />
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
