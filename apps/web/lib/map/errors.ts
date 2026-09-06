/**
 * Classifies Mapbox GL `error` events.
 *
 * Mapbox fires `error` for anything that fails to load — a tile, a sprite, a
 * DEM chunk — not just for problems that break the map. Treating all of them
 * as fatal meant a single dropped request on a walk through Warnemünde
 * replaced the map with an error box for the rest of the tour.
 *
 * The rule: once the style has loaded, the map is usable and nothing that
 * arrives later is worth discarding it for. Before that, only a rejected
 * request (wrong or restricted token) or a failure with no HTTP status at all
 * is fatal — a missing tile is not.
 */

export type MapErrorSeverity = 'fatal' | 'recoverable'

export interface MapErrorInfo {
  readonly severity: MapErrorSeverity
  /** German, safe to render to a guest. */
  readonly message: string
}

/** HTTP statuses that mean the token is wrong or restricted. */
const AUTH_STATUSES: ReadonlySet<number> = new Set([401, 403])

const MESSAGES = {
  auth: 'Kein Zugriff auf die Kartendaten. Bitte prüft den Mapbox-Token.',
  unknown: 'Die Karte konnte nicht geladen werden.',
  recoverable: 'Ein Kartenelement konnte nicht geladen werden.',
} as const

interface MapErrorLike {
  readonly error?: { readonly message?: string; readonly status?: number }
  readonly sourceId?: string
  readonly source?: unknown
}

function asMapError(event: unknown): MapErrorLike | null {
  return typeof event === 'object' && event !== null ? (event as MapErrorLike) : null
}

export function classifyMapError(
  event: unknown,
  options: { readonly hasLoaded: boolean }
): MapErrorInfo {
  const details = asMapError(event)
  const status = details?.error?.status
  const message = details?.error?.message

  // A rendered map stays. Tiles will retry on the next pan or zoom, and the
  // guest can keep playing meanwhile.
  if (options.hasLoaded) {
    return { severity: 'recoverable', message: message ?? MESSAGES.recoverable }
  }

  // Wrong or domain-restricted token: retrying changes nothing.
  if (typeof status === 'number' && AUTH_STATUSES.has(status)) {
    return { severity: 'fatal', message: MESSAGES.auth }
  }

  // Any other failed request is a single missing resource, not a dead map.
  if (typeof status === 'number' || details?.sourceId !== undefined) {
    return { severity: 'recoverable', message: message ?? MESSAGES.recoverable }
  }

  // No status and the map never came up — style or WebGL problem.
  return { severity: 'fatal', message: message ?? MESSAGES.unknown }
}
