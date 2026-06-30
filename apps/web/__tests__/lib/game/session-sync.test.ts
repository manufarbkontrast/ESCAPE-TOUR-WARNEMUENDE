import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncSessionProgress } from '@/lib/game/session-sync'

const SESSION_ID = '123e4567-e89b-42d3-a456-426614174000'

const okResponse = () =>
  new Response(JSON.stringify({ success: true, data: {}, error: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const errorResponse = (status: number) =>
  new Response(JSON.stringify({ success: false, data: null, error: 'fail' }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('syncSessionProgress', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends a PATCH to /api/game/session with sessionId and updates', async () => {
    fetchMock.mockResolvedValueOnce(okResponse())

    const result = await syncSessionProgress(SESSION_ID, {
      currentStationIndex: 3,
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/game/session')
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body)).toEqual({
      sessionId: SESSION_ID,
      currentStationIndex: 3,
    })
  })

  it('sends status updates for completion', async () => {
    fetchMock.mockResolvedValueOnce(okResponse())

    const result = await syncSessionProgress(SESSION_ID, {
      status: 'completed',
      currentStationIndex: 12,
    })

    expect(result.ok).toBe(true)
    const [, init] = fetchMock.mock.calls[0]
    expect(JSON.parse(init.body)).toEqual({
      sessionId: SESSION_ID,
      status: 'completed',
      currentStationIndex: 12,
    })
  })

  it('is a no-op for demo sessions (non-UUID ids)', async () => {
    const result = await syncSessionProgress('demo-session-001', {
      currentStationIndex: 1,
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('is a no-op for staff sessions (non-UUID ids)', async () => {
    const result = await syncSessionProgress('staff-abc123', {
      status: 'completed',
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('retries once after a network error and succeeds', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(okResponse())

    const result = await syncSessionProgress(
      SESSION_ID,
      { currentStationIndex: 2 },
      { retryDelayMs: 0 },
    )

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries once after a server error and succeeds', async () => {
    fetchMock
      .mockResolvedValueOnce(errorResponse(500))
      .mockResolvedValueOnce(okResponse())

    const result = await syncSessionProgress(
      SESSION_ID,
      { currentStationIndex: 2 },
      { retryDelayMs: 0 },
    )

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('fails after the retry is exhausted', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network down'))
      .mockRejectedValueOnce(new Error('still down'))

    const result = await syncSessionProgress(
      SESSION_ID,
      { currentStationIndex: 2 },
      { retryDelayMs: 0 },
    )

    expect(result.ok).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry on client errors (4xx)', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(401))

    const result = await syncSessionProgress(SESSION_ID, {
      currentStationIndex: 2,
    })

    expect(result.ok).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
