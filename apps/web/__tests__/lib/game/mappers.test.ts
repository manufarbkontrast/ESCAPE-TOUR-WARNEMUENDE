/**
 * Tests for the Supabase row -> domain type mappers.
 *
 * The API routes used to hand raw snake_case Supabase rows to the client,
 * which expects the camelCase shared types. These mappers are the seam that
 * fixes that, so they carry the whole contract.
 */
import { describe, it, expect } from 'vitest'
import {
  parseGeoPoint,
  mapSessionRow,
  mapStationRow,
  mapPuzzleRow,
  mapPuzzleRowForClient,
  mapValidationResult,
} from '@/lib/game/mappers'

// PostGIS point for Warnemünde lighthouse: lng 12.0858, lat 54.1814
const EWKB_WITH_SRID = '0101000020E61000005DFE43FAED2B284048BF7D1D38174B40'
const WKB_LITTLE_ENDIAN = '01010000005DFE43FAED2B284048BF7D1D38174B40'
const WKB_BIG_ENDIAN = '000000000140282BEDFA43FE5D404B17381D7DBF48'

const LIGHTHOUSE = { lat: 54.1814, lng: 12.0858 }

function expectPoint(actual: unknown, expected: { lat: number; lng: number }) {
  expect(actual).not.toBeNull()
  const point = actual as { lat: number; lng: number }
  expect(point.lat).toBeCloseTo(expected.lat, 6)
  expect(point.lng).toBeCloseTo(expected.lng, 6)
}

// -----------------------------------------------------------------------
// parseGeoPoint
// -----------------------------------------------------------------------

describe('parseGeoPoint', () => {
  it('should parse GeoJSON objects', () => {
    expectPoint(
      parseGeoPoint({ type: 'Point', coordinates: [12.0858, 54.1814] }),
      LIGHTHOUSE,
    )
  })

  it('should parse GeoJSON encoded as a string', () => {
    expectPoint(
      parseGeoPoint('{"type":"Point","coordinates":[12.0858,54.1814]}'),
      LIGHTHOUSE,
    )
  })

  it('should parse a plain lat/lng object', () => {
    expectPoint(parseGeoPoint({ lat: 54.1814, lng: 12.0858 }), LIGHTHOUSE)
  })

  it('should parse EWKB hex with an SRID prefix', () => {
    expectPoint(parseGeoPoint(EWKB_WITH_SRID), LIGHTHOUSE)
  })

  it('should parse little-endian WKB hex without an SRID', () => {
    expectPoint(parseGeoPoint(WKB_LITTLE_ENDIAN), LIGHTHOUSE)
  })

  it('should parse big-endian WKB hex', () => {
    expectPoint(parseGeoPoint(WKB_BIG_ENDIAN), LIGHTHOUSE)
  })

  it('should parse WKT point notation', () => {
    expectPoint(parseGeoPoint('POINT(12.0858 54.1814)'), LIGHTHOUSE)
  })

  it('should return null for values it cannot understand', () => {
    expect(parseGeoPoint(null)).toBeNull()
    expect(parseGeoPoint(undefined)).toBeNull()
    expect(parseGeoPoint('')).toBeNull()
    expect(parseGeoPoint('not a point')).toBeNull()
    expect(parseGeoPoint(42)).toBeNull()
    expect(parseGeoPoint({ type: 'Polygon', coordinates: [] })).toBeNull()
  })

  it('should return null rather than throw on malformed hex', () => {
    expect(parseGeoPoint('0101000020E610')).toBeNull()
    expect(parseGeoPoint('ZZZZ')).toBeNull()
  })
})

// -----------------------------------------------------------------------
// mapSessionRow
// -----------------------------------------------------------------------

describe('mapSessionRow', () => {
  const row = {
    id: '00000000-0000-0000-0000-000000000001',
    booking_id: 'booking-1',
    tour_id: 'tour-1',
    status: 'active',
    team_name: 'Die Lotsen',
    started_at: '2026-07-01T10:00:00.000Z',
    paused_at: null,
    completed_at: null,
    total_pause_seconds: 42,
    current_station_index: 7,
    total_points: 350,
    hints_used: 2,
    puzzles_skipped: 1,
    device_info: { platform: 'ipad' },
    last_activity_at: '2026-07-01T11:00:00.000Z',
    offline_data: null,
    needs_sync: false,
    created_at: '2026-07-01T09:00:00.000Z',
    updated_at: '2026-07-01T11:00:00.000Z',
  }

  it('should convert every field to the camelCase domain shape', () => {
    const session = mapSessionRow(row)

    expect(session).toMatchObject({
      id: '00000000-0000-0000-0000-000000000001',
      bookingId: 'booking-1',
      tourId: 'tour-1',
      status: 'active',
      teamName: 'Die Lotsen',
      startedAt: '2026-07-01T10:00:00.000Z',
      totalPauseSeconds: 42,
      currentStationIndex: 7,
      totalPoints: 350,
      hintsUsed: 2,
      puzzlesSkipped: 1,
      needsSync: false,
    })
  })

  it('should default nullable counters to 0 so the UI never renders null', () => {
    const session = mapSessionRow({
      id: 'a',
      booking_id: 'b',
      tour_id: 't',
      status: 'pending',
    })

    expect(session.currentStationIndex).toBe(0)
    expect(session.totalPoints).toBe(0)
    expect(session.hintsUsed).toBe(0)
    expect(session.puzzlesSkipped).toBe(0)
    expect(session.totalPauseSeconds).toBe(0)
    expect(session.needsSync).toBe(false)
  })

  it('should fall back to "pending" when status is null', () => {
    const session = mapSessionRow({ id: 'a', booking_id: 'b', tour_id: 't', status: null })
    expect(session.status).toBe('pending')
  })
})

