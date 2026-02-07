import {
  TIME_BONUS_MAX_PERCENT,
  ATTEMPT_PENALTY_PERCENT,
  MAX_ATTEMPT_PENALTY_PERCENT,
  BADGE_THRESHOLDS,
} from '@escape-tour/shared'
import type { BadgeLevel } from '@escape-tour/shared'

interface ScoreInput {
  readonly basePoints: number
  readonly timeSpentSeconds: number
  readonly timeBonusMaxSeconds: number
  readonly timeBonusEnabled: boolean
  readonly previousAttempts: number
  readonly hintsUsedBefore: number
  readonly hintPointPenalty: number
}

interface ScoreResult {
  readonly pointsEarned: number
  readonly timeBonusEarned: number
  readonly totalForPuzzle: number
}

/**
 * Calculate score for a correctly solved puzzle.
 * Pure function - no side effects.
 */
export function calculateScore(input: ScoreInput): ScoreResult {
  const {
    basePoints,
    timeSpentSeconds,
    timeBonusMaxSeconds,
    timeBonusEnabled,
    previousAttempts,
    hintPointPenalty,
  } = input

  // Base points with attempt penalty
  const attemptPenaltyPercent = Math.min(
    previousAttempts * ATTEMPT_PENALTY_PERCENT,
    MAX_ATTEMPT_PENALTY_PERCENT,
  )
  const pointsAfterAttemptPenalty = Math.floor(basePoints * (1 - attemptPenaltyPercent / 100))

  // Subtract hint penalties
  const pointsEarned = Math.max(0, pointsAfterAttemptPenalty - hintPointPenalty)

  // Time bonus
  let timeBonusEarned = 0
  if (timeBonusEnabled && timeSpentSeconds < timeBonusMaxSeconds) {
    const bonusPercent = 1 - timeSpentSeconds / timeBonusMaxSeconds
    timeBonusEarned = Math.floor(basePoints * TIME_BONUS_MAX_PERCENT * bonusPercent)
  }

  return {
    pointsEarned,
    timeBonusEarned,
    totalForPuzzle: pointsEarned + timeBonusEarned,
  }
}

interface BadgeInput {
  readonly totalPoints: number
  readonly totalTimeSeconds: number
  readonly hintsUsed: number
  readonly puzzlesSkipped: number
}

/**
 * Determine the badge level based on session stats.
 * Pure function - no side effects.
 */
export function determineBadge(input: BadgeInput): BadgeLevel {
  const { totalPoints, totalTimeSeconds, hintsUsed, puzzlesSkipped } = input

  if (puzzlesSkipped > 0) return 'bronze'
  if (hintsUsed > BADGE_THRESHOLDS.SILVER_MAX_HINTS) return 'silver'
  if (totalTimeSeconds > BADGE_THRESHOLDS.SILVER_MAX_TIME_SECONDS) return 'silver'

  if (
    totalPoints > BADGE_THRESHOLDS.GOLD_MIN_POINTS &&
    totalTimeSeconds < BADGE_THRESHOLDS.GOLD_MAX_TIME_SECONDS
  ) {
    return 'gold'
  }

  if (totalPoints > BADGE_THRESHOLDS.SILVER_MIN_POINTS) return 'silver'

  return 'bronze'
}

/**
 * Calculate session duration in seconds, excluding pause time.
 */
export function calculateSessionDurationSeconds(
  startedAt: string,
  completedAt: string,
  totalPauseSeconds: number,
): number {
  const startTime = new Date(startedAt).getTime()
  const endTime = new Date(completedAt).getTime()
  return Math.floor((endTime - startTime) / 1000) - totalPauseSeconds
}
