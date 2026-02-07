export type PuzzleType =
  | 'count'
  | 'photo_search'
  | 'symbol_find'
  | 'combination'
  | 'ar_puzzle'
  | 'audio'
  | 'logic'
  | 'navigation'
  | 'document_analysis'
  | 'text_analysis'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'finale'

export type AnswerType = 'text' | 'number' | 'multiple_choice' | 'code' | 'photo' | 'gps'

export type AnswerValidationMode =
  | 'exact'
  | 'contains'
  | 'regex'
  | 'range'
  | 'gps_proximity'
  | 'multiple'

export interface MultipleChoiceOption {
  readonly id: string
  readonly textDe: string
  readonly textEn: string | null
}

export interface ArContent {
  readonly targetDescription: string
  readonly overlayText: string
  readonly markerUrl: string | null
}

export interface Puzzle {
  readonly id: string
  readonly stationId: string
  readonly orderIndex: number
  readonly puzzleType: PuzzleType
  readonly difficulty: Difficulty
  readonly questionDe: string
  readonly questionEn: string | null
  readonly instructionDe: string | null
  readonly instructionEn: string | null
  readonly answerType: AnswerType
  readonly correctAnswer: Record<string, unknown>
  readonly answerValidationMode: AnswerValidationMode
  readonly caseSensitive: boolean
  readonly options: readonly MultipleChoiceOption[] | null
  readonly arMarkerUrl: string | null
  readonly arContent: ArContent | null
  readonly targetLocation: { readonly lat: number; readonly lng: number } | null
  readonly targetRadiusMeters: number | null
  readonly imageUrl: string | null
  readonly audioUrl: string | null
  readonly basePoints: number
  readonly timeBonusEnabled: boolean
  readonly timeBonusMaxSeconds: number
  readonly createdAt: string
  readonly updatedAt: string
}
