/**
 * Tour location configuration.
 *
 * Single source of truth for the standort picker on the landing page.
 * Flip `available` to `true` (and add a booking route) once a city's tour
 * content exists — the UI reads this list, so no component changes are needed
 * to launch a new standort.
 */

export interface TourLocation {
  /** Stable slug, also used as booking query param */
  readonly id: string
  /** Display name */
  readonly name: string
  /** Short context line under the name (region / character) */
  readonly region: string
  /** Whether the tour is bookable today; false renders as "Bald verfügbar" */
  readonly available: boolean
  /** Target route for an available location (its tour page). */
  readonly href?: string
}

export const TOUR_LOCATIONS: ReadonlyArray<TourLocation> = [
  {
    id: 'warnemuende',
    name: 'Warnemünde',
    region: 'Ostsee · Leuchtturm',
    available: true,
    href: '/warnemuende',
  },
  {
    id: 'rostock',
    name: 'Rostock',
    region: 'Ostsee · Hansestadt',
    available: false,
  },
  {
    id: 'stralsund',
    name: 'Stralsund',
    region: 'Ostsee · Welterbe',
    available: false,
  },
  {
    id: 'kuehlungsborn',
    name: 'Kühlungsborn',
    region: 'Ostsee · Ostseebad',
    available: false,
  },
] as const

/** First bookable location, used as the picker's default selection. */
export const DEFAULT_LOCATION: TourLocation | null =
  TOUR_LOCATIONS.find((location) => location.available) ?? null
