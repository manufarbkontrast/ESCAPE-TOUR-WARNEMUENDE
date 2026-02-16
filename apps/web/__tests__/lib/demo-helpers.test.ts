import { describe, it, expect } from 'vitest'
import {
  isDemoSession,
  isDemoBookingCode,
  isDemoPuzzle,
  validateDemoAnswer,
} from '@/lib/demo/helpers'
import { DEMO_SESSION_ID, DEMO_BOOKING_CODE } from '@/lib/demo/data'

describe('isDemoSession', () => {
  it('should return true for demo session ID', () => {
    expect(isDemoSession(DEMO_SESSION_ID)).toBe(true)
  })

  it('should return false for non-demo session ID', () => {
    expect(isDemoSession('some-other-id')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isDemoSession('')).toBe(false)
  })
})

describe('isDemoBookingCode', () => {
  it('should return true for demo booking code', () => {
    expect(isDemoBookingCode(DEMO_BOOKING_CODE)).toBe(true)
  })

  it('should return true for lowercase demo code', () => {
    expect(isDemoBookingCode('demo01')).toBe(true)
  })

  it('should return false for non-demo code', () => {
    expect(isDemoBookingCode('ABC123')).toBe(false)
  })
})

describe('isDemoPuzzle', () => {
  it('should return true for demo puzzle IDs', () => {
    expect(isDemoPuzzle('demo-puzzle-001')).toBe(true)
    expect(isDemoPuzzle('demo-puzzle-005')).toBe(true)
  })

  it('should return false for non-demo puzzle ID', () => {
    expect(isDemoPuzzle('real-puzzle-001')).toBe(false)
  })
})

describe('validateDemoAnswer', () => {
  it('should return correct for right answer (puzzle 001 - count)', () => {
    const result = validateDemoAnswer('demo-puzzle-001', 135, 30)
    expect(result.isCorrect).toBe(true)
    expect(result.pointsEarned).toBe(100)
    expect(result.timeBonusEarned).toBeGreaterThan(0)
    expect(result.feedback.type).toBe('success')
  })

  it('should return incorrect for wrong answer', () => {
    const result = validateDemoAnswer('demo-puzzle-001', 999, 30)
    expect(result.isCorrect).toBe(false)
    expect(result.pointsEarned).toBe(0)
    expect(result.timeBonusEarned).toBe(0)
    expect(result.feedback.type).toBe('error')
  })

  it('should return error for non-existent puzzle', () => {
    const result = validateDemoAnswer('nonexistent', 'test', 10)
    expect(result.isCorrect).toBe(false)
    expect(result.feedback.type).toBe('error')
    expect(result.feedback.messageDe).toContain('nicht gefunden')
  })

  it('should handle case-insensitive text answers (puzzle 003)', () => {
    const result = validateDemoAnswer('demo-puzzle-003', 'warnemuende', 60)
    expect(result.isCorrect).toBe(true)
  })

  it('should handle case-insensitive text answers (puzzle 005)', () => {
    const result = validateDemoAnswer('demo-puzzle-005', 'anker', 20)
    expect(result.isCorrect).toBe(true)
  })

  it('should award no time bonus when time exceeds max', () => {
    const result = validateDemoAnswer('demo-puzzle-001', 135, 999)
    expect(result.isCorrect).toBe(true)
    expect(result.timeBonusEarned).toBe(0)
  })

  it('should award full time bonus for instant solve', () => {
    const result = validateDemoAnswer('demo-puzzle-001', 135, 0)
    expect(result.isCorrect).toBe(true)
    // Max bonus = round(100 * 0.5 * 1.0) = 50
    expect(result.timeBonusEarned).toBe(50)
  })

  it('should handle multiple choice answer (puzzle 002)', () => {
    const result = validateDemoAnswer('demo-puzzle-002', 'b', 30)
    expect(result.isCorrect).toBe(true)
    expect(result.pointsEarned).toBe(150)
  })

  it('should reject wrong multiple choice answer', () => {
    const result = validateDemoAnswer('demo-puzzle-002', 'a', 30)
    expect(result.isCorrect).toBe(false)
  })
})
