import { describe, it, expect } from 'vitest'
import {
  haversineDistanceMeters,
  isWithinNavigationRange,
  MAX_NAVIGATION_DISTANCE_M,
  WARNEMUENDE_CENTER_POINT,
} from '@/lib/game/navigation'

describe('haversineDistanceMeters', () => {
  it('should return 0 for identical points', () => {
    const point = { lat: 54.1797, lng: 12.0853 }
    expect(haversineDistanceMeters(point, point)).toBe(0)
  })

  it('should compute distance between known points within tolerance', () => {
    // Warnemünde lighthouse → Teepott (~70m line of sight)
    const lighthouse = { lat: 54.1814, lng: 12.0858 }
    const teepott = { lat: 54.1815, lng: 12.0848 }
    const distance = haversineDistanceMeters(lighthouse, teepott)
    expect(distance).toBeGreaterThan(50)
    expect(distance).toBeLessThan(120)
  })

  it('should compute Berlin → Warnemünde at ~200km', () => {
    const berlin = { lat: 52.52, lng: 13.405 }
    const distance = haversineDistanceMeters(berlin, WARNEMUENDE_CENTER_POINT)
    expect(distance).toBeGreaterThan(180_000)
    expect(distance).toBeLessThan(230_000)
  })

  it('should be symmetric', () => {
    const a = { lat: 54.18, lng: 12.08 }
    const b = { lat: 54.17, lng: 12.09 }
    expect(haversineDistanceMeters(a, b)).toBeCloseTo(
      haversineDistanceMeters(b, a),
      6,
    )
  })
})

describe('isWithinNavigationRange', () => {
  it('should return false when userLocation is null', () => {
    expect(isWithinNavigationRange(null)).toBe(false)
  })

  it('should return true at the Warnemünde center itself', () => {
    expect(isWithinNavigationRange(WARNEMUENDE_CENTER_POINT)).toBe(true)
  })

  it('should return true at a station inside the bounds', () => {
    const lighthouse = { lat: 54.1814, lng: 12.0858 }
    expect(isWithinNavigationRange(lighthouse)).toBe(true)
  })

  it('should return true at just under 5km from center', () => {
    // ~4.5km north of Warnemünde center → still within range
    const northOfCenter = { lat: 54.2202, lng: 12.0853 }
    const distance = haversineDistanceMeters(
      northOfCenter,
      WARNEMUENDE_CENTER_POINT,
    )
    expect(distance).toBeLessThan(MAX_NAVIGATION_DISTANCE_M)
    expect(isWithinNavigationRange(northOfCenter)).toBe(true)
  })

  it('should return false at well over 5km from center (Rostock)', () => {
    const rostock = { lat: 54.0833, lng: 12.1333 }
    expect(isWithinNavigationRange(rostock)).toBe(false)
  })

  it('should return false at the test location (Berlin)', () => {
    const berlin = { lat: 52.52, lng: 13.405 }
    expect(isWithinNavigationRange(berlin)).toBe(false)
  })
})
