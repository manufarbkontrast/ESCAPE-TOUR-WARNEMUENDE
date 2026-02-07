import { describe, it, expect } from 'vitest'
import { ROUTES, buildRoute } from './routes'

describe('Routes', () => {
  describe('ROUTES constant', () => {
    it('should have a home route', () => {
      expect(ROUTES.HOME).toBe('/')
    })

    it('should define marketing routes', () => {
      expect(ROUTES.TOURS).toBe('/touren')
      expect(ROUTES.PRICES).toBe('/preise')
      expect(ROUTES.CONTACT).toBe('/kontakt')
    })

    it('should define auth routes', () => {
      expect(ROUTES.LOGIN).toBe('/login')
      expect(ROUTES.REGISTER).toBe('/register')
    })

    it('should define game routes with parameter placeholders', () => {
      expect(ROUTES.GAME_INTRO).toContain(':sessionId')
      expect(ROUTES.GAME_STATION).toContain(':sessionId')
      expect(ROUTES.GAME_STATION).toContain(':stationId')
      expect(ROUTES.GAME_MAP).toContain(':sessionId')
      expect(ROUTES.GAME_CERTIFICATE).toContain(':sessionId')
    })

    it('should define admin routes', () => {
      expect(ROUTES.ADMIN_DASHBOARD).toBe('/dashboard')
      expect(ROUTES.ADMIN_SESSIONS).toBe('/sessions')
      expect(ROUTES.ADMIN_ANALYTICS).toBe('/analytics')
    })
  })

  describe('buildRoute', () => {
    it('should replace a single parameter', () => {
      const result = buildRoute('/play/:sessionId/intro', { sessionId: 'abc123' })
      expect(result).toBe('/play/abc123/intro')
    })

    it('should replace multiple parameters', () => {
      const result = buildRoute('/play/:sessionId/station/:stationId', {
        sessionId: 'sess-1',
        stationId: 'station-5',
      })
      expect(result).toBe('/play/sess-1/station/station-5')
    })

    it('should return the route unchanged if no params match', () => {
      const result = buildRoute('/static/path', { unused: 'value' })
      expect(result).toBe('/static/path')
    })

    it('should handle UUID-style parameters', () => {
      const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      const result = buildRoute(ROUTES.GAME_MAP, { sessionId: uuid })
      expect(result).toBe(`/play/${uuid}/map`)
    })

    it('should handle empty params object', () => {
      const result = buildRoute('/play/:sessionId', {})
      expect(result).toBe('/play/:sessionId')
    })
  })
})
