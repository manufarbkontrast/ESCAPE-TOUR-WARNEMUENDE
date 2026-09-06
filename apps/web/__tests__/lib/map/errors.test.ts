/**
 * Tests for the Mapbox error classifier.
 *
 * MapView used to treat every `error` event as fatal and replace the map with
 * a dead error box for the rest of the tour. Mapbox fires that event for any
 * failed tile, sprite or DEM request — on a 2-4 hour walk through Warnemünde
 * with patchy mobile coverage that is close to guaranteed.
 */
import { describe, it, expect } from 'vitest'
import { classifyMapError } from '@/lib/map/errors'

/** Shape of a Mapbox AjaxError as it arrives on the error event. */
function ajaxError(status: number, url = 'https://api.mapbox.com/v4/tile.pbf') {
  return { error: Object.assign(new Error(`AJAXError: ${status}`), { status, url }) }
}

describe('classifyMapError', () => {
  describe('nach dem Laden der Karte', () => {
    const loaded = { hasLoaded: true }

    it('should treat a failed tile as recoverable', () => {
      expect(classifyMapError({ ...ajaxError(404), sourceId: 'composite' }, loaded).severity).toBe(
        'recoverable',
      )
    })

    it('should treat a server error on a tile as recoverable', () => {
      expect(classifyMapError(ajaxError(500), loaded).severity).toBe('recoverable')
    })

    it('should treat a dropped connection as recoverable', () => {
      const offline = { error: new Error('Failed to fetch') }
      expect(classifyMapError(offline, loaded).severity).toBe('recoverable')
    })

    it('should never kill a map that already rendered, whatever the error', () => {
      // Once the style is up the map is usable. Nothing arriving later is
      // worth throwing the tour away for.
      const weird = { error: new Error('something entirely unexpected') }
      expect(classifyMapError(weird, loaded).severity).toBe('recoverable')
      expect(classifyMapError(undefined, loaded).severity).toBe('recoverable')
      expect(classifyMapError(ajaxError(401), loaded).severity).toBe('recoverable')
    })
  })

  describe('vor dem Laden der Karte', () => {
    const notLoaded = { hasLoaded: false }

    it('should treat an unauthorized style request as fatal', () => {
      // 401/403 means the token is wrong or restricted — retrying is pointless
      // and the map will never render.
      const result = classifyMapError(ajaxError(401, 'https://api.mapbox.com/styles/v1/...'), notLoaded)
      expect(result.severity).toBe('fatal')
      expect(result.message).toMatch(/Zugriff|Token/i)
    })

    it('should treat a forbidden style request as fatal', () => {
      expect(classifyMapError(ajaxError(403), notLoaded).severity).toBe('fatal')
    })

    it('should treat a failed tile as recoverable even before load', () => {
      // A single missing tile must not prevent the map from coming up.
      expect(
        classifyMapError({ ...ajaxError(404), sourceId: 'composite' }, notLoaded).severity,
      ).toBe('recoverable')
    })

    it('should treat a plain resource failure as recoverable', () => {
      expect(classifyMapError(ajaxError(500), notLoaded).severity).toBe('recoverable')
    })

    it('should treat an error without a status as fatal before load', () => {
      // No HTTP status and the map never came up — this is a style or WebGL
      // problem the user cannot walk away from.
      const result = classifyMapError({ error: new Error('WebGL context lost') }, notLoaded)
      expect(result.severity).toBe('fatal')
      expect(result.message).toContain('WebGL context lost')
    })

    it('should treat an unreadable event as fatal before load', () => {
      expect(classifyMapError(undefined, notLoaded).severity).toBe('fatal')
      expect(classifyMapError(null, notLoaded).severity).toBe('fatal')
    })
  })

  it('should always return a message that can be shown to a guest', () => {
    const cases: unknown[] = [
      undefined,
      null,
      {},
      { error: new Error('boom') },
      ajaxError(404),
      ajaxError(401),
    ]

    for (const hasLoaded of [true, false]) {
      for (const event of cases) {
        const { message } = classifyMapError(event, { hasLoaded })
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      }
    }
  })
})
