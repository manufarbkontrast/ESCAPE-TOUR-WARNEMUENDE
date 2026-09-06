/**
 * Tests for merging the locally persisted session with the server's copy.
 *
 * The play page called setSession(fetched) unconditionally, so a reload threw
 * the persisted progress away. For demo and staff sessions — the operational
 * iPad path — the server always answers with currentStationIndex 0, so a team
 * at station 8 was thrown back to the start with no points.
 */
import { describe, it, expect } from 'vitest'
import { mergeSession } from '@/lib/game/session-merge'
import type { GameSession } from '@escape-tour/shared'

function session(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: 'session-1',
    bookingId: 'booking-1',
    tourId: 'tour-1',
    status: 'active',
    teamName: 'Die Lotsen',
    startedAt: '2026-07-01T10:00:00.000Z',
    pausedAt: null,
    completedAt: null,
    totalPauseSeconds: 0,
    currentStationIndex: 0,
    totalPoints: 0,
    hintsUsed: 0,
    puzzlesSkipped: 0,
    deviceInfo: null,
    lastKnownLocation: null,
    lastActivityAt: null,
    offlineData: null,
    needsSync: false,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('mergeSession', () => {
  it('should take the server session when there is nothing local', () => {
    const fetched = session({ currentStationIndex: 3 })
    expect(mergeSession(null, fetched)).toEqual(fetched)
  })

  it('should take the server session when the local one is a different tour', () => {
    // Someone redeemed a second booking code on the same device.
    const local = session({ id: 'session-OLD', currentStationIndex: 9 })
    const fetched = session({ id: 'session-NEW', currentStationIndex: 0 })

    expect(mergeSession(local, fetched).currentStationIndex).toBe(0)
    expect(mergeSession(local, fetched).id).toBe('session-NEW')
  })

  it('should keep the further station after a reload', () => {
    // The actual bug: team at station 8, server says 0.
    const local = session({ currentStationIndex: 8, totalPoints: 640 })
    const fetched = session({ currentStationIndex: 0, totalPoints: 0 })

    const merged = mergeSession(local, fetched)

    expect(merged.currentStationIndex).toBe(8)
    expect(merged.totalPoints).toBe(640)
  })

  it('should accept server progress made on another device', () => {
    const local = session({ currentStationIndex: 2, totalPoints: 100 })
    const fetched = session({ currentStationIndex: 6, totalPoints: 480 })

    const merged = mergeSession(local, fetched)

    expect(merged.currentStationIndex).toBe(6)
    expect(merged.totalPoints).toBe(480)
  })

  it('should never lose used hints or skips', () => {
    // Counting these down would hand out free points.
    const local = session({ hintsUsed: 4, puzzlesSkipped: 2, totalPauseSeconds: 300 })
    const fetched = session({ hintsUsed: 1, puzzlesSkipped: 0, totalPauseSeconds: 0 })

    const merged = mergeSession(local, fetched)

    expect(merged.hintsUsed).toBe(4)
    expect(merged.puzzlesSkipped).toBe(2)
    expect(merged.totalPauseSeconds).toBe(300)
  })

  it('should keep the earlier start so the timer does not restart', () => {
    const local = session({ startedAt: '2026-07-01T10:00:00.000Z' })
    const fetched = session({ startedAt: '2026-07-01T12:00:00.000Z' })

    expect(mergeSession(local, fetched).startedAt).toBe('2026-07-01T10:00:00.000Z')
  })

  it('should adopt a start time when only one side has it', () => {
    expect(
      mergeSession(session({ startedAt: null }), session({ startedAt: '2026-07-01T10:00:00.000Z' }))
        .startedAt,
    ).toBe('2026-07-01T10:00:00.000Z')

    expect(
      mergeSession(session({ startedAt: '2026-07-01T10:00:00.000Z' }), session({ startedAt: null }))
        .startedAt,
    ).toBe('2026-07-01T10:00:00.000Z')
  })

  it('should let a completed tour win from either side', () => {
    const completed = session({ status: 'completed', completedAt: '2026-07-01T14:00:00.000Z' })

    expect(mergeSession(session({ status: 'active' }), completed).status).toBe('completed')
    expect(mergeSession(completed, session({ status: 'active' })).status).toBe('completed')
  })

  it('should keep a locally active session when the server still says pending', () => {
    // The activation PATCH may not have landed yet; falling back to pending
    // would switch the wake lock off again.
    const merged = mergeSession(session({ status: 'active' }), session({ status: 'pending' }))
    expect(merged.status).toBe('active')
  })

  it('should keep a pause across a reload', () => {
    const merged = mergeSession(session({ status: 'paused' }), session({ status: 'active' }))
    expect(merged.status).toBe('paused')
  })

  it('should preserve server-owned fields', () => {
    const local = session({ teamName: 'Alt' })
    const fetched = session({ teamName: 'Neu', tourId: 'tour-2', bookingId: 'booking-2' })

    const merged = mergeSession(local, fetched)

    expect(merged.teamName).toBe('Neu')
    expect(merged.tourId).toBe('tour-2')
    expect(merged.bookingId).toBe('booking-2')
  })

  it('should not mutate either input', () => {
    const local = session({ currentStationIndex: 5 })
    const fetched = session({ currentStationIndex: 1 })

    mergeSession(local, fetched)

    expect(local.currentStationIndex).toBe(5)
    expect(fetched.currentStationIndex).toBe(1)
  })
})
