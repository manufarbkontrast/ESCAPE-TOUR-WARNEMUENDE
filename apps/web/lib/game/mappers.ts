/**
 * Supabase row -> shared domain type mappers.
 *
 * The client components are written against the camelCase types in
 * `@escape-tour/shared`. PostgREST returns snake_case rows with nullable
 * columns and PostGIS blobs, so every row that leaves an API route passes
 * through here first.
 *
 * Rows are typed loosely on purpose: `packages/database/src/types/supabase.ts`
 * is out of date (it is missing `puzzles.target_location`,
 * `puzzles.target_radius_meters` and the station transition columns), so
 * trusting it would mean dropping fields the client needs.
 */

import type {
  AnswerType,
  AnswerValidationMode,
  ArContent,
  Difficulty,
  GameSession,
  MultipleChoiceOption,
  Puzzle,
  PuzzleType,
  SessionStatus,
  Station,
  ValidationResult,
} from '@escape-tour/shared'
import { parseGeoPoint } from './geo'

export { parseGeoPoint }

/** A PostgREST row. Unknown keys are expected — see the note above. */
export type DatabaseRow = Record<string, unknown>

const SESSION_STATUSES: ReadonlySet<string> = new Set([
  'pending',
  'active',
  'paused',
  'completed',
  'expired',
])

/** Stations default to a 50 m unlock radius (see docs/DATABASE_SCHEMA.md). */
const DEFAULT_STATION_RADIUS_METERS = 50

// ---------------------------------------------------------------------------
// Column readers
// ---------------------------------------------------------------------------

function str(row: DatabaseRow, key: string): string {
  const value = row[key]
  return typeof value === 'string' ? value : ''
}

function nullableStr(row: DatabaseRow, key: string): string | null {
  const value = row[key]
  return typeof value === 'string' ? value : null
}

