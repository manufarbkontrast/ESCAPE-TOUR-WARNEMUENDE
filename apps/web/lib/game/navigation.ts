import type { GeoPoint } from '@escape-tour/shared'

export const WARNEMUENDE_CENTER_POINT: GeoPoint = {
  lat: 54.1797,
  lng: 12.0853,
}

export const MAX_NAVIGATION_DISTANCE_M = 5_000

export function haversineDistanceMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6_371e3
  const phi1 = (a.lat * Math.PI) / 180
  const phi2 = (b.lat * Math.PI) / 180
  const deltaPhi = ((b.lat - a.lat) * Math.PI) / 180
  const deltaLambda = ((b.lng - a.lng) * Math.PI) / 180

  const x =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2)

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function isWithinNavigationRange(
  userLocation: GeoPoint | null,
): boolean {
  if (!userLocation) return false

  return (
    haversineDistanceMeters(userLocation, WARNEMUENDE_CENTER_POINT) <=
    MAX_NAVIGATION_DISTANCE_M
  )
}
