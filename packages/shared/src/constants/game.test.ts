import { describe, it, expect } from 'vitest'
import {
  TOTAL_STATIONS,
  MAX_GROUP_SIZE,
  DEFAULT_STATION_RADIUS_METERS,
  HINT_LEVELS,
  TIME_BONUS_MAX_PERCENT,
  ATTEMPT_PENALTY_PERCENT,
  MAX_ATTEMPT_PENALTY_PERCENT,
  BADGE_THRESHOLDS,
  OFFLINE_MAX_RETRIES,
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
} from './game'

describe('Game Constants', () => {
  describe('TOTAL_STATIONS', () => {
    it('should be 8 stations per tour', () => {
      expect(TOTAL_STATIONS).toBe(8)
    })
  })

  describe('MAX_GROUP_SIZE', () => {
    it('should allow maximum 6 players', () => {
      expect(MAX_GROUP_SIZE).toBe(6)
    })
  })

  describe('DEFAULT_STATION_RADIUS_METERS', () => {
    it('should be 50 meters for GPS proximity', () => {
      expect(DEFAULT_STATION_RADIUS_METERS).toBe(50)
    })
  })

  describe('HINT_LEVELS', () => {
    it('should define 4 hint levels', () => {
      expect(Object.keys(HINT_LEVELS)).toHaveLength(4)
    })

    it('should have progressive hint levels', () => {
      expect(HINT_LEVELS.SMALL_HINT).toBe(1)
      expect(HINT_LEVELS.MEDIUM_HINT).toBe(2)
      expect(HINT_LEVELS.BIG_HINT).toBe(3)
      expect(HINT_LEVELS.SHOW_SOLUTION).toBe(4)
    })

    it('should have ascending values', () => {
      expect(HINT_LEVELS.SMALL_HINT).toBeLessThan(HINT_LEVELS.MEDIUM_HINT)
      expect(HINT_LEVELS.MEDIUM_HINT).toBeLessThan(HINT_LEVELS.BIG_HINT)
      expect(HINT_LEVELS.BIG_HINT).toBeLessThan(HINT_LEVELS.SHOW_SOLUTION)
    })
  })

  describe('Scoring Constants', () => {
    it('should have time bonus max at 50%', () => {
      expect(TIME_BONUS_MAX_PERCENT).toBe(0.5)
    })

    it('should have 10% penalty per failed attempt', () => {
      expect(ATTEMPT_PENALTY_PERCENT).toBe(10)
    })

    it('should cap penalties at 50%', () => {
      expect(MAX_ATTEMPT_PENALTY_PERCENT).toBe(50)
    })

    it('should have max penalty >= single penalty', () => {
      expect(MAX_ATTEMPT_PENALTY_PERCENT).toBeGreaterThanOrEqual(
        ATTEMPT_PENALTY_PERCENT,
      )
    })
  })

  describe('BADGE_THRESHOLDS', () => {
    it('should require higher points for gold than silver', () => {
      expect(BADGE_THRESHOLDS.GOLD_MIN_POINTS).toBeGreaterThan(
        BADGE_THRESHOLDS.SILVER_MIN_POINTS,
      )
    })

    it('should require less time for gold than silver', () => {
      expect(BADGE_THRESHOLDS.GOLD_MAX_TIME_SECONDS).toBeLessThan(
        BADGE_THRESHOLDS.SILVER_MAX_TIME_SECONDS,
      )
    })

    it('should have gold max time at 90 minutes', () => {
      expect(BADGE_THRESHOLDS.GOLD_MAX_TIME_SECONDS).toBe(5400)
    })

    it('should have silver max time at 2 hours', () => {
      expect(BADGE_THRESHOLDS.SILVER_MAX_TIME_SECONDS).toBe(7200)
    })

    it('should have silver max hints at 3', () => {
      expect(BADGE_THRESHOLDS.SILVER_MAX_HINTS).toBe(3)
    })
  })

  describe('Offline Constants', () => {
    it('should allow 3 retries', () => {
      expect(OFFLINE_MAX_RETRIES).toBe(3)
    })

    it('should have a named database', () => {
      expect(OFFLINE_DB_NAME).toBe('escape-tour-offline')
    })

    it('should be at version 1', () => {
      expect(OFFLINE_DB_VERSION).toBe(1)
    })
  })
})
