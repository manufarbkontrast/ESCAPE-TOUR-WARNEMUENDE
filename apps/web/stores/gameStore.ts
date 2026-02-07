import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GameSession,
  SessionStatus,
  StationProgress,
} from '@escape-tour/shared'

interface GameState {
  readonly session: GameSession | null
  readonly stationProgress: readonly StationProgress[]
  readonly isInitialized: boolean
}

interface GameActions {
  readonly startSession: (session: GameSession) => void
  readonly updateProgress: (
    updates: Partial<
      Pick<
        GameSession,
        | 'currentStationIndex'
        | 'totalPoints'
        | 'hintsUsed'
        | 'puzzlesSkipped'
        | 'lastKnownLocation'
        | 'lastActivityAt'
      >
    >
  ) => void
  readonly pauseSession: () => void
  readonly resumeSession: () => void
  readonly completeStation: (progress: StationProgress) => void
  readonly useHint: () => void
  readonly skipPuzzle: () => void
  readonly completeSession: (totalPoints: number) => void
  readonly setSession: (session: GameSession | null) => void
  readonly clearSession: () => void
}

type GameStore = GameState & GameActions

const initialState: GameState = {
  session: null,
  stationProgress: [],
  isInitialized: false,
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      startSession: (session: GameSession) => {
        set({
          session: {
            ...session,
            status: 'active' as SessionStatus,
            startedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
          },
          stationProgress: [],
          isInitialized: true,
        })
      },

      updateProgress: (updates) => {
        set((state) => {
          if (!state.session) return state

          return {
            session: {
              ...state.session,
              ...updates,
              lastActivityAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      pauseSession: () => {
        set((state) => {
          if (!state.session || state.session.status !== 'active') return state

          return {
            session: {
              ...state.session,
              status: 'paused' as SessionStatus,
              pausedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      resumeSession: () => {
        set((state) => {
          if (!state.session || state.session.status !== 'paused') return state

          const pausedAt = state.session.pausedAt
            ? new Date(state.session.pausedAt)
            : null
          const now = new Date()
          const pauseSeconds = pausedAt
            ? Math.floor((now.getTime() - pausedAt.getTime()) / 1000)
            : 0

          return {
            session: {
              ...state.session,
              status: 'active' as SessionStatus,
              pausedAt: null,
              totalPauseSeconds: state.session.totalPauseSeconds + pauseSeconds,
              lastActivityAt: now.toISOString(),
              updatedAt: now.toISOString(),
            },
          }
        })
      },

      completeStation: (progress: StationProgress) => {
        set((state) => {
          if (!state.session) return state

          const existingProgress = state.stationProgress.find(
            (p) => p.stationId === progress.stationId
          )

          const newProgress = existingProgress
            ? state.stationProgress.map((p) =>
                p.stationId === progress.stationId ? progress : p
              )
            : [...state.stationProgress, progress]

          return {
            stationProgress: newProgress,
            session: {
              ...state.session,
              totalPoints:
                state.session.totalPoints + progress.pointsEarned + progress.timeBonusEarned,
              lastActivityAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      useHint: () => {
        set((state) => {
          if (!state.session) return state

          return {
            session: {
              ...state.session,
              hintsUsed: state.session.hintsUsed + 1,
              lastActivityAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      skipPuzzle: () => {
        set((state) => {
          if (!state.session) return state

          return {
            session: {
              ...state.session,
              puzzlesSkipped: state.session.puzzlesSkipped + 1,
              lastActivityAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      completeSession: (totalPoints: number) => {
        set((state) => {
          if (!state.session) return state

          return {
            session: {
              ...state.session,
              status: 'completed' as SessionStatus,
              completedAt: new Date().toISOString(),
              totalPoints,
              lastActivityAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        })
      },

      setSession: (session: GameSession | null) => {
        set({
          session,
          isInitialized: true,
        })
      },

      clearSession: () => {
        set(initialState)
      },
    }),
    {
      name: 'escape-tour-game',
      partialize: (state) => ({
        session: state.session,
        stationProgress: state.stationProgress,
        isInitialized: state.isInitialized,
      }),
    }
  )
)
