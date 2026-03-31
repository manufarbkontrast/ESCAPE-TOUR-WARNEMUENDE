/**
 * Demo mode helper functions.
 * Used by API routes to detect and handle demo requests.
 */

import type { ValidationResult } from '@escape-tour/shared'
import {
  DEMO_SESSION_ID,
  DEMO_BOOKING_CODE,
  DEMO_PUZZLES,
} from './data'

/**
 * Check if a session ID belongs to the demo session.
 */
export function isDemoSession(sessionId: string): boolean {
  return sessionId === DEMO_SESSION_ID
}

/**
 * Check if a session ID belongs to a staff-created session.
 */
export function isStaffSession(sessionId: string): boolean {
  return sessionId.startsWith('staff-')
}

/**
 * Check if a session uses local/demo data (no Supabase).
 */
export function isOfflineSession(sessionId: string): boolean {
  return isDemoSession(sessionId) || isStaffSession(sessionId)
}

/**
 * Check if a booking code is the demo code.
 */
export function isDemoBookingCode(code: string): boolean {
  return code.toUpperCase() === DEMO_BOOKING_CODE
}

/**
 * Check if a puzzle ID belongs to a demo puzzle.
 */
export function isDemoPuzzle(puzzleId: string): boolean {
  return DEMO_PUZZLES.some((p) => p.id === puzzleId)
}

/**
 * Validate an answer against the demo puzzle's correct answer.
 * Returns a ValidationResult matching the shared type contract.
 */
export function validateDemoAnswer(
  puzzleId: string,
  answer: unknown,
  timeSpentSeconds: number,
): ValidationResult {
  const puzzle = DEMO_PUZZLES.find((p) => p.id === puzzleId)

  if (!puzzle) {
    return {
      isCorrect: false,
      pointsEarned: 0,
      timeBonusEarned: 0,
      feedback: {
        messageDe: 'Raetsel nicht gefunden.',
        messageEn: 'Puzzle not found.',
        type: 'error',
      },
    }
  }

  const correctValue = puzzle.correctAnswer.value
  const isCorrect = checkAnswer(answer, correctValue, puzzle.caseSensitive)

  if (!isCorrect) {
    return {
      isCorrect: false,
      pointsEarned: 0,
      timeBonusEarned: 0,
      feedback: {
        messageDe: 'Leider falsch! Versucht es noch einmal.',
        messageEn: 'Not quite right! Try again.',
        type: 'error',
      },
    }
  }

  // Calculate time bonus
  const timeBonusEarned = puzzle.timeBonusEnabled
    ? calculateTimeBonus(puzzle.basePoints, timeSpentSeconds, puzzle.timeBonusMaxSeconds)
    : 0

  return {
    isCorrect: true,
    pointsEarned: puzzle.basePoints,
    timeBonusEarned,
    feedback: {
      messageDe: 'Richtig! Weiter zur naechsten Aufgabe.',
      messageEn: 'Correct! On to the next challenge.',
      type: 'success',
    },
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function checkAnswer(
  submitted: unknown,
  correct: unknown,
  caseSensitive: boolean,
): boolean {
  const submittedStr = String(submitted).trim()
  const correctStr = String(correct).trim()

  if (caseSensitive) {
    return submittedStr === correctStr
  }

  return submittedStr.toLowerCase() === correctStr.toLowerCase()
}

function calculateTimeBonus(
  basePoints: number,
  timeSpentSeconds: number,
  maxSeconds: number,
): number {
  if (timeSpentSeconds >= maxSeconds) return 0

  const ratio = 1 - timeSpentSeconds / maxSeconds
  const bonus = Math.round(basePoints * 0.5 * ratio)
  return Math.max(0, bonus)
}
