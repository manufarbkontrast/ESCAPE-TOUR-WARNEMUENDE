/**
 * Tests for /api/game/session route (GET, POST, PATCH)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createMockQueryBuilder } from '../../helpers/mock-supabase'
import { parseResponse } from '../../helpers/mock-request'

// Hoist the mock client so it is available inside vi.mock factories
const { mockClient, createDefaultBuilder } = vi.hoisted(() => {
  // Create default query builder factory (for when mockReturnValueOnce isn't set)
  const createDefaultBuilder = () => {
    const builder = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      then: vi.fn(),
    }
    const result = { data: null, error: null }
    builder.select.mockReturnValue(builder)
    builder.insert.mockReturnValue(builder)
    builder.update.mockReturnValue(builder)
    builder.delete.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.in.mockReturnValue(builder)
    builder.order.mockReturnValue(builder)
    builder.single.mockResolvedValue(result)
    builder.maybeSingle.mockResolvedValue(result)
    builder.then.mockImplementation((onfulfilled?: (value: typeof result) => unknown) =>
      Promise.resolve(result).then(onfulfilled),
    )
    return builder
  }

  // Inline mock client creation (cannot import from helpers in hoisted scope)
  // Takes the table name so tests can vary the builder per table.
  const mockFrom = vi.fn((table: string) => {
    void table
    return createDefaultBuilder()
  })
  const client = {
    from: mockFrom,
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  }
  return { mockClient: client, createDefaultBuilder }
})

// Mock next/headers (cookies)
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}))

// Mock the trusted server client. Guests never sign in, so the routes
// connect as the service role rather than as `anon`.
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockClient),
}))

// Mock verify-session to allow all requests by default
vi.mock('@/lib/utils/verify-session', () => ({
  verifyGameSession: vi.fn().mockReturnValue({ valid: true }),
}))

// Mock rate-limit to allow all requests by default
vi.mock('@/lib/utils/rate-limit', () => ({
  createRateLimiter: vi.fn().mockReturnValue({
    check: vi.fn().mockReturnValue({ allowed: true, retryAfterMs: 0 }),
    reset: vi.fn(),
  }),
}))

// Import after mocks are set up
import { GET, POST, PATCH } from '@/app/api/game/session/route'

// Valid UUID constants for tests
const TEST_SESSION_ID = '00000000-0000-0000-0000-000000000001'
const TEST_SESSION_ID_2 = '00000000-0000-0000-0000-000000000002'

// Supabase rows as PostgREST actually returns them: snake_case, PostGIS
// geography columns as EWKB hex.
const SESSION_ROW = {
  id: TEST_SESSION_ID,
  booking_id: 'booking-1',
  tour_id: 'tour-1',
  status: 'active',
  team_name: 'Die Lotsen',
  total_points: 100,
  current_station_index: 3,
  hints_used: 0,
  puzzles_skipped: 0,
  total_pause_seconds: 0,
  needs_sync: false,
  started_at: '2026-07-01T10:00:00.000Z',
  created_at: '2026-07-01T09:00:00.000Z',
  updated_at: '2026-07-01T10:00:00.000Z',
}

const STATION_ROW = {
  id: 'station-1',
  tour_id: 'tour-1',
  order_index: 0,
  name_de: 'Der Leuchtturm',
  name_en: 'The Lighthouse',
  location: '0101000020E61000005DFE43FAED2B284048BF7D1D38174B40',
  radius_meters: 50,
}

const PUZZLE_ROW = {
  id: 'puzzle-1',
  station_id: 'station-1',
  order_index: 0,
  puzzle_type: 'count',
  difficulty: 'easy',
  question_de: 'Wie viele Stufen?',
  answer_type: 'number',
  correct_answer: { value: 135 },
  answer_validation_mode: 'exact',
  base_points: 100,
  time_bonus_enabled: true,
  time_bonus_max_seconds: 300,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// -----------------------------------------------------------------------
// GET /api/game/session
// -----------------------------------------------------------------------

describe('GET /api/game/session', () => {
  it('should return 400 when session ID is missing', async () => {
    const request = new NextRequest('http://localhost/api/game/session')
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({ success: false, error: 'Missing session ID' })
  })

  it('should return demo session for demo session ID', async () => {
    const request = new NextRequest('http://localhost/api/game/session?id=demo-session-001')
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.session.id).toBe('demo-session-001')
  })

  it('should return 404 when session not found', async () => {
    const sessionsBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'not found', code: 'PGRST116' },
    })
    mockClient.from.mockReturnValueOnce(sessionsBuilder)

    const request = new NextRequest(`http://localhost/api/game/session?id=${TEST_SESSION_ID_2}`)
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(404)
    expect(body).toMatchObject({ success: false, error: 'Session not found' })
  })

  it('should return session, stations and puzzles for a real session', async () => {
    // The play page destructures { session, stations, puzzles } and reads
    // camelCase fields. Returning the raw Supabase row here is what made every
    // paid booking fail with "Netzwerkfehler".
    mockClient.from.mockImplementation((table: string) => {
      if (table === 'game_sessions') {
        return createMockQueryBuilder({ data: SESSION_ROW, error: null })
      }
      if (table === 'stations') {
        return createMockQueryBuilder({ data: [STATION_ROW], error: null })
      }
      if (table === 'puzzles') {
        return createMockQueryBuilder({ data: [PUZZLE_ROW], error: null })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const request = new NextRequest(`http://localhost/api/game/session?id=${TEST_SESSION_ID}`)
    const response = await GET(request)
    const { status, body } = await parseResponse(response)
    const data = (body as any).data

    expect(status).toBe(200)
    expect(data.session).toMatchObject({
      id: TEST_SESSION_ID,
      status: 'active',
      totalPoints: 100,
      currentStationIndex: 3,
      tourId: 'tour-1',
    })
    expect(data.stations).toHaveLength(1)
    expect(data.stations[0]).toMatchObject({ nameDe: 'Der Leuchtturm', orderIndex: 0 })
    expect(data.puzzles).toHaveLength(1)
    expect(data.puzzles[0]).toMatchObject({ questionDe: 'Wie viele Stufen?', basePoints: 100 })
  })

  it('should never ship puzzle solutions to the client', async () => {
    // correct_answer is the anti-cheat secret. Selecting '*' would hand every
    // solution to anyone who opens the network tab.
    const puzzlesBuilder = createMockQueryBuilder({ data: [PUZZLE_ROW], error: null })
    mockClient.from.mockImplementation((table: string) => {
      if (table === 'game_sessions') {
        return createMockQueryBuilder({ data: SESSION_ROW, error: null })
      }
      if (table === 'stations') {
        return createMockQueryBuilder({ data: [STATION_ROW], error: null })
      }
      if (table === 'puzzles') {
        return puzzlesBuilder
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const request = new NextRequest(`http://localhost/api/game/session?id=${TEST_SESSION_ID}`)
    const response = await GET(request)
    const { body } = await parseResponse(response)

    // The column must not even be requested from PostgREST.
    const selectArg = puzzlesBuilder.select.mock.calls[0]?.[0] as string
    expect(selectArg).toBeTypeOf('string')
    expect(selectArg).not.toContain('correct_answer')
    expect(selectArg).not.toBe('*')

    // Only the answer's length reaches the client — CombinationPuzzle needs
    // it to size its inputs, and it gives nothing away.
    expect((body as any).data.puzzles[0].correctAnswer).toEqual({ length: 3 })
    expect(JSON.stringify(body)).not.toContain('"value"')
  })

  it('should still answer with stations and puzzles when those queries return nothing', async () => {
    mockClient.from.mockImplementation((table: string) => {
      if (table === 'game_sessions') {
        return createMockQueryBuilder({ data: SESSION_ROW, error: null })
      }
      return createMockQueryBuilder({ data: null, error: { message: 'boom' } })
    })

    const request = new NextRequest(`http://localhost/api/game/session?id=${TEST_SESSION_ID}`)
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect((body as any).data.stations).toEqual([])
    expect((body as any).data.puzzles).toEqual([])
  })

  it('should accept a staff session id instead of rejecting it as malformed', async () => {
    // The format guard only allowed demo ids and UUIDs, so every staff-...
    // session died with 400 before reaching its own branch.
    const request = new NextRequest('http://localhost/api/game/session?id=staff-1738000000000-ab12cd34')
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect((body as any).data.session.id).toBe('staff-1738000000000-ab12cd34')
    expect((body as any).data.stations.length).toBeGreaterThan(0)
  })

  it('should date an offline session from the request, not from process start', async () => {
    // DEMO_SESSION.startedAt was a module-level constant. Under PM2 the
    // process runs for days, so the timer showed thousands of hours and
    // HintSystem unlocked every hint (including the solution) immediately.
    // Advancing the clock between two requests is what tells the two apart:
    // a module-level constant returns the same instant twice.
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-07-01T10:00:00.000Z'))
      const first = await GET(
        new NextRequest('http://localhost/api/game/session?id=demo-session-001'),
      )
      const firstBody = await parseResponse(first)

      vi.setSystemTime(new Date('2026-07-04T10:00:00.000Z'))
      const second = await GET(
        new NextRequest('http://localhost/api/game/session?id=demo-session-001'),
      )
      const secondBody = await parseResponse(second)

      expect((firstBody.body as any).data.session.startedAt).toBe('2026-07-01T10:00:00.000Z')
      expect((secondBody.body as any).data.session.startedAt).toBe('2026-07-04T10:00:00.000Z')
    } finally {
      vi.useRealTimers()
    }
  })

  it('should reject a malformed staff id', async () => {
    const request = new NextRequest('http://localhost/api/game/session?id=staff-')
    const response = await GET(request)
    const { status } = await parseResponse(response)

    expect(status).toBe(400)
  })
})

// -----------------------------------------------------------------------
// POST /api/game/session
// -----------------------------------------------------------------------

describe('POST /api/game/session', () => {
  it('should return 400 when booking code is missing', async () => {
    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({ success: false, error: 'Missing booking code' })
  })

  it('should return demo session for demo booking code', async () => {
    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'DEMO01' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(201)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.id).toBe('demo-session-001')
  })

  it('should return 400 for invalid booking code format', async () => {
    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'abc' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({ success: false, error: 'Invalid booking code format' })
  })

  it('should return 404 when booking not found', async () => {
    const bookingsBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(bookingsBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'XYZ789' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      error: 'Invalid or expired booking code',
    })
  })

  it('should return 500 when booking query fails', async () => {
    const bookingsBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'database error' },
    })
    mockClient.from.mockReturnValueOnce(bookingsBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'ABC123' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Failed to verify booking code',
    })
  })

  it('should return 400 when booking is not yet valid', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString()
    const bookingsBuilder = createMockQueryBuilder({
      data: {
        id: 'booking-1',
        tour_id: 'tour-1',
        valid_from: futureDate,
        valid_until: null,
        team_name: null,
      },
      error: null,
    })
    mockClient.from.mockReturnValueOnce(bookingsBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'ABC123' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Booking is not yet valid',
    })
  })

  it('should return 400 when booking has expired', async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString()
    const bookingsBuilder = createMockQueryBuilder({
      data: {
        id: 'booking-1',
        tour_id: 'tour-1',
        valid_from: null,
        valid_until: pastDate,
        team_name: null,
      },
      error: null,
    })
    mockClient.from.mockReturnValueOnce(bookingsBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'ABC123' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Booking has expired',
    })
  })

  it('should return existing session if one is already active', async () => {
    const bookingsBuilder = createMockQueryBuilder({
      data: {
        id: 'booking-1',
        tour_id: 'tour-1',
        valid_from: null,
        valid_until: null,
        team_name: 'Team A',
      },
      error: null,
    })
    const existingSessionBuilder = createMockQueryBuilder({
      data: { id: 'existing-session', status: 'active' },
      error: null,
    })

    mockClient.from
      .mockReturnValueOnce(bookingsBuilder)
      .mockReturnValueOnce(existingSessionBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'ABC123' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect((body as any).data.id).toBe('existing-session')
    // /play liest result.data.sessionId — ohne dieses Feld landet der Gast
    // auf /play/undefined.
    expect((body as any).data.sessionId).toBe('existing-session')
  })

  it('should create new session when no existing session', async () => {
    const bookingsBuilder = createMockQueryBuilder({
      data: {
        id: 'booking-1',
        tour_id: 'tour-1',
        valid_from: null,
        valid_until: null,
        team_name: 'Team A',
      },
      error: null,
    })
    const noExistingBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })
    const newSessionData = {
      id: 'new-session',
      booking_id: 'booking-1',
      tour_id: 'tour-1',
      status: 'pending',
      team_name: 'My Team',
    }
    const insertBuilder = createMockQueryBuilder({
      data: newSessionData,
      error: null,
    })

    mockClient.from
      .mockReturnValueOnce(bookingsBuilder)
      .mockReturnValueOnce(noExistingBuilder)
      .mockReturnValueOnce(insertBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'ABC123', teamName: 'My Team' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(201)
    expect((body as any).data.id).toBe('new-session')
    expect((body as any).data.sessionId).toBe('new-session')
    expect((body as any).data.status).toBe('pending')
  })

  it('should return 500 when session creation fails', async () => {
    const bookingsBuilder = createMockQueryBuilder({
      data: {
        id: 'booking-1',
        tour_id: 'tour-1',
        valid_from: null,
        valid_until: null,
        team_name: null,
      },
      error: null,
    })
    const noExistingBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })
    const failedInsertBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'insert failed' },
    })

    mockClient.from
      .mockReturnValueOnce(bookingsBuilder)
      .mockReturnValueOnce(noExistingBuilder)
      .mockReturnValueOnce(failedInsertBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'ABC123' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Failed to create session',
    })
  })
})

// -----------------------------------------------------------------------
// PATCH /api/game/session
// -----------------------------------------------------------------------

describe('PATCH /api/game/session', () => {
  it('should return 400 when session ID is missing', async () => {
    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await PATCH(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({ success: false, error: 'Missing session ID' })
  })

  it('should return demo session for demo session ID', async () => {
    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'demo-session-001', status: 'paused' }),
    })
    const response = await PATCH(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
  })

  it('should update session successfully', async () => {
    const updatedSession = {
      id: TEST_SESSION_ID,
      status: 'paused',
      total_points: 200,
    }
    const sessionsBuilder = createMockQueryBuilder({
      data: updatedSession,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(sessionsBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: TEST_SESSION_ID,
        status: 'paused',
      }),
    })
    const response = await PATCH(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect((body as any).data.status).toBe('paused')
  })

  it.each([
    ['unbekannter Status', { status: 'voellig-egal' }],
    ['Status als Zahl', { status: 7 }],
    ['Stationsindex als Text', { currentStationIndex: 'abc' }],
    ['negativer Stationsindex', { currentStationIndex: -1 }],
    ['gebrochener Stationsindex', { currentStationIndex: 2.5 }],
    ['absurd hoher Stationsindex', { currentStationIndex: 9999 }],
  ])('should reject %s with 400 instead of a database error', async (_label, payload) => {
    // Unvalidated values went straight into the UPDATE. A bad enum or a
    // string where a number belongs produced a Postgres error and a 500,
    // which session-sync treats as retryable — so it sent it twice.
    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: TEST_SESSION_ID, ...payload }),
    })
    const response = await PATCH(request as any)
    const { status } = await parseResponse(response)

    expect(status).toBe(400)
  })

  it('should refuse to complete a tour that has not been played', async () => {
    // Straight after starting: PATCH { status: 'completed' } followed by
    // POST /api/game/certificate handed out a certificate for zero solved
    // puzzles.
    mockClient.from.mockImplementation((table: string) => {
      if (table === 'game_sessions') {
        return createMockQueryBuilder({
          data: { ...SESSION_ROW, current_station_index: 0 },
          error: null,
        })
      }
      if (table === 'stations') {
        return createMockQueryBuilder({
          data: [STATION_ROW, { ...STATION_ROW, id: 'station-2', order_index: 1 }],
          error: null,
        })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: TEST_SESSION_ID, status: 'completed' }),
    })
    const response = await PATCH(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect((body as any).error).toMatch(/Station/i)
  })

  it('should allow completing once the last station is reached', async () => {
    mockClient.from.mockImplementation((table: string) => {
      if (table === 'game_sessions') {
        return createMockQueryBuilder({
          data: { ...SESSION_ROW, current_station_index: 1, status: 'completed' },
          error: null,
        })
      }
      if (table === 'stations') {
        return createMockQueryBuilder({
          data: [STATION_ROW, { ...STATION_ROW, id: 'station-2', order_index: 1 }],
          error: null,
        })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: TEST_SESSION_ID, status: 'completed' }),
    })
    const response = await PATCH(request as any)
    const { status } = await parseResponse(response)

    expect(status).toBe(200)
  })

  it('should accept a valid status change', async () => {
    mockClient.from.mockImplementation(() =>
      createMockQueryBuilder({ data: { ...SESSION_ROW, status: 'active' }, error: null }),
    )

    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: TEST_SESSION_ID, status: 'active' }),
    })
    const response = await PATCH(request as any)
    const { status } = await parseResponse(response)

    expect(status).toBe(200)
  })

  it('should return 500 when update fails', async () => {
    const sessionsBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'update failed' },
    })
    mockClient.from.mockReturnValueOnce(sessionsBuilder)

    // 'active' rather than 'completed': the latter now runs the
    // last-station check first, which would answer 400 before the UPDATE.
    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: TEST_SESSION_ID, status: 'active' }),
    })
    const response = await PATCH(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Failed to update session',
    })
  })
})
