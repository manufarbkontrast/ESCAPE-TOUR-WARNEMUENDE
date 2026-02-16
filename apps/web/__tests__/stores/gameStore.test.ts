/**
 * Tests for gameStore — main game state management with localStorage persistence
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '@/stores/gameStore'
import type { GameSession, StationProgress } from '@escape-tour/shared'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = '2026-02-16T12:00:00.000Z'

function createMockSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: 'session-1',
    bookingId: 'booking-1',
    tourId: 'tour-1',
    status: 'pending',
    teamName: 'Team Test',
    startedAt: null,
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
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

function createMockStationProgress(
  overrides: Partial<StationProgress> = {},
): StationProgress {
  return {
    id: 'progress-1',
    sessionId: 'session-1',
    stationId: 'station-1',
    unlockedAt: NOW,
    startedAt: NOW,
    completedAt: NOW,
    pointsEarned: 100,
    timeBonusEarned: 25,
    unlockLocation: { lat: 54.18, lng: 12.08 },
    unlockAccuracyMeters: 10,
    createdAt: NOW,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.getState().clearSession()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(NOW))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('initial state', () => {
    it('should have null session', () => {
      const state = useGameStore.getState()
      expect(state.session).toBeNull()
    })

    it('should have empty station progress', () => {
      const state = useGameStore.getState()
      expect(state.stationProgress).toEqual([])
    })

    it('should not be initialized', () => {
      const state = useGameStore.getState()
      expect(state.isInitialized).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // startSession
  // -----------------------------------------------------------------------

  describe('startSession', () => {
    it('should set the session with active status', () => {
      const session = createMockSession()
      useGameStore.getState().startSession(session)

      const state = useGameStore.getState()
      expect(state.session).not.toBeNull()
      expect(state.session!.status).toBe('active')
    })

    it('should set startedAt and lastActivityAt timestamps', () => {
      const session = createMockSession()
      useGameStore.getState().startSession(session)

      const state = useGameStore.getState()
      expect(state.session!.startedAt).toBe(NOW)
      expect(state.session!.lastActivityAt).toBe(NOW)
    })

    it('should reset station progress', () => {
      // First add some progress
      const session = createMockSession()
      useGameStore.getState().startSession(session)
      useGameStore.getState().completeStation(createMockStationProgress())

      // Now start a new session
      const newSession = createMockSession({ id: 'session-2' })
      useGameStore.getState().startSession(newSession)

      const state = useGameStore.getState()
      expect(state.stationProgress).toEqual([])
    })

    it('should mark store as initialized', () => {
      const session = createMockSession()
      useGameStore.getState().startSession(session)

      expect(useGameStore.getState().isInitialized).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // updateProgress
  // -----------------------------------------------------------------------

  describe('updateProgress', () => {
    it('should update session fields', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().updateProgress({
        currentStationIndex: 2,
        totalPoints: 300,
      })

      const state = useGameStore.getState()
      expect(state.session!.currentStationIndex).toBe(2)
      expect(state.session!.totalPoints).toBe(300)
    })

    it('should update lastActivityAt and updatedAt', () => {
      useGameStore.getState().startSession(createMockSession())
      vi.setSystemTime(new Date('2026-02-16T13:00:00.000Z'))
      useGameStore.getState().updateProgress({ totalPoints: 50 })

      const state = useGameStore.getState()
      expect(state.session!.lastActivityAt).toBe('2026-02-16T13:00:00.000Z')
      expect(state.session!.updatedAt).toBe('2026-02-16T13:00:00.000Z')
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().updateProgress({ totalPoints: 50 })
      expect(useGameStore.getState().session).toBeNull()
    })

    it('should update lastKnownLocation', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().updateProgress({
        lastKnownLocation: { lat: 54.18, lng: 12.08 },
      })

      expect(useGameStore.getState().session!.lastKnownLocation).toEqual({
        lat: 54.18,
        lng: 12.08,
      })
    })
  })

  // -----------------------------------------------------------------------
  // pauseSession / resumeSession
  // -----------------------------------------------------------------------

  describe('pauseSession', () => {
    it('should set status to paused', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().pauseSession()

      expect(useGameStore.getState().session!.status).toBe('paused')
    })

    it('should set pausedAt timestamp', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().pauseSession()

      expect(useGameStore.getState().session!.pausedAt).toBe(NOW)
    })

    it('should not pause if session is not active', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().pauseSession()
      // Already paused, try to pause again
      vi.setSystemTime(new Date('2026-02-16T13:00:00.000Z'))
      useGameStore.getState().pauseSession()

      // pausedAt should not have changed
      expect(useGameStore.getState().session!.pausedAt).toBe(NOW)
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().pauseSession()
      expect(useGameStore.getState().session).toBeNull()
    })
  })

  describe('resumeSession', () => {
    it('should set status back to active', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().pauseSession()
      useGameStore.getState().resumeSession()

      expect(useGameStore.getState().session!.status).toBe('active')
    })

    it('should clear pausedAt', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().pauseSession()
      useGameStore.getState().resumeSession()

      expect(useGameStore.getState().session!.pausedAt).toBeNull()
    })

    it('should accumulate totalPauseSeconds', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().pauseSession()

      // Advance time by 120 seconds
      vi.setSystemTime(new Date('2026-02-16T12:02:00.000Z'))
      useGameStore.getState().resumeSession()

      expect(useGameStore.getState().session!.totalPauseSeconds).toBe(120)
    })

    it('should not resume if session is not paused', () => {
      useGameStore.getState().startSession(createMockSession())
      // Session is active, not paused
      useGameStore.getState().resumeSession()

      expect(useGameStore.getState().session!.status).toBe('active')
      expect(useGameStore.getState().session!.totalPauseSeconds).toBe(0)
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().resumeSession()
      expect(useGameStore.getState().session).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // completeStation
  // -----------------------------------------------------------------------

  describe('completeStation', () => {
    it('should add station progress', () => {
      useGameStore.getState().startSession(createMockSession())
      const progress = createMockStationProgress()
      useGameStore.getState().completeStation(progress)

      expect(useGameStore.getState().stationProgress).toHaveLength(1)
      expect(useGameStore.getState().stationProgress[0]).toEqual(progress)
    })

    it('should add points to session total', () => {
      useGameStore.getState().startSession(createMockSession())
      const progress = createMockStationProgress({
        pointsEarned: 100,
        timeBonusEarned: 25,
      })
      useGameStore.getState().completeStation(progress)

      expect(useGameStore.getState().session!.totalPoints).toBe(125)
    })

    it('should replace existing progress for same station', () => {
      useGameStore.getState().startSession(createMockSession())
      const progress1 = createMockStationProgress({
        pointsEarned: 50,
        timeBonusEarned: 10,
      })
      const progress2 = createMockStationProgress({
        pointsEarned: 100,
        timeBonusEarned: 25,
      })

      useGameStore.getState().completeStation(progress1)
      useGameStore.getState().completeStation(progress2)

      expect(useGameStore.getState().stationProgress).toHaveLength(1)
      expect(useGameStore.getState().stationProgress[0].pointsEarned).toBe(100)
    })

    it('should append progress for different stations', () => {
      useGameStore.getState().startSession(createMockSession())
      const progress1 = createMockStationProgress({ stationId: 'station-1' })
      const progress2 = createMockStationProgress({
        id: 'progress-2',
        stationId: 'station-2',
        pointsEarned: 150,
        timeBonusEarned: 30,
      })

      useGameStore.getState().completeStation(progress1)
      useGameStore.getState().completeStation(progress2)

      expect(useGameStore.getState().stationProgress).toHaveLength(2)
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().completeStation(createMockStationProgress())
      expect(useGameStore.getState().stationProgress).toEqual([])
    })
  })

  // -----------------------------------------------------------------------
  // useHint / skipPuzzle
  // -----------------------------------------------------------------------

  describe('useHint', () => {
    it('should increment hintsUsed', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().useHint()
      useGameStore.getState().useHint()

      expect(useGameStore.getState().session!.hintsUsed).toBe(2)
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().useHint()
      expect(useGameStore.getState().session).toBeNull()
    })
  })

  describe('skipPuzzle', () => {
    it('should increment puzzlesSkipped', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().skipPuzzle()

      expect(useGameStore.getState().session!.puzzlesSkipped).toBe(1)
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().skipPuzzle()
      expect(useGameStore.getState().session).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // completeSession
  // -----------------------------------------------------------------------

  describe('completeSession', () => {
    it('should set status to completed', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().completeSession(750)

      expect(useGameStore.getState().session!.status).toBe('completed')
    })

    it('should set completedAt timestamp', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().completeSession(750)

      expect(useGameStore.getState().session!.completedAt).toBe(NOW)
    })

    it('should set final total points', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().completeSession(750)

      expect(useGameStore.getState().session!.totalPoints).toBe(750)
    })

    it('should not change state when session is null', () => {
      useGameStore.getState().completeSession(750)
      expect(useGameStore.getState().session).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // setSession / clearSession
  // -----------------------------------------------------------------------

  describe('setSession', () => {
    it('should set session and mark as initialized', () => {
      const session = createMockSession()
      useGameStore.getState().setSession(session)

      expect(useGameStore.getState().session).toEqual(session)
      expect(useGameStore.getState().isInitialized).toBe(true)
    })

    it('should allow setting session to null', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().setSession(null)

      expect(useGameStore.getState().session).toBeNull()
      expect(useGameStore.getState().isInitialized).toBe(true)
    })
  })

  describe('clearSession', () => {
    it('should reset to initial state', () => {
      useGameStore.getState().startSession(createMockSession())
      useGameStore.getState().completeStation(createMockStationProgress())
      useGameStore.getState().clearSession()

      const state = useGameStore.getState()
      expect(state.session).toBeNull()
      expect(state.stationProgress).toEqual([])
      expect(state.isInitialized).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Immutability
  // -----------------------------------------------------------------------

  describe('immutability', () => {
    it('should not mutate the previous session object', () => {
      const session = createMockSession()
      useGameStore.getState().startSession(session)

      const sessionBefore = useGameStore.getState().session
      useGameStore.getState().updateProgress({ totalPoints: 999 })
      const sessionAfter = useGameStore.getState().session

      // They should be different object references
      expect(sessionBefore).not.toBe(sessionAfter)
      // Original should not be mutated
      expect(sessionBefore!.totalPoints).toBe(0)
      expect(sessionAfter!.totalPoints).toBe(999)
    })

    it('should not mutate stationProgress array', () => {
      useGameStore.getState().startSession(createMockSession())
      const progressBefore = useGameStore.getState().stationProgress

      useGameStore.getState().completeStation(createMockStationProgress())
      const progressAfter = useGameStore.getState().stationProgress

      expect(progressBefore).not.toBe(progressAfter)
      expect(progressBefore).toHaveLength(0)
      expect(progressAfter).toHaveLength(1)
    })
  })
})
