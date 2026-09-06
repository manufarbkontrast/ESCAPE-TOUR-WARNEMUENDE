/**
 * Decides when the walking route has to be recalculated and when the camera
 * may move.
 *
 * Recalculating on every GPS update meant a Directions request every three
 * seconds, each followed by a 2.5 second camera flight — the guest could not
 * hold the map still long enough to look at anything. A route stays valid
 * while the guest walks along it; it only needs replacing once they have
 * moved far enough for the turn-by-turn steps to be stale.
 */

import type { GeoPoint } from '@escape-tour/shared'
import { haversineDistanceMeters } from '@/lib/game/navigation'

/**
 * How far the guest has to move before the route is refetched.
 *
 * Below this, the existing directions still describe the way. Consumer GPS
 * drifts by 10-20 m while standing still, so the threshold also has to sit
 * clear of that noise.
 */
export const ROUTE_REFRESH_DISTANCE_M = 50

export interface RouteFetchState {
  /** Station the route was calculated towards. */
  readonly stationId: string | null
  /** Position the route was calculated from. */
  readonly from: GeoPoint | null
}

/** True when the walking route has to be requested again. */
export function shouldRefetchRoute(
  previous: RouteFetchState | null,
  next: RouteFetchState,
  minimumMoveMeters: number = ROUTE_REFRESH_DISTANCE_M
): boolean {
  if (!previous || !previous.from || !next.from) {
    return true
  }

  if (previous.stationId !== next.stationId) {
    return true
  }

  return haversineDistanceMeters(previous.from, next.from) >= minimumMoveMeters
}

/**
 * True when the camera may be moved.
 *
 * Only on arrival at a new destination — otherwise a refreshed route would
 * undo whatever the guest just panned or zoomed to.
 */
export function shouldRecenterCamera(
  previousStationId: string | null,
  nextStationId: string | null
): boolean {
  return previousStationId !== nextStationId
}
