export type SessionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'expired'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  readonly id: string
  readonly userId: string | null
  readonly tourId: string
  readonly bookingCode: string
  readonly status: BookingStatus
  readonly scheduledDate: string
  readonly scheduledTime: string | null
  readonly teamName: string | null
  readonly participantCount: number
  readonly amountCents: number
  readonly paymentIntentId: string | null
  readonly paidAt: string | null
  readonly contactEmail: string
  readonly contactPhone: string | null
  readonly validFrom: string | null
  readonly validUntil: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface GameSession {
  readonly id: string
  readonly bookingId: string
  readonly tourId: string
  readonly status: SessionStatus
  readonly teamName: string | null
  readonly startedAt: string | null
  readonly pausedAt: string | null
  readonly completedAt: string | null
  readonly totalPauseSeconds: number
  readonly currentStationIndex: number
  readonly totalPoints: number
  readonly hintsUsed: number
  readonly puzzlesSkipped: number
  readonly deviceInfo: Record<string, unknown> | null
  readonly lastKnownLocation: { readonly lat: number; readonly lng: number } | null
  readonly lastActivityAt: string | null
  readonly offlineData: Record<string, unknown> | null
  readonly needsSync: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface StationProgress {
  readonly id: string
  readonly sessionId: string
  readonly stationId: string
  readonly unlockedAt: string | null
  readonly startedAt: string | null
  readonly completedAt: string | null
  readonly pointsEarned: number
  readonly timeBonusEarned: number
  readonly unlockLocation: { readonly lat: number; readonly lng: number } | null
  readonly unlockAccuracyMeters: number | null
  readonly createdAt: string
}

export interface PuzzleAttempt {
  readonly id: string
  readonly sessionId: string
  readonly puzzleId: string
  readonly attemptNumber: number
  readonly submittedAnswer: unknown
  readonly isCorrect: boolean
  readonly hintsUsedBefore: number
  readonly timeSpentSeconds: number | null
  readonly submittedAt: string
  readonly deviceType: string | null
  readonly inputMethod: string | null
}
