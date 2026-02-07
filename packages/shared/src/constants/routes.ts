/** Marketing routes */
export const ROUTES = {
  HOME: '/',
  TOURS: '/touren',
  PRICES: '/preise',
  CONTACT: '/kontakt',
  LOGIN: '/login',
  REGISTER: '/register',

  /** Game routes (require session) */
  GAME_INTRO: '/play/:sessionId/intro',
  GAME_STATION: '/play/:sessionId/station/:stationId',
  GAME_MAP: '/play/:sessionId/map',
  GAME_INVENTORY: '/play/:sessionId/inventory',
  GAME_HINTS: '/play/:sessionId/hints',
  GAME_CERTIFICATE: '/play/:sessionId/certificate',

  /** Admin routes */
  ADMIN_DASHBOARD: '/dashboard',
  ADMIN_SESSIONS: '/sessions',
  ADMIN_ANALYTICS: '/analytics',
  ADMIN_CONTENT: '/content',
  ADMIN_SETTINGS: '/settings',
} as const

/**
 * Build a parameterized route
 */
export function buildRoute(
  route: string,
  params: Readonly<Record<string, string>>,
): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route,
  )
}
