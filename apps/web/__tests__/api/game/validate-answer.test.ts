/**
 * Tests for POST /api/game/validate-answer route
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
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

  const client = {
    from: vi.fn(() => createDefaultBuilder()),
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
import { POST } from '@/app/api/game/validate-answer/route'

beforeEach(() => {
  vi.clearAllMocks()
})

// -----------------------------------------------------------------------
// POST /api/game/validate-answer
// -----------------------------------------------------------------------

describe('POST /api/game/validate-answer', () => {
  it('should return 400 when sessionId is missing', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puzzleId: 'p1', answer: 'hello' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Missing required fields: sessionId, puzzleId, answer',
    })
  })

  it('should return 400 when puzzleId is missing', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', answer: 'hello' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Missing required fields: sessionId, puzzleId, answer',
    })
  })

  it('should return 400 when answer is missing', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 's1', puzzleId: 'p1' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Missing required fields: sessionId, puzzleId, answer',
    })
  })

  it('should return 400 when timeSeconds is negative', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 's1',
        puzzleId: 'p1',
        answer: 'hello',
        timeSeconds: -5,
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Invalid timeSeconds: must be a non-negative number',
    })
  })

  it('should return 400 when timeSpentSeconds is negative', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 's1',
        puzzleId: 'p1',
        answer: 'hello',
        timeSpentSeconds: -10,
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Invalid timeSeconds: must be a non-negative number',
    })
  })

  it('should validate demo answer for demo session', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'demo-session-001',
        puzzleId: 'demo-puzzle-003',
        answer: '1903',
        timeSeconds: 30,
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.isCorrect).toBe(true)
    expect((body as any).data.pointsEarned).toBe(100)
  })

  it('should return incorrect for wrong demo answer', async () => {
    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'demo-session-001',
        puzzleId: 'demo-puzzle-003',
        answer: 'WRONG',
        timeSeconds: 30,
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.isCorrect).toBe(false)
    expect((body as any).data.pointsEarned).toBe(0)
  })

  it('should call edge function for non-demo session', async () => {
    const edgeResult = {
      correct: true,
      points: 100,
      timeBonus: 25,
      feedback: 'Correct!',
    }
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: edgeResult,
      error: null,
    })

    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'real-session-1',
        puzzleId: 'real-puzzle-1',
        answer: '42',
        timeSeconds: 60,
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      data: edgeResult,
    })
    expect(mockClient.functions.invoke).toHaveBeenCalledWith(
      'validate-answer',
      {
        body: {
          sessionId: 'real-session-1',
          puzzleId: 'real-puzzle-1',
          answer: '42',
          timeSeconds: 60,
        },
      },
    )
  })

  it('should prefer timeSpentSeconds over timeSeconds', async () => {
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: { correct: true, points: 50, timeBonus: 0 },
      error: null,
    })

    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'real-session-1',
        puzzleId: 'real-puzzle-1',
        answer: '42',
        timeSpentSeconds: 90,
        timeSeconds: 45,
      }),
    })
    const response = await POST(request as any)
    await parseResponse(response)

    expect(mockClient.functions.invoke).toHaveBeenCalledWith(
      'validate-answer',
      expect.objectContaining({
        body: expect.objectContaining({
          timeSeconds: 90,
        }),
      }),
    )
  })

  it('should return 500 when edge function returns error', async () => {
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Edge function timeout' },
    })

    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'real-session-1',
        puzzleId: 'real-puzzle-1',
        answer: '42',
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Validation failed',
    })
  })

  it('should return 500 when edge function returns no data', async () => {
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'real-session-1',
        puzzleId: 'real-puzzle-1',
        answer: '42',
      }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Edge function returned no data',
    })
  })

  it('should default timeSeconds to 0 when not provided', async () => {
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: { correct: true, points: 50, timeBonus: 0 },
      error: null,
    })

    const request = new Request('http://localhost/api/game/validate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'real-session-1',
        puzzleId: 'real-puzzle-1',
        answer: '42',
      }),
    })
    const response = await POST(request as any)
    await parseResponse(response)

    expect(mockClient.functions.invoke).toHaveBeenCalledWith(
      'validate-answer',
      expect.objectContaining({
        body: expect.objectContaining({
          timeSeconds: 0,
        }),
      }),
    )
  })
})
