/**
 * Standard API response envelope
 */
export interface ApiResponse<T> {
  readonly success: boolean
  readonly data: T | null
  readonly error: string | null
  readonly meta?: ApiMeta
}

export interface ApiMeta {
  readonly total?: number
  readonly page?: number
  readonly limit?: number
}

/**
 * Answer validation request/response
 */
export interface AnswerRequest {
  readonly sessionId: string
  readonly puzzleId: string
  readonly answer: string | number | Record<string, unknown>
  readonly location?: { readonly lat: number; readonly lng: number; readonly accuracy: number }
  readonly timeSpentSeconds: number
}

export interface ValidationResult {
  readonly isCorrect: boolean
  readonly pointsEarned: number
  readonly timeBonusEarned: number
  readonly feedback: {
    readonly messageDe: string
    readonly messageEn: string
    readonly type: 'success' | 'error' | 'partial'
  }
  readonly nextAction?: {
    readonly type: 'unlock_station' | 'show_content' | 'complete_tour'
    readonly data: Record<string, unknown>
  }
}

/**
 * Certificate data
 */
export type BadgeLevel = 'bronze' | 'silver' | 'gold'

export interface Certificate {
  readonly id: string
  readonly sessionId: string
  readonly teamName: string
  readonly tourName: string
  readonly variant: 'family' | 'adult'
  readonly date: string
  readonly stats: {
    readonly totalPoints: number
    readonly totalTimeMinutes: number
    readonly hintsUsed: number
    readonly puzzlesSkipped: number
    readonly stationsCompleted: number
  }
  readonly badge: BadgeLevel
  readonly verificationCode: string
}
