import { create } from 'zustand'
import type { GeoPoint } from '@escape-tour/shared'
import { GPS_DISABLED } from '@/lib/config'

interface UserLocation {
  readonly lat: number
  readonly lng: number
  readonly accuracy: number
  readonly timestamp: number
}

interface LocationState {
  readonly userLocation: UserLocation | null
  readonly watchId: number | null
  readonly isTracking: boolean
  readonly error: string | null
}

interface LocationActions {
  readonly startWatching: () => void
  readonly stopWatching: () => void
  readonly checkProximity: (target: GeoPoint, radiusMeters: number) => boolean
  readonly setLocation: (location: UserLocation) => void
  readonly setError: (error: string | null) => void
}

type LocationStore = LocationState & LocationActions

const initialState: LocationState = {
  userLocation: null,
  watchId: null,
  isTracking: false,
  error: null,
}

const calculateDistance = (point1: GeoPoint, point2: GeoPoint): number => {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180
  const φ2 = (point2.lat * Math.PI) / 180
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  ...initialState,

  startWatching: () => {
    const state = get()

    if (state.isTracking) {
      return
    }

    if (GPS_DISABLED) {
      set({
        isTracking: false,
        watchId: null,
        error: null,
      })
      return
    }

    if (!navigator.geolocation) {
      set({
        error: 'Geolocation is not supported by this browser',
        isTracking: false,
      })
      return
    }

    const successHandler = (position: GeolocationPosition) => {
      const location: UserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      }

      set({
        userLocation: location,
        error: null,
      })
    }

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown location error'

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
      }

      set({
        error: errorMessage,
        isTracking: false,
        watchId: null,
      })
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options
    )

    set({
      watchId,
      isTracking: true,
      error: null,
    })
  },

  stopWatching: () => {
    if (GPS_DISABLED) {
      set({
        watchId: null,
        isTracking: false,
      })
      return
    }

    const state = get()

    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId)
    }

    set({
      watchId: null,
      isTracking: false,
    })
  },

  checkProximity: (target: GeoPoint, radiusMeters: number): boolean => {
    const state = get()

    if (!state.userLocation) {
      return false
    }

    const userPoint: GeoPoint = {
      lat: state.userLocation.lat,
      lng: state.userLocation.lng,
    }

    const distance = calculateDistance(userPoint, target)

    return distance <= radiusMeters
  },

  setLocation: (location: UserLocation) => {
    set({
      userLocation: location,
      error: null,
    })
  },

  setError: (error: string | null) => {
    set({
      error,
    })
  },
}))
