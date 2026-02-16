import { describe, it, expect } from 'vitest'
import { validateAnswer, calculateDistanceMeters } from './answer-validator'

describe('validateAnswer', () => {
  describe('exact mode', () => {
    it('should match exact answer (case insensitive)', () => {
      const result = validateAnswer('Leuchtturm', {
        mode: 'exact',
        correctAnswer: { answer: 'leuchtturm' },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should match exact answer (case sensitive)', () => {
      const result = validateAnswer('Leuchtturm', {
        mode: 'exact',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: true,
      })
      expect(result).toBe(true)
    })

    it('should reject wrong case when case sensitive', () => {
      const result = validateAnswer('leuchtturm', {
        mode: 'exact',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: true,
      })
      expect(result).toBe(false)
    })

    it('should reject incorrect answers', () => {
      const result = validateAnswer('Rathaus', {
        mode: 'exact',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })

    it('should handle numeric answers via string coercion', () => {
      const result = validateAnswer(42, {
        mode: 'exact',
        correctAnswer: { answer: '42' },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })
  })

  describe('contains mode', () => {
    it('should match when answer contains the keyword', () => {
      const result = validateAnswer('Der alte Leuchtturm steht dort', {
        mode: 'contains',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should be case insensitive by default', () => {
      const result = validateAnswer('der leuchtturm', {
        mode: 'contains',
        correctAnswer: { answer: 'LEUCHTTURM' },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should reject when keyword not present', () => {
      const result = validateAnswer('Die Kirche ist alt', {
        mode: 'contains',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })

    it('should match case sensitive contains', () => {
      const result = validateAnswer('Der Leuchtturm ist gross', {
        mode: 'contains',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: true,
      })
      expect(result).toBe(true)
    })

    it('should reject wrong case when case sensitive', () => {
      const result = validateAnswer('der leuchtturm ist gross', {
        mode: 'contains',
        correctAnswer: { answer: 'Leuchtturm' },
        caseSensitive: true,
      })
      expect(result).toBe(false)
    })
  })

  describe('regex mode', () => {
    it('should match a simple regex pattern', () => {
      const result = validateAnswer('1857', {
        mode: 'regex',
        correctAnswer: { pattern: '^18\\d{2}$' },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should reject non-matching input', () => {
      const result = validateAnswer('2024', {
        mode: 'regex',
        correctAnswer: { pattern: '^18\\d{2}$' },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })

    it('should handle case insensitive regex', () => {
      const result = validateAnswer('LIGHTHOUSE', {
        mode: 'regex',
        correctAnswer: { pattern: 'lighthouse' },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should handle invalid regex gracefully', () => {
      const result = validateAnswer('test', {
        mode: 'regex',
        correctAnswer: { pattern: '[invalid' },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })
  })

  describe('range mode', () => {
    it('should accept value within range', () => {
      const result = validateAnswer(15, {
        mode: 'range',
        correctAnswer: { min: 10, max: 20 },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should accept boundary values', () => {
      expect(
        validateAnswer(10, {
          mode: 'range',
          correctAnswer: { min: 10, max: 20 },
          caseSensitive: false,
        }),
      ).toBe(true)

      expect(
        validateAnswer(20, {
          mode: 'range',
          correctAnswer: { min: 10, max: 20 },
          caseSensitive: false,
        }),
      ).toBe(true)
    })

    it('should reject values outside range', () => {
      const result = validateAnswer(25, {
        mode: 'range',
        correctAnswer: { min: 10, max: 20 },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })

    it('should handle string numbers', () => {
      const result = validateAnswer('15', {
        mode: 'range',
        correctAnswer: { min: 10, max: 20 },
        caseSensitive: false,
      })
      expect(result).toBe(true)
    })

    it('should reject non-numeric input', () => {
      const result = validateAnswer('abc', {
        mode: 'range',
        correctAnswer: { min: 10, max: 20 },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })
  })

  describe('gps_proximity mode', () => {
    // Warnemuende lighthouse: approx 54.1797, 12.0853
    const lighthouseConfig = {
      mode: 'gps_proximity' as const,
      correctAnswer: { lat: 54.1797, lng: 12.0853, radius: 50 },
      caseSensitive: false,
    }

    it('should accept location within radius', () => {
      const result = validateAnswer(
        { lat: 54.1797, lng: 12.0853 },
        lighthouseConfig,
      )
      expect(result).toBe(true)
    })

    it('should accept location at edge of radius', () => {
      // ~30m offset (approx 0.0003 degrees latitude)
      const result = validateAnswer(
        { lat: 54.18, lng: 12.0853 },
        lighthouseConfig,
      )
      // ~33m offset - should be within 50m
      expect(result).toBe(true)
    })

    it('should reject location outside radius', () => {
      // ~1km away
      const result = validateAnswer(
        { lat: 54.19, lng: 12.0853 },
        lighthouseConfig,
      )
      expect(result).toBe(false)
    })

    it('should reject null/undefined input', () => {
      expect(validateAnswer(null, lighthouseConfig)).toBe(false)
      expect(validateAnswer(undefined, lighthouseConfig)).toBe(false)
    })

    it('should reject non-object input', () => {
      expect(validateAnswer('54.1797,12.0853', lighthouseConfig)).toBe(false)
    })

    it('should reject object without lat/lng', () => {
      expect(validateAnswer({ x: 54.1797, y: 12.0853 }, lighthouseConfig)).toBe(false)
    })

    it('should default radius to 50m when not specified', () => {
      const config = {
        mode: 'gps_proximity' as const,
        correctAnswer: { lat: 54.1797, lng: 12.0853 },
        caseSensitive: false,
      }
      const result = validateAnswer(
        { lat: 54.1797, lng: 12.0853 },
        config,
      )
      expect(result).toBe(true)
    })
  })

  describe('multiple mode', () => {
    const multiConfig = {
      mode: 'multiple' as const,
      correctAnswer: { answers: ['Leuchtturm', 'Lighthouse', 'Der Leuchtturm'] },
      caseSensitive: false,
    }

    it('should accept any of the correct answers', () => {
      expect(validateAnswer('Leuchtturm', multiConfig)).toBe(true)
      expect(validateAnswer('Lighthouse', multiConfig)).toBe(true)
      expect(validateAnswer('Der Leuchtturm', multiConfig)).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(validateAnswer('leuchtturm', multiConfig)).toBe(true)
      expect(validateAnswer('LIGHTHOUSE', multiConfig)).toBe(true)
    })

    it('should reject incorrect answers', () => {
      expect(validateAnswer('Rathaus', multiConfig)).toBe(false)
    })

    it('should handle case sensitive mode', () => {
      const config = { ...multiConfig, caseSensitive: true }
      expect(validateAnswer('leuchtturm', config)).toBe(false)
      expect(validateAnswer('Leuchtturm', config)).toBe(true)
    })
  })

  describe('unknown mode', () => {
    it('should return false for unknown validation mode', () => {
      const result = validateAnswer('test', {
        mode: 'unknown_mode' as any,
        correctAnswer: { answer: 'test' },
        caseSensitive: false,
      })
      expect(result).toBe(false)
    })
  })
})

describe('calculateDistanceMeters', () => {
  it('should return 0 for same point', () => {
    const distance = calculateDistanceMeters(54.1797, 12.0853, 54.1797, 12.0853)
    expect(distance).toBe(0)
  })

  it('should calculate correct distance for known points', () => {
    // Warnemuende lighthouse to Warnemuende station ~1.2km
    const distance = calculateDistanceMeters(54.1797, 12.0853, 54.1714, 12.0898)
    expect(distance).toBeGreaterThan(900)
    expect(distance).toBeLessThan(1500)
  })

  it('should be symmetric', () => {
    const d1 = calculateDistanceMeters(54.1797, 12.0853, 54.1714, 12.0898)
    const d2 = calculateDistanceMeters(54.1714, 12.0898, 54.1797, 12.0853)
    expect(Math.abs(d1 - d2)).toBeLessThan(0.01)
  })

  it('should handle crossing the equator', () => {
    const distance = calculateDistanceMeters(1, 0, -1, 0)
    // ~222km
    expect(distance).toBeGreaterThan(200_000)
    expect(distance).toBeLessThan(250_000)
  })
})
