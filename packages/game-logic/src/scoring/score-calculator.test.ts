import { describe, it, expect } from 'vitest'
import {
  calculateScore,
  determineBadge,
  calculateSessionDurationSeconds,
} from './score-calculator'

describe('calculateScore', () => {
  const baseInput = {
    basePoints: 100,
    timeSpentSeconds: 30,
    timeBonusMaxSeconds: 120,
    timeBonusEnabled: true,
    previousAttempts: 0,
    hintsUsedBefore: 0,
    hintPointPenalty: 0,
  } as const

  describe('base points', () => {
    it('should return full base points with no penalties', () => {
      const result = calculateScore(baseInput)
      expect(result.pointsEarned).toBe(100)
    })

    it('should never return negative points', () => {
      const result = calculateScore({
        ...baseInput,
        hintPointPenalty: 200,
      })
      expect(result.pointsEarned).toBe(0)
    })
  })

  describe('attempt penalties', () => {
    it('should apply 10% penalty per attempt', () => {
      const result = calculateScore({
        ...baseInput,
        previousAttempts: 1,
      })
      expect(result.pointsEarned).toBe(90)
    })

    it('should apply 20% penalty for 2 attempts', () => {
      const result = calculateScore({
        ...baseInput,
        previousAttempts: 2,
      })
      expect(result.pointsEarned).toBe(80)
    })

    it('should cap penalty at 50%', () => {
      const result = calculateScore({
        ...baseInput,
        previousAttempts: 10,
      })
      expect(result.pointsEarned).toBe(50)
    })
  })

  describe('hint penalties', () => {
    it('should subtract hint point penalty', () => {
      const result = calculateScore({
        ...baseInput,
        hintPointPenalty: 25,
      })
      expect(result.pointsEarned).toBe(75)
    })

    it('should combine attempt and hint penalties', () => {
      const result = calculateScore({
        ...baseInput,
        previousAttempts: 2,
        hintPointPenalty: 20,
      })
      // 100 * (1 - 0.2) = 80, then 80 - 20 = 60
      expect(result.pointsEarned).toBe(60)
    })
  })

  describe('time bonus', () => {
    it('should award time bonus when under max time', () => {
      const result = calculateScore({
        ...baseInput,
        timeSpentSeconds: 30,
        timeBonusMaxSeconds: 120,
      })
      // bonusPercent = 1 - 30/120 = 0.75
      // bonus = floor(100 * 0.5 * 0.75) = floor(37.5) = 37
      expect(result.timeBonusEarned).toBe(37)
    })

    it('should award no time bonus when over max time', () => {
      const result = calculateScore({
        ...baseInput,
        timeSpentSeconds: 150,
        timeBonusMaxSeconds: 120,
      })
      expect(result.timeBonusEarned).toBe(0)
    })

    it('should award no time bonus when exactly at max time', () => {
      const result = calculateScore({
        ...baseInput,
        timeSpentSeconds: 120,
        timeBonusMaxSeconds: 120,
      })
      expect(result.timeBonusEarned).toBe(0)
    })

    it('should award full bonus for instant solve', () => {
      const result = calculateScore({
        ...baseInput,
        timeSpentSeconds: 0,
        timeBonusMaxSeconds: 120,
      })
      // bonusPercent = 1 - 0/120 = 1.0
      // bonus = floor(100 * 0.5 * 1.0) = 50
      expect(result.timeBonusEarned).toBe(50)
    })

    it('should skip time bonus when disabled', () => {
      const result = calculateScore({
        ...baseInput,
        timeBonusEnabled: false,
        timeSpentSeconds: 0,
      })
      expect(result.timeBonusEarned).toBe(0)
    })
  })

  describe('totalForPuzzle', () => {
    it('should sum points and time bonus', () => {
      const result = calculateScore(baseInput)
      expect(result.totalForPuzzle).toBe(result.pointsEarned + result.timeBonusEarned)
    })

    it('should handle all penalties combined', () => {
      const result = calculateScore({
        ...baseInput,
        previousAttempts: 3,
        hintPointPenalty: 10,
        timeSpentSeconds: 60,
        timeBonusMaxSeconds: 120,
      })
      // attempts: 100 * (1 - 0.3) = 70
      // hints: 70 - 10 = 60
      // time bonus: 1 - 60/120 = 0.5, floor(100 * 0.5 * 0.5) = 25
      // total: 60 + 25 = 85
      expect(result.pointsEarned).toBe(60)
      expect(result.timeBonusEarned).toBe(25)
      expect(result.totalForPuzzle).toBe(85)
    })
  })
})

describe('determineBadge', () => {
  describe('gold badge', () => {
    it('should award gold for high points + fast time + no hints/skips', () => {
      const result = determineBadge({
        totalPoints: 900,
        totalTimeSeconds: 4000,
        hintsUsed: 0,
        puzzlesSkipped: 0,
      })
      expect(result).toBe('gold')
    })
  })

  describe('silver badge', () => {
    it('should award silver for moderate points', () => {
      const result = determineBadge({
        totalPoints: 750,
        totalTimeSeconds: 6000,
        hintsUsed: 2,
        puzzlesSkipped: 0,
      })
      expect(result).toBe('silver')
    })

    it('should award silver when too many hints used', () => {
      const result = determineBadge({
        totalPoints: 900,
        totalTimeSeconds: 4000,
        hintsUsed: 4,
        puzzlesSkipped: 0,
      })
      expect(result).toBe('silver')
    })

    it('should award silver when time exceeds silver threshold', () => {
      const result = determineBadge({
        totalPoints: 900,
        totalTimeSeconds: 8000,
        hintsUsed: 0,
        puzzlesSkipped: 0,
      })
      expect(result).toBe('silver')
    })
  })

  describe('bronze badge', () => {
    it('should award bronze when puzzles are skipped', () => {
      const result = determineBadge({
        totalPoints: 900,
        totalTimeSeconds: 3000,
        hintsUsed: 0,
        puzzlesSkipped: 1,
      })
      expect(result).toBe('bronze')
    })

    it('should award bronze for low points', () => {
      const result = determineBadge({
        totalPoints: 500,
        totalTimeSeconds: 6000,
        hintsUsed: 2,
        puzzlesSkipped: 0,
      })
      expect(result).toBe('bronze')
    })
  })
})

describe('calculateSessionDurationSeconds', () => {
  it('should calculate duration excluding pause time', () => {
    const start = '2025-02-07T10:00:00Z'
    const end = '2025-02-07T11:30:00Z'
    const pauseSeconds = 600 // 10 minutes pause

    const result = calculateSessionDurationSeconds(start, end, pauseSeconds)
    // 90 minutes = 5400 seconds, minus 600 pause = 4800
    expect(result).toBe(4800)
  })

  it('should return 0 for instant completion with no pause', () => {
    const time = '2025-02-07T10:00:00Z'
    const result = calculateSessionDurationSeconds(time, time, 0)
    expect(result).toBe(0)
  })

  it('should handle zero pause time', () => {
    const start = '2025-02-07T10:00:00Z'
    const end = '2025-02-07T10:30:00Z'
    const result = calculateSessionDurationSeconds(start, end, 0)
    expect(result).toBe(1800) // 30 minutes
  })

  it('should floor to whole seconds', () => {
    const start = '2025-02-07T10:00:00.000Z'
    const end = '2025-02-07T10:00:01.500Z'
    const result = calculateSessionDurationSeconds(start, end, 0)
    expect(result).toBe(1)
  })
})
