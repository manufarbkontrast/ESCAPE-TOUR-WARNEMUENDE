/**
 * Tests for GET /api/game/hints/[puzzleId] route
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

// Import after mocks are set up
import { GET } from '@/app/api/game/hints/[puzzleId]/route'

beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * Helper to create a route context with params as a Promise
 * (Next.js 15 dynamic routes use async params)
 */
function createRouteContext(puzzleId: string) {
  return {
    params: Promise.resolve({ puzzleId }),
  }
}

// -----------------------------------------------------------------------
// GET /api/game/hints/[puzzleId]
// -----------------------------------------------------------------------

describe('GET /api/game/hints/[puzzleId]', () => {
  it('should return demo hints for demo puzzle ID', async () => {
    const request = new NextRequest('http://localhost/api/game/hints/demo-puzzle-001')
    const context = createRouteContext('demo-puzzle-001')
    const response = await GET(request, context)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    const hints = (body as any).data
    expect(Array.isArray(hints)).toBe(true)
    expect(hints).toHaveLength(3)
    expect(hints[0].puzzle_id).toBe('demo-puzzle-001')
    expect(hints[0].hint_level).toBe(1)
    expect(hints[1].hint_level).toBe(2)
    expect(hints[2].hint_level).toBe(3)
  })

  it('should return empty array for unknown demo puzzle', async () => {
    const request = new NextRequest('http://localhost/api/game/hints/demo-puzzle-999')
    const context = createRouteContext('demo-puzzle-999')
    const response = await GET(request, context)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    // demo-puzzle-999 is not in DEMO_PUZZLES, so isDemoPuzzle returns false
    // It will fall through to the Supabase query path
  })

  it('should return hints from Supabase for non-demo puzzle', async () => {
    const hintsData = [
      { id: 'h1', puzzle_id: 'puzzle-1', hint_level: 1, text_de: 'Hinweis 1' },
      { id: 'h2', puzzle_id: 'puzzle-1', hint_level: 2, text_de: 'Hinweis 2' },
      { id: 'h3', puzzle_id: 'puzzle-1', hint_level: 3, text_de: 'Hinweis 3' },
    ]
    const hintsBuilder = createMockQueryBuilder({
      data: hintsData,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(hintsBuilder)

    const request = new NextRequest('http://localhost/api/game/hints/puzzle-1')
    const context = createRouteContext('puzzle-1')
    const response = await GET(request, context)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data).toEqual(hintsData)
  })

  it('should return empty array when no hints exist', async () => {
    const hintsBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(hintsBuilder)

    const request = new NextRequest('http://localhost/api/game/hints/puzzle-no-hints')
    const context = createRouteContext('puzzle-no-hints')
    const response = await GET(request, context)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data).toEqual([])
  })

  it('should return 500 when Supabase query fails', async () => {
    const hintsBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'connection refused' },
    })
    mockClient.from.mockReturnValueOnce(hintsBuilder)

    const request = new NextRequest('http://localhost/api/game/hints/puzzle-1')
    const context = createRouteContext('puzzle-1')
    const response = await GET(request, context)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Failed to fetch hints',
    })
  })

  it('should query Supabase with correct table and filters', async () => {
    const hintsBuilder = createMockQueryBuilder({
      data: [],
      error: null,
    })
    mockClient.from.mockReturnValueOnce(hintsBuilder)

    const request = new NextRequest('http://localhost/api/game/hints/puzzle-abc')
    const context = createRouteContext('puzzle-abc')
    await GET(request as any, context)

    expect(mockClient.from).toHaveBeenCalledWith('hints')
    expect(hintsBuilder.select).toHaveBeenCalledWith('*')
    expect(hintsBuilder.eq).toHaveBeenCalledWith('puzzle_id', 'puzzle-abc')
    expect(hintsBuilder.order).toHaveBeenCalledWith('hint_level', { ascending: true })
  })
})
