import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STAFF_TOKEN_STORAGE_KEY, isStaffTokenFresh } from '@/lib/utils/staff-token'

interface RecentSession {
  readonly id: string
  readonly tourType: string
  readonly createdAt: string
}

interface StaffState {
  token: string | null
  recentSessions: readonly RecentSession[]
}

interface StaffActions {
  setToken: (token: string) => void
  clearToken: () => void
  isAuthenticated: () => boolean
  addRecentSession: (session: RecentSession) => void
  clearSessions: () => void
}

export const useStaffStore = create<StaffState & StaffActions>()(
  persist(
    (set, get) => ({
      token: null,
      recentSessions: [],

      setToken: (token) => set({ token }),

      clearToken: () => set({ token: null }),

      isAuthenticated: () => {
        const { token } = get()
        if (!token) return false
        return isStaffTokenFresh(token)
      },

      addRecentSession: (session) =>
        set((state) => ({
          recentSessions: [session, ...state.recentSessions].slice(0, 10),
        })),

      clearSessions: () => set({ recentSessions: [] }),
    }),
    {
      name: STAFF_TOKEN_STORAGE_KEY,
    },
  ),
)
