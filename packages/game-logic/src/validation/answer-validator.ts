import type { AnswerValidationMode } from '@escape-tour/shared'

interface ValidationConfig {
  readonly mode: AnswerValidationMode
  readonly correctAnswer: Readonly<Record<string, unknown>>
  readonly caseSensitive: boolean
}

/**
 * Validates a submitted answer against the correct answer.
 * Pure function - no side effects.
 */
export function validateAnswer(
  submittedAnswer: unknown,
  config: ValidationConfig,
): boolean {
  const { mode, correctAnswer, caseSensitive } = config

  switch (mode) {
    case 'exact':
      return validateExact(submittedAnswer, correctAnswer, caseSensitive)
    case 'contains':
      return validateContains(submittedAnswer, correctAnswer, caseSensitive)
    case 'regex':
      return validateRegex(submittedAnswer, correctAnswer, caseSensitive)
    case 'range':
      return validateRange(submittedAnswer, correctAnswer)
    case 'gps_proximity':
      return validateGpsProximity(submittedAnswer, correctAnswer)
    case 'multiple':
      return validateMultiple(submittedAnswer, correctAnswer, caseSensitive)
    default:
      return false
  }
}

function validateExact(
  submitted: unknown,
  correct: Readonly<Record<string, unknown>>,
  caseSensitive: boolean,
): boolean {
  const submittedStr = String(submitted)
  const correctStr = String(correct.answer)

  if (caseSensitive) {
    return submittedStr === correctStr
  }
  return submittedStr.toLowerCase() === correctStr.toLowerCase()
}

function validateContains(
  submitted: unknown,
  correct: Readonly<Record<string, unknown>>,
  caseSensitive: boolean,
): boolean {
  const submittedStr = String(submitted)
  const correctStr = String(correct.answer)

  if (caseSensitive) {
    return submittedStr.includes(correctStr)
  }
  return submittedStr.toLowerCase().includes(correctStr.toLowerCase())
}

function validateRegex(
  submitted: unknown,
  correct: Readonly<Record<string, unknown>>,
  caseSensitive: boolean,
): boolean {
  const pattern = String(correct.pattern)
  const flags = caseSensitive ? '' : 'i'

  try {
    const regex = new RegExp(pattern, flags)
    return regex.test(String(submitted))
  } catch {
    return false
  }
}

function validateRange(
  submitted: unknown,
  correct: Readonly<Record<string, unknown>>,
): boolean {
  const num = Number(submitted)
  if (Number.isNaN(num)) return false

  const min = Number(correct.min)
  const max = Number(correct.max)
  return num >= min && num <= max
}

function validateGpsProximity(
  submitted: unknown,
  correct: Readonly<Record<string, unknown>>,
): boolean {
  if (!submitted || typeof submitted !== 'object') return false

  const submittedLocation = submitted as { lat?: number; lng?: number }
  const targetLat = Number(correct.lat)
  const targetLng = Number(correct.lng)
  const radiusMeters = Number(correct.radius ?? 50)

  if (submittedLocation.lat == null || submittedLocation.lng == null) return false

  const distance = calculateDistanceMeters(
    submittedLocation.lat,
    submittedLocation.lng,
    targetLat,
    targetLng,
  )

  return distance <= radiusMeters
}

function validateMultiple(
  submitted: unknown,
  correct: Readonly<Record<string, unknown>>,
  caseSensitive: boolean,
): boolean {
  const answers = correct.answers as readonly string[]
  if (!Array.isArray(answers)) return false

  const submittedStr = String(submitted)

  return answers.some((answer) => {
    if (caseSensitive) {
      return submittedStr === answer
    }
    return submittedStr.toLowerCase() === answer.toLowerCase()
  })
}

/**
 * Haversine formula: distance between two GPS points in meters.
 */
function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000 // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export { calculateDistanceMeters }
