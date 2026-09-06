/**
 * Tests for the navigation refresh decision.
 *
 * The walking-route effect had `effectiveUserLocation` in its dependencies.
 * GPS updates roughly once a second, so the effect tore down and rebuilt
 * itself every second and its debounce let a Directions request through every
 * three seconds — each one followed by a 2.5 second camera animation. The map
 * could not be panned by hand any more, and an eight minute walk between two
 * stations burned ~160 API calls.
 */
import { describe, it, expect } from 'vitest'
import { shouldRefetchRoute, shouldRecenterCamera } from '@/lib/map/route-refresh'

const LIGHTHOUSE = { lat: 54.1814, lng: 12.0858 }

/** Roughly `meters` north of the given point. */
function metersNorth(from: { lat: number; lng: number }, meters: number) {
  return { lat: from.lat + meters / 111_320, lng: from.lng }
}

describe('shouldRefetchRoute', () => {
  it('should fetch when there is no previous route', () => {
    expect(
      shouldRefetchRoute(null, { stationId: 'station-1', from: LIGHTHOUSE }),
    ).toBe(true)
  })

  it('should fetch when the station changed', () => {
    expect(
      shouldRefetchRoute(
        { stationId: 'station-1', from: LIGHTHOUSE },
        { stationId: 'station-2', from: LIGHTHOUSE },
      ),
    ).toBe(true)
  })

  it('should not fetch for GPS jitter on the spot', () => {
    // A stationary phone still reports a slightly different position every
    // second. That must not trigger a request.
    expect(
      shouldRefetchRoute(
        { stationId: 'station-1', from: LIGHTHOUSE },
        { stationId: 'station-1', from: metersNorth(LIGHTHOUSE, 5) },
      ),
    ).toBe(false)
  })

  it('should not fetch after a few steps', () => {
    expect(
      shouldRefetchRoute(
        { stationId: 'station-1', from: LIGHTHOUSE },
        { stationId: 'station-1', from: metersNorth(LIGHTHOUSE, 25) },
      ),
    ).toBe(false)
  })

  it('should fetch once the guest has actually walked on', () => {
    expect(
      shouldRefetchRoute(
        { stationId: 'station-1', from: LIGHTHOUSE },
        { stationId: 'station-1', from: metersNorth(LIGHTHOUSE, 80) },
      ),
    ).toBe(true)
  })

  it('should respect a custom threshold', () => {
    const previous = { stationId: 'station-1', from: LIGHTHOUSE }
    const next = { stationId: 'station-1', from: metersNorth(LIGHTHOUSE, 25) }

    expect(shouldRefetchRoute(previous, next, 10)).toBe(true)
    expect(shouldRefetchRoute(previous, next, 100)).toBe(false)
  })

  it('should fetch when the previous position is unknown', () => {
    expect(
      shouldRefetchRoute(
        { stationId: 'station-1', from: null },
        { stationId: 'station-1', from: LIGHTHOUSE },
      ),
    ).toBe(true)
  })
})

describe('shouldRecenterCamera', () => {
  it('should move the camera for a new station', () => {
    expect(shouldRecenterCamera(null, 'station-1')).toBe(true)
    expect(shouldRecenterCamera('station-1', 'station-2')).toBe(true)
  })

  it('should leave the camera alone while walking to the same station', () => {
    // This is what made the map unusable: every refreshed route re-fitted the
    // bounds, so a pan by hand was undone within seconds.
    expect(shouldRecenterCamera('station-1', 'station-1')).toBe(false)
  })
})
