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
  const mockFrom = vi.fn(() => createDefaultBuilder())
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

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockClient),
}))

// Import after mocks are set up
import { GET, POST, PATCH } from '@/app/api/game/session/route'

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

    const request = new NextRequest('http://localhost/api/game/session?id=nonexistent')
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(404)
    expect(body).toMatchObject({ success: false, error: 'Session not found' })
  })

  it('should return session data on success', async () => {
    const sessionData = { id: 'sess-1', status: 'active', total_points: 100 }
    const sessionsBuilder = createMockQueryBuilder({
      data: sessionData,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(sessionsBuilder)

    const request = new NextRequest('http://localhost/api/game/session?id=sess-1')
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      data: { id: 'sess-1', status: 'active', total_points: 100 },
    })
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
    expect((body as any).data.team_name).toBe('My Team')
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
      id: 'sess-1',
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
        sessionId: 'sess-1',
        status: 'paused',
        totalPoints: 200,
      }),
    })
    const response = await PATCH(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect((body as any).data.status).toBe('paused')
  })

  it('should return 500 when update fails', async () => {
    const sessionsBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'update failed' },
    })
    mockClient.from.mockReturnValueOnce(sessionsBuilder)

    const request = new Request('http://localhost/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'sess-1', status: 'completed' }),
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