function num(row: DatabaseRow, key: string, fallback: number): number {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function nullableNum(row: DatabaseRow, key: string): number | null {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function bool(row: DatabaseRow, key: string, fallback: boolean): boolean {
  const value = row[key]
  return typeof value === 'boolean' ? value : fallback
}

function jsonObject(row: DatabaseRow, key: string): Record<string, unknown> | null {
  const value = row[key]
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/** Timestamps are NOT NULL in practice but nullable in the generated types. */
function timestamp(row: DatabaseRow, key: string): string {
  return nullableStr(row, key) ?? new Date(0).toISOString()
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function mapSessionRow(row: DatabaseRow): GameSession {
  const status = str(row, 'status')

  return {
    id: str(row, 'id'),
    bookingId: str(row, 'booking_id'),
    tourId: str(row, 'tour_id'),
    status: (SESSION_STATUSES.has(status) ? status : 'pending') as SessionStatus,
    teamName: nullableStr(row, 'team_name'),
    startedAt: nullableStr(row, 'started_at'),
    pausedAt: nullableStr(row, 'paused_at'),
    completedAt: nullableStr(row, 'completed_at'),
    totalPauseSeconds: num(row, 'total_pause_seconds', 0),
    currentStationIndex: num(row, 'current_station_index', 0),
    totalPoints: num(row, 'total_points', 0),
    hintsUsed: num(row, 'hints_used', 0),
    puzzlesSkipped: num(row, 'puzzles_skipped', 0),
    deviceInfo: jsonObject(row, 'device_info'),
    lastKnownLocation: parseGeoPoint(row['last_known_location']),
    lastActivityAt: nullableStr(row, 'last_activity_at'),
    offlineData: jsonObject(row, 'offline_data'),
    needsSync: bool(row, 'needs_sync', false),
    createdAt: timestamp(row, 'created_at'),
    updatedAt: timestamp(row, 'updated_at'),
  }
}

export function mapStationRow(row: DatabaseRow): Station {
  return {
    id: str(row, 'id'),
    tourId: str(row, 'tour_id'),
    orderIndex: num(row, 'order_index', 0),
    nameDe: str(row, 'name_de'),
    nameEn: nullableStr(row, 'name_en'),
    subtitleDe: nullableStr(row, 'subtitle_de'),
    subtitleEn: nullableStr(row, 'subtitle_en'),
    // A station without a readable coordinate still has to render; the map
    // simply cannot place it.
    location: parseGeoPoint(row['location']) ?? { lat: 0, lng: 0 },
    locationName: nullableStr(row, 'location_name'),
    radiusMeters: num(row, 'radius_meters', DEFAULT_STATION_RADIUS_METERS),
    introTextDe: nullableStr(row, 'intro_text_de'),
    introTextEn: nullableStr(row, 'intro_text_en'),
    storyTextDe: nullableStr(row, 'story_text_de'),
    storyTextEn: nullableStr(row, 'story_text_en'),
    completionTextDe: nullableStr(row, 'completion_text_de'),
    completionTextEn: nullableStr(row, 'completion_text_en'),
    // These four columns are absent from the documented schema; the mapper
    // returns null when the deployed table does not have them yet.
    transitionTextDe: nullableStr(row, 'transition_text_de'),
    transitionTextEn: nullableStr(row, 'transition_text_en'),
    walkingHintDe: nullableStr(row, 'walking_hint_de'),
    walkingHintEn: nullableStr(row, 'walking_hint_en'),
    headerImageUrl: nullableStr(row, 'header_image_url'),
    backgroundAudioUrl: nullableStr(row, 'background_audio_url'),
    ambientSound: nullableStr(row, 'ambient_sound'),
    estimatedDurationMinutes: num(row, 'estimated_duration_minutes', 0),
    createdAt: timestamp(row, 'created_at'),
    updatedAt: timestamp(row, 'updated_at'),
  }
}

function mapOptions(value: unknown): readonly MultipleChoiceOption[] | null {
  return Array.isArray(value) ? (value as MultipleChoiceOption[]) : null
}

export function mapPuzzleRow(row: DatabaseRow): Puzzle {
  const validationMode = str(row, 'answer_validation_mode')

  return {
    id: str(row, 'id'),
    stationId: str(row, 'station_id'),
    orderIndex: num(row, 'order_index', 0),
    puzzleType: str(row, 'puzzle_type') as PuzzleType,
    difficulty: str(row, 'difficulty') as Difficulty,
    questionDe: str(row, 'question_de'),
    questionEn: nullableStr(row, 'question_en'),
    instructionDe: nullableStr(row, 'instruction_de'),
    instructionEn: nullableStr(row, 'instruction_en'),
    answerType: str(row, 'answer_type') as AnswerType,
    correctAnswer: jsonObject(row, 'correct_answer') ?? {},
    answerValidationMode: (validationMode || 'exact') as AnswerValidationMode,
    caseSensitive: bool(row, 'case_sensitive', false),
    options: mapOptions(row['options']),
    arMarkerUrl: nullableStr(row, 'ar_marker_url'),
    arContent: (jsonObject(row, 'ar_content') as ArContent | null) ?? null,
    targetLocation: parseGeoPoint(row['target_location']),
    targetRadiusMeters: nullableNum(row, 'target_radius_meters'),
    imageUrl: nullableStr(row, 'image_url'),
    audioUrl: nullableStr(row, 'audio_url'),
    basePoints: num(row, 'base_points', 0),
    timeBonusEnabled: bool(row, 'time_bonus_enabled', false),
    timeBonusMaxSeconds: num(row, 'time_bonus_max_seconds', 0),
    createdAt: timestamp(row, 'created_at'),
    updatedAt: timestamp(row, 'updated_at'),
  }
}

/**
 * Map a puzzle for delivery to the browser, with the solution removed.
 *
 * The query in the session route already omits `correct_answer`; this is the
 * second line of defence, so a future `select('*')` cannot quietly turn into
 * a full solution dump.
 *
 * The answer's *length* is kept: CombinationPuzzle sizes its input boxes from
 * it, so codes of five or six characters still render correctly. The length
 * alone gives nothing away.
 */
export function mapPuzzleRowForClient(row: DatabaseRow): Puzzle {
  const puzzle = mapPuzzleRow(row)
  const value = puzzle.correctAnswer.value

  if (value === undefined || value === null) {
    return { ...puzzle, correctAnswer: {} }
  }

  return { ...puzzle, correctAnswer: { length: String(value).length } }
}

// ---------------------------------------------------------------------------
// Answer validation
// ---------------------------------------------------------------------------

const DEFAULT_FEEDBACK = {
  correct: {
    messageDe: 'Richtig! Weiter zur nächsten Station.',
    messageEn: 'Correct! On to the next station.',
  },
  incorrect: {
    messageDe: 'Leider falsch! Versucht es noch einmal.',
    messageEn: 'Not quite right! Try again.',
  },
} as const

/** The shape the `validate-answer` edge function returns today. */
interface EdgeValidationResponse {
  readonly correct?: boolean
  readonly points?: number
  readonly timeBonus?: number
  readonly feedback?: string
}

function isValidationResult(value: unknown): value is ValidationResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.isCorrect === 'boolean' &&
    typeof candidate.feedback === 'object' &&
    candidate.feedback !== null
  )
}

/**
 * Normalise the edge function's answer into the shared `ValidationResult`.
 *
 * An already-conforming payload is passed through untouched, so the edge
 * function can be migrated to the shared shape without breaking the route.
 */
export function mapValidationResult(raw: unknown): ValidationResult {
  if (isValidationResult(raw)) {
    return raw
  }

  const edge = (raw ?? {}) as EdgeValidationResponse
  const isCorrect = edge.correct === true
  const defaults = isCorrect ? DEFAULT_FEEDBACK.correct : DEFAULT_FEEDBACK.incorrect
  const message = typeof edge.feedback === 'string' && edge.feedback.trim() !== ''
    ? edge.feedback
    : null

  return {
    isCorrect,
    pointsEarned: typeof edge.points === 'number' && Number.isFinite(edge.points) ? edge.points : 0,
    timeBonusEarned:
      typeof edge.timeBonus === 'number' && Number.isFinite(edge.timeBonus) ? edge.timeBonus : 0,
    feedback: {
      messageDe: message ?? defaults.messageDe,
      messageEn: message ?? defaults.messageEn,
      type: isCorrect ? 'success' : 'error',
    },
  }
}
