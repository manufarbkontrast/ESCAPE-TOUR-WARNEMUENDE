/**
 * Tests for locationStore — GPS tracking and proximity detection
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useLocationStore } from '@/stores/locationStore'

// ---------------------------------------------------------------------------
// Mock navigator.geolocation
// ---------------------------------------------------------------------------

const mockWatchPosition = vi.fn()
const mockClearWatch = vi.fn()

const mockGeolocation: Partial<Geolocation> = {
  watchPosition: mockWatchPosition,
  clearWatch: mockClearWatch,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('locationStore', () => {
  beforeEach(() => {
    // Reset store state
    useLocationStore.setState({
      userLocation: null,
      watchId: null,
      isTracking: false,
      error: null,
      permissionDenied: false,
    })
    vi.clearAllMocks()

    // Default: navigator.geolocation is available
    Object.defineProperty(globalThis, 'navigator', {
      value: { geolocation: mockGeolocation },
      writable: true,
      configurable: true,
    })
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('should have null user location', () => {
      expect(useLocationStore.getState().userLocation).toBeNull()
    })

    it('should not be tracking', () => {
      expect(useLocationStore.getState().isTracking).toBe(false)
    })

    it('should have no error', () => {
      expect(useLocationStore.getState().error).toBeNull()
    })

    it('should have null watchId', () => {
      expect(useLocationStore.getState().watchId).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // startWatching
  // -----------------------------------------------------------------------

  describe('startWatching', () => {
    it('should start tracking and set watchId', () => {
      mockWatchPosition.mockReturnValue(42)

      useLocationStore.getState().startWatching()

      const state = useLocationStore.getState()
      expect(state.isTracking).toBe(true)
      expect(state.watchId).toBe(42)
      expect(state.error).toBeNull()
    })

    it('should call watchPosition with high accuracy options', () => {
      mockWatchPosition.mockReturnValue(1)

      useLocationStore.getState().startWatching()

      expect(mockWatchPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }),
      )
    })

    it('should not start a second watcher when already tracking', () => {
      mockWatchPosition.mockReturnValue(1)

      useLocationStore.getState().startWatching()
      useLocationStore.getState().startWatching()

      expect(mockWatchPosition).toHaveBeenCalledTimes(1)
    })

    it('should set error when geolocation is not supported', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { geolocation: undefined },
        writable: true,
        configurable: true,
      })

      useLocationStore.getState().startWatching()

      const state = useLocationStore.getState()
      expect(state.error).toBe('Geolocation is not supported by this browser')
      expect(state.isTracking).toBe(false)
    })

    it('should update location on success callback', () => {
      mockWatchPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 54.1831,
            longitude: 12.0878,
            accuracy: 15,
          },
          timestamp: 1700000000000,
        })
        return 1
      })

      useLocationStore.getState().startWatching()

      const state = useLocationStore.getState()
      expect(state.userLocation).toEqual({
        lat: 54.1831,
        lng: 12.0878,
        accuracy: 15,
        timestamp: 1700000000000,
      })
      expect(state.error).toBeNull()
    })

    it('should handle PERMISSION_DENIED error', () => {
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        capturedError = error
        return 1
      })

      useLocationStore.getState().startWatching()

      // Fire error callback after startWatching completes
      capturedError!({
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'User denied',
      } as GeolocationPositionError)

      const state = useLocationStore.getState()
      expect(state.error).toBe('Location permission denied')
      expect(state.isTracking).toBe(false)
    })

    it('should handle POSITION_UNAVAILABLE error', () => {
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        capturedError = error
        return 1
      })

      useLocationStore.getState().startWatching()

      capturedError!({
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Unavailable',
      } as GeolocationPositionError)

      expect(useLocationStore.getState().error).toBe(
        'Location information unavailable',
      )
    })

    it('should handle TIMEOUT error', () => {
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        capturedError = error
        return 1
      })

      useLocationStore.getState().startWatching()

      capturedError!({
        code: 3,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Timeout',
      } as GeolocationPositionError)

      expect(useLocationStore.getState().error).toBe(
        'Location request timed out',
      )
    })

    it('should keep the watch alive on transient errors (timeout)', () => {
      let capturedSuccess: ((pos: GeolocationPosition) => void) | null = null
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation(
        (
          success: (pos: GeolocationPosition) => void,
          error: (err: GeolocationPositionError) => void,
        ) => {
          capturedSuccess = success
          capturedError = error
          return 1
        },
      )

      useLocationStore.getState().startWatching()

      capturedError!({
        code: 3,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'Timeout',
      } as GeolocationPositionError)

      // Watch keeps running — a later fix would otherwise leak a second watch
      expect(useLocationStore.getState().isTracking).toBe(true)
      expect(mockClearWatch).not.toHaveBeenCalled()

      // A later position clears the error
      capturedSuccess!({
        coords: { latitude: 54.18, longitude: 12.08, accuracy: 10 },
        timestamp: 1700000010000,
      } as GeolocationPosition)
      expect(useLocationStore.getState().error).toBeNull()
    })

    it('should set permissionDenied and clear the watch on PERMISSION_DENIED', () => {
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        capturedError = error
        return 7
      })

      useLocationStore.getState().startWatching()

      capturedError!({
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'User denied',
      } as GeolocationPositionError)

      const state = useLocationStore.getState()
      expect(state.permissionDenied).toBe(true)
      expect(state.isTracking).toBe(false)
      expect(mockClearWatch).toHaveBeenCalledWith(7)
    })

    it('should not restart automatically after permission denial', () => {
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        capturedError = error
        return 1
      })

      useLocationStore.getState().startWatching()
      capturedError!({
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'User denied',
      } as GeolocationPositionError)

      useLocationStore.getState().startWatching()

      expect(mockWatchPosition).toHaveBeenCalledTimes(1)
    })

    it('should allow a forced retry after permission denial', () => {
      let capturedError: ((err: GeolocationPositionError) => void) | null = null
      mockWatchPosition.mockImplementation((_success: unknown, error: (err: GeolocationPositionError) => void) => {
        capturedError = error
        return 1
      })

      useLocationStore.getState().startWatching()
      capturedError!({
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'User denied',
      } as GeolocationPositionError)

      useLocationStore.getState().startWatching({ force: true })

      expect(mockWatchPosition).toHaveBeenCalledTimes(2)
      expect(useLocationStore.getState().permissionDenied).toBe(false)
    })

    it('should throttle rapid position updates to ~1 per second', () => {
      let capturedSuccess: ((pos: GeolocationPosition) => void) | null = null
      mockWatchPosition.mockImplementation(
        (success: (pos: GeolocationPosition) => void) => {
          capturedSuccess = success
          return 1
        },
      )

      useLocationStore.getState().startWatching()

      const emit = (lat: number, timestamp: number) =>
        capturedSuccess!({
          coords: { latitude: lat, longitude: 12.08, accuracy: 10 },
          timestamp,
        } as GeolocationPosition)

      emit(54.18, 1_000)
      emit(54.1801, 1_200)
      emit(54.1802, 1_500)

      // Updates within 1s of the last accepted one are dropped
      expect(useLocationStore.getState().userLocation?.lat).toBe(54.18)

      emit(54.1803, 2_100)
      expect(useLocationStore.getState().userLocation?.lat).toBe(54.1803)
    })
  })

  // -----------------------------------------------------------------------
  // stopWatching
  // -----------------------------------------------------------------------

  describe('stopWatching', () => {
    it('should clear the watch and reset tracking state', () => {
      mockWatchPosition.mockReturnValue(42)
      useLocationStore.getState().startWatching()
      useLocationStore.getState().stopWatching()

      expect(mockClearWatch).toHaveBeenCalledWith(42)
      const state = useLocationStore.getState()
      expect(state.isTracking).toBe(false)
      expect(state.watchId).toBeNull()
    })

    it('should not call clearWatch when no active watcher', () => {
      useLocationStore.getState().stopWatching()

      expect(mockClearWatch).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // checkProximity
  // -----------------------------------------------------------------------

  describe('checkProximity', () => {
    it('should return false when no user location', () => {
      const result = useLocationStore
        .getState()
        .checkProximity({ lat: 54.1831, lng: 12.0878 }, 50)

      expect(result).toBe(false)
    })

    it('should return true when user is within radius', () => {
      // Set location to the Warnemünde lighthouse
      useLocationStore.getState().setLocation({
        lat: 54.1831,
        lng: 12.0878,
        accuracy: 10,
        timestamp: Date.now(),
      })

      // Target is essentially the same point
      const result = useLocationStore
        .getState()
        .checkProximity({ lat: 54.1831, lng: 12.0878 }, 50)

      expect(result).toBe(true)
    })

    it('should return false when user is outside radius', () => {
      // Set location to Warnemünde lighthouse
      useLocationStore.getState().setLocation({
        lat: 54.1831,
        lng: 12.0878,
        accuracy: 10,
        timestamp: Date.now(),
      })

      // Target is ~600m away at the Alter Strom
      const result = useLocationStore
        .getState()
        .checkProximity({ lat: 54.1773, lng: 12.083 }, 50)

      expect(result).toBe(false)
    })

    it('should correctly detect proximity at boundary distances', () => {
      // Two points approximately 100m apart
      useLocationStore.getState().setLocation({
        lat: 54.1831,
        lng: 12.0878,
        accuracy: 5,
        timestamp: Date.now(),
      })

      // Within 1000m radius
      const withinResult = useLocationStore
        .getState()
        .checkProximity({ lat: 54.1831, lng: 12.089 }, 1000)
      expect(withinResult).toBe(true)

      // Outside 5m radius
      const outsideResult = useLocationStore
        .getState()
        .checkProximity({ lat: 54.1831, lng: 12.089 }, 5)
      expect(outsideResult).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // setLocation / setError
  // -----------------------------------------------------------------------

  describe('setLocation', () => {
    it('should set location and clear error', () => {
      // Start with an error
      useLocationStore.getState().setError('previous error')

      useLocationStore.getState().setLocation({
        lat: 54.18,
        lng: 12.08,
        accuracy: 20,
        timestamp: Date.now(),
      })

      const state = useLocationStore.getState()
      expect(state.userLocation).toEqual(
        expect.objectContaining({ lat: 54.18, lng: 12.08 }),
      )
      expect(state.error).toBeNull()
    })
  })

  describe('setError', () => {
    it('should set the error message', () => {
      useLocationStore.getState().setError('GPS unavailable')

      expect(useLocationStore.getState().error).toBe('GPS unavailable')
    })

    it('should clear error when set to null', () => {
      useLocationStore.getState().setError('some error')
      useLocationStore.getState().setError(null)

      expect(useLocationStore.getState().error).toBeNull()
    })
  })
})