// -----------------------------------------------------------------------
// mapStationRow
// -----------------------------------------------------------------------

describe('mapStationRow', () => {
  const row = {
    id: 'station-1',
    tour_id: 'tour-1',
    order_index: 0,
    name_de: 'Der Leuchtturm',
    name_en: 'The Lighthouse',
    subtitle_de: 'Wo alles beginnt',
    subtitle_en: null,
    location: EWKB_WITH_SRID,
    location_name: 'Leuchtturm Warnemünde',
    radius_meters: 50,
    intro_text_de: 'Willkommen',
    intro_text_en: null,
    story_text_de: 'Story',
    story_text_en: null,
    completion_text_de: 'Geschafft',
    completion_text_en: null,
    transition_text_de: 'Weiter zum Teepott',
    transition_text_en: null,
    walking_hint_de: 'Nach links',
    walking_hint_en: null,
    header_image_url: '/images/stations/01_leuchtturm.webp',
    background_audio_url: null,
    ambient_sound: 'waves',
    estimated_duration_minutes: 10,
    created_at: '2026-07-01T09:00:00.000Z',
    updated_at: '2026-07-01T09:00:00.000Z',
  }

  it('should convert to the camelCase domain shape', () => {
    const station = mapStationRow(row)

    expect(station).toMatchObject({
      id: 'station-1',
      tourId: 'tour-1',
      orderIndex: 0,
      nameDe: 'Der Leuchtturm',
      nameEn: 'The Lighthouse',
      locationName: 'Leuchtturm Warnemünde',
      radiusMeters: 50,
      transitionTextDe: 'Weiter zum Teepott',
      walkingHintDe: 'Nach links',
      headerImageUrl: '/images/stations/01_leuchtturm.webp',
      ambientSound: 'waves',
      estimatedDurationMinutes: 10,
    })
    expectPoint(station.location, LIGHTHOUSE)
  })

  it('should tolerate rows without transition and walking-hint columns', () => {
    // These columns are absent from docs/DATABASE_SCHEMA.md and from the
    // generated Supabase types, so the deployed table may not have them yet.
    const { transition_text_de, transition_text_en, walking_hint_de, walking_hint_en, ...bare } =
      row
    void transition_text_de
    void transition_text_en
    void walking_hint_de
    void walking_hint_en

    const station = mapStationRow(bare)

    expect(station.transitionTextDe).toBeNull()
    expect(station.transitionTextEn).toBeNull()
    expect(station.walkingHintDe).toBeNull()
    expect(station.walkingHintEn).toBeNull()
    expect(station.nameDe).toBe('Der Leuchtturm')
  })

  it('should default the unlock radius when the column is null', () => {
    const station = mapStationRow({ ...row, radius_meters: null })
    expect(station.radiusMeters).toBe(50)
  })

  it('should yield lat/lng 0 rather than crash when location is unparseable', () => {
    const station = mapStationRow({ ...row, location: 'nonsense' })
    expect(station.location).toEqual({ lat: 0, lng: 0 })
  })
})

// -----------------------------------------------------------------------
// mapPuzzleRow
// -----------------------------------------------------------------------

