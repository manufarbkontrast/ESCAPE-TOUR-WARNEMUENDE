import { create } from 'zustand'
import type { GeoPoint } from '@escape-tour/shared'
import { haversineDistanceMeters } from '@/lib/game/navigation'

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
  readonly permissionDenied: boolean
}

interface StartWatchingOptions {
  readonly force?: boolean
}

interface LocationActions {
  readonly startWatching: (options?: StartWatchingOptions) => void
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
  permissionDenied: false,
}

// Drop GPS updates arriving faster than this — walking-pace gameplay
// doesn't need more, and each update triggers React re-renders.
const POSITION_UPDATE_MIN_INTERVAL_MS = 1_000

const GEOLOCATION_TIMEOUT_MS = 10_000
const GEOLOCATION_MAX_AGE_MS = 5_000

export const useLocationStore = create<LocationStore>((set, get) => ({
  ...initialState,

  startWatching: (options?: StartWatchingOptions) => {
    const state = get()

    if (state.isTracking) {
      return
    }

    // After an explicit denial, only retry when the user asks for it
    // (e.g. via the GPS button) — otherwise effects would loop forever.
    if (state.permissionDenied && !options?.force) {
      return
    }

    if (!navigator.geolocation) {
      set({
        error: 'Geolocation is not supported by this browser',
        isTracking: false,
      })
      return
    }

    let lastAcceptedTimestamp = 0

    const successHandler = (position: GeolocationPosition) => {
      if (
        lastAcceptedTimestamp !== 0 &&
        position.timestamp - lastAcceptedTimestamp <
          POSITION_UPDATE_MIN_INTERVAL_MS
      ) {
        return
      }
      // maximumAge can deliver cached fixes with older timestamps — never
      // move the throttle clock backwards or it lets bursts through.
      lastAcceptedTimestamp = Math.max(lastAcceptedTimestamp, position.timestamp)

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
      if (error.code === error.PERMISSION_DENIED) {
        const { watchId } = get()
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
        }
        set({
          error: 'Location permission denied',
          isTracking: false,
          watchId: null,
          permissionDenied: true,
        })
        return
      }

      // Transient errors (timeout, position unavailable): keep the watch
      // alive — the browser keeps retrying and a later fix recovers.
      const errorMessage =
        error.code === error.POSITION_UNAVAILABLE
          ? 'Location information unavailable'
          : error.code === error.TIMEOUT
            ? 'Location request timed out'
            : 'Unknown location error'

      set({ error: errorMessage })
    }

    const watchOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT_MS,
      maximumAge: GEOLOCATION_MAX_AGE_MS,
    }

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      watchOptions
    )

    set({
      watchId,
      isTracking: true,
      error: null,
      permissionDenied: false,
    })
  },

  stopWatching: () => {
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

    return haversineDistanceMeters(userPoint, target) <= radiusMeters
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
