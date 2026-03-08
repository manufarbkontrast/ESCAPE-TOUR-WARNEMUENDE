/**
 * Tests for GET and POST /api/game/certificate route
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
import { GET, POST } from '@/app/api/game/certificate/route'

// Valid UUID constants for tests
const SESS_1 = '00000000-0000-0000-0000-000000000001'
const SESS_NO_CERT = '00000000-0000-0000-0000-000000000002'
const SESS_NONEXISTENT = '00000000-0000-0000-0000-000000000003'
const SESS_ACTIVE = '00000000-0000-0000-0000-000000000004'
const SESS_NO_TIME = '00000000-0000-0000-0000-000000000005'
const SESS_NEW = '00000000-0000-0000-0000-000000000006'
const SESS_FAIL = '00000000-0000-0000-0000-000000000007'
const SESS_EMPTY = '00000000-0000-0000-0000-000000000008'
const SESS_FALLBACK = '00000000-0000-0000-0000-000000000009'

beforeEach(() => {
  vi.clearAllMocks()
})

// -----------------------------------------------------------------------
// GET /api/game/certificate
// -----------------------------------------------------------------------

describe('GET /api/game/certificate', () => {
  it('should return 400 when sessionId is missing', async () => {
    const request = new NextRequest('http://localhost/api/game/certificate')
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Missing sessionId parameter',
    })
  })

  it('should return demo certificate for demo session ID', async () => {
    const request = new NextRequest(
      'http://localhost/api/game/certificate?sessionId=demo-session-001',
    )
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.id).toBe('demo-cert-001')
    expect((body as any).data.verificationCode).toBe('DEMO-2026-GOLD')
  })

  it('should return certificate from Supabase on success', async () => {
    const certData = {
      id: 'cert-1',
      session_id: SESS_1,
      verification_code: 'VERIFY-123',
      data: { teamName: 'Team A', rank: 'gold' },
    }
    const certBuilder = createMockQueryBuilder({
      data: certData,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(certBuilder)

    const request = new NextRequest(
      `http://localhost/api/game/certificate?sessionId=${SESS_1}`,
    )
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.certificateId).toBe('cert-1')
    expect((body as any).data.verificationCode).toBe('VERIFY-123')
    expect((body as any).data.teamName).toBe('Team A')
  })

  it('should return 404 when certificate not found', async () => {
    const certBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(certBuilder)

    const request = new NextRequest(
      `http://localhost/api/game/certificate?sessionId=${SESS_NO_CERT}`,
    )
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      error: 'Certificate not found',
    })
  })

  it('should return 500 when certificate query fails', async () => {
    const certBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'db error' },
    })
    mockClient.from.mockReturnValueOnce(certBuilder)

    const request = new NextRequest(
      `http://localhost/api/game/certificate?sessionId=${SESS_1}`,
    )
    const response = await GET(request)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Failed to fetch certificate',
    })
  })
})

// -----------------------------------------------------------------------
// POST /api/game/certificate
// -----------------------------------------------------------------------

describe('POST /api/game/certificate', () => {
  it('should return 400 when session ID is missing', async () => {
    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Missing session ID',
    })
  })

  it('should return demo certificate for demo session ID', async () => {
    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'demo-session-001' }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(201)
    expect(body).toMatchObject({ success: true })
    expect((body as any).data.id).toBe('demo-cert-001')
  })

  it('should return 404 when session not found', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })
    mockClient.from.mockReturnValueOnce(sessionBuilder)

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_NONEXISTENT }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      error: 'Session not found',
    })
  })

  it('should return 500 when session query fails', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'database unreachable' },
    })
    mockClient.from.mockReturnValueOnce(sessionBuilder)

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_1 }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Failed to fetch session',
    })
  })

  it('should return 400 when session is not completed', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'active', completed_at: null },
      error: null,
    })
    mockClient.from.mockReturnValueOnce(sessionBuilder)

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_ACTIVE }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Session must be completed to generate certificate',
    })
  })

  it('should return 400 when session has no completed_at timestamp', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'completed', completed_at: null },
      error: null,
    })
    mockClient.from.mockReturnValueOnce(sessionBuilder)

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_NO_TIME }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      error: 'Session completion time is missing',
    })
  })

  it('should return existing certificate if already generated', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'completed', completed_at: '2026-01-01T12:00:00Z' },
      error: null,
    })
    const existingCert = {
      id: 'existing-cert',
      session_id: SESS_1,
      verification_code: 'EXISTING-CODE',
      data: { teamName: 'Winners', rank: 'silver' },
    }
    const certBuilder = createMockQueryBuilder({
      data: existingCert,
      error: null,
    })

    mockClient.from
      .mockReturnValueOnce(sessionBuilder)
      .mockReturnValueOnce(certBuilder)

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_1 }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(200)
    expect((body as any).data.certificateId).toBe('existing-cert')
    expect((body as any).data.verificationCode).toBe('EXISTING-CODE')
    expect((body as any).data.teamName).toBe('Winners')
  })

  it('should call edge function when no existing certificate', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'completed', completed_at: '2026-01-01T12:00:00Z' },
      error: null,
    })
    const noCertBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })

    mockClient.from
      .mockReturnValueOnce(sessionBuilder)
      .mockReturnValueOnce(noCertBuilder)

    const generatedCert = {
      certificateId: 'new-cert',
      verificationCode: 'NEW-CODE',
      teamName: 'Explorers',
      completedAt: '2026-01-01T12:00:00Z',
      duration: 3600,
      totalPoints: 500,
      rank: 'gold',
    }
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: generatedCert,
      error: null,
    })

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_NEW }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(201)
    expect(body).toMatchObject({
      success: true,
      data: generatedCert,
    })
    expect(mockClient.functions.invoke).toHaveBeenCalledWith(
      'generate-certificate',
      { body: { sessionId: SESS_NEW } },
    )
  })

  it('should return 500 when edge function returns error', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'completed', completed_at: '2026-01-01T12:00:00Z' },
      error: null,
    })
    const noCertBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })

    mockClient.from
      .mockReturnValueOnce(sessionBuilder)
      .mockReturnValueOnce(noCertBuilder)

    mockClient.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'PDF generation failed' },
    })

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_FAIL }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Certificate generation failed',
    })
  })

  it('should return 500 when edge function returns no data', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'completed', completed_at: '2026-01-01T12:00:00Z' },
      error: null,
    })
    const noCertBuilder = createMockQueryBuilder({
      data: null,
      error: null,
    })

    mockClient.from
      .mockReturnValueOnce(sessionBuilder)
      .mockReturnValueOnce(noCertBuilder)

    mockClient.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_EMPTY }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: 'Edge function returned no data',
    })
  })

  it('should fall through to edge function when cert query has error', async () => {
    const sessionBuilder = createMockQueryBuilder({
      data: { status: 'completed', completed_at: '2026-01-01T12:00:00Z' },
      error: null,
    })
    // Certificate query fails — route ignores errors and proceeds to generate
    const certErrorBuilder = createMockQueryBuilder({
      data: null,
      error: { message: 'query timeout' },
    })

    mockClient.from
      .mockReturnValueOnce(sessionBuilder)
      .mockReturnValueOnce(certErrorBuilder)

    const generatedCert = {
      certificateId: 'fallback-cert',
      verificationCode: 'FALLBACK',
      teamName: 'Fallback Team',
      completedAt: '2026-01-01T12:00:00Z',
      duration: 7200,
      totalPoints: 300,
      rank: 'bronze',
    }
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: generatedCert,
      error: null,
    })

    const request = new Request('http://localhost/api/game/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESS_FALLBACK }),
    })
    const response = await POST(request as any)
    const { status, body } = await parseResponse(response)

    expect(status).toBe(201)
    expect(body).toMatchObject({
      success: true,
      data: generatedCert,
    })
  })
})