describe('mapPuzzleRow', () => {
  const row = {
    id: 'puzzle-1',
    station_id: 'station-1',
    order_index: 0,
    puzzle_type: 'count',
    difficulty: 'easy',
    question_de: 'Wie viele Stufen?',
    question_en: 'How many steps?',
    instruction_de: 'Zählt nach',
    instruction_en: null,
    answer_type: 'number',
    correct_answer: { value: 135 },
    answer_validation_mode: 'exact',
    case_sensitive: false,
    options: null,
    ar_marker_url: null,
    ar_content: null,
    target_location: EWKB_WITH_SRID,
    target_radius_meters: 20,
    image_url: null,
    audio_url: null,
    base_points: 100,
    time_bonus_enabled: true,
    time_bonus_max_seconds: 300,
    created_at: '2026-07-01T09:00:00.000Z',
    updated_at: '2026-07-01T09:00:00.000Z',
  }

  it('should convert to the camelCase domain shape', () => {
    const puzzle = mapPuzzleRow(row)

    expect(puzzle).toMatchObject({
      id: 'puzzle-1',
      stationId: 'station-1',
      orderIndex: 0,
      puzzleType: 'count',
      difficulty: 'easy',
      questionDe: 'Wie viele Stufen?',
      answerType: 'number',
      correctAnswer: { value: 135 },
      answerValidationMode: 'exact',
      caseSensitive: false,
      targetRadiusMeters: 20,
      basePoints: 100,
      timeBonusEnabled: true,
      timeBonusMaxSeconds: 300,
    })
    expectPoint(puzzle.targetLocation, LIGHTHOUSE)
  })

  it('should leave targetLocation null for non-navigation puzzles', () => {
    const puzzle = mapPuzzleRow({ ...row, target_location: null, target_radius_meters: null })
    expect(puzzle.targetLocation).toBeNull()
    expect(puzzle.targetRadiusMeters).toBeNull()
  })

  it('should default validation mode and points when columns are null', () => {
    const puzzle = mapPuzzleRow({
      ...row,
      answer_validation_mode: null,
      case_sensitive: null,
      base_points: null,
      time_bonus_enabled: null,
      order_index: null,
    })

    expect(puzzle.answerValidationMode).toBe('exact')
    expect(puzzle.caseSensitive).toBe(false)
    expect(puzzle.basePoints).toBe(0)
    expect(puzzle.timeBonusEnabled).toBe(false)
    expect(puzzle.orderIndex).toBe(0)
  })

  it('should replace the solution with its length in the client variant', () => {
    expect(mapPuzzleRow(row).correctAnswer).toEqual({ value: 135 })
    // CombinationPuzzle sizes its input boxes from the answer length, so the
    // length has to survive — the value must not.
    expect(mapPuzzleRowForClient(row).correctAnswer).toEqual({ length: 3 })
    expect(JSON.stringify(mapPuzzleRowForClient(row))).not.toContain('135')
    // Everything the client actually renders must survive the stripping.
    expect(mapPuzzleRowForClient(row).questionDe).toBe('Wie viele Stufen?')
    expect(mapPuzzleRowForClient(row).basePoints).toBe(100)
  })

  it('should report the length of a longer code without revealing it', () => {
    const client = mapPuzzleRowForClient({ ...row, correct_answer: { value: '31542' } })
    expect(client.correctAnswer).toEqual({ length: 5 })
    expect(JSON.stringify(client)).not.toContain('31542')
  })

  it('should yield an empty answer object when the column was not selected', () => {
    const bare = { ...row }
    delete (bare as Record<string, unknown>).correct_answer
    expect(mapPuzzleRowForClient(bare).correctAnswer).toEqual({})
  })

  it('should pass multiple-choice options through', () => {
    const options = [{ id: 'a', textDe: 'Eins', textEn: 'One' }]
    const puzzle = mapPuzzleRow({ ...row, options })
    expect(puzzle.options).toEqual(options)
  })
})

// -----------------------------------------------------------------------
// mapValidationResult
// -----------------------------------------------------------------------

describe('mapValidationResult', () => {
  it('should map a correct edge-function answer to ValidationResult', () => {
    const result = mapValidationResult({ correct: true, points: 100, timeBonus: 25 })

    expect(result.isCorrect).toBe(true)
    expect(result.pointsEarned).toBe(100)
    expect(result.timeBonusEarned).toBe(25)
    expect(result.feedback.type).toBe('success')
    expect(result.feedback.messageDe).toBeTruthy()
    expect(result.feedback.messageEn).toBeTruthy()
  })

  it('should map an incorrect answer and mark the feedback as an error', () => {
    const result = mapValidationResult({ correct: false, points: 0, timeBonus: 0 })

    expect(result.isCorrect).toBe(false)
    expect(result.pointsEarned).toBe(0)
    expect(result.timeBonusEarned).toBe(0)
    expect(result.feedback.type).toBe('error')
    expect(result.feedback.messageDe).toBeTruthy()
  })

  it('should use the edge function feedback string for both languages when given', () => {
    const result = mapValidationResult({
      correct: false,
      points: 0,
      timeBonus: 0,
      feedback: 'Fast! Achtet auf die Reihenfolge.',
    })

    expect(result.feedback.messageDe).toBe('Fast! Achtet auf die Reihenfolge.')
    expect(result.feedback.messageEn).toBe('Fast! Achtet auf die Reihenfolge.')
  })

  it('should accept an already-mapped ValidationResult unchanged', () => {
    // The edge function may be updated to return the shared shape directly;
    // the route must not corrupt it if that happens.
    const already = {
      isCorrect: true,
      pointsEarned: 80,
      timeBonusEarned: 10,
      feedback: { messageDe: 'Richtig!', messageEn: 'Correct!', type: 'success' as const },
    }

    expect(mapValidationResult(already)).toEqual(already)
  })

  it('should coerce missing numbers to 0 instead of yielding NaN', () => {
    const result = mapValidationResult({ correct: true })

    expect(result.pointsEarned).toBe(0)
    expect(result.timeBonusEarned).toBe(0)
  })
})
