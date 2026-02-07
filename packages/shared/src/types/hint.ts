export interface Hint {
  readonly id: string
  readonly puzzleId: string
  readonly hintLevel: number
  readonly textDe: string
  readonly textEn: string | null
  readonly pointPenalty: number
  readonly timeBonusPenaltyPercent: number
  readonly marksAsSkipped: boolean
  readonly availableAfterSeconds: number
  readonly createdAt: string
}
