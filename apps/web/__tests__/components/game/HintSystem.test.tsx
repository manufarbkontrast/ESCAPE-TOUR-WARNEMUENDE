// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HintSystem } from '@/components/game/HintSystem'

// Mock gameStore
const mockUseHint = vi.fn()
const mockGameState = vi.hoisted(() => ({
 current: {
  session: null as Record<string, unknown> | null,
 },
}))

vi.mock('@/stores/gameStore', () => ({
 useGameStore: (selector: (state: Record<string, unknown>) => unknown) =>
  selector({
   session: mockGameState.current.session,
   useHint: mockUseHint,
  }),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
 motion: {
  div: ({ children, ...props }: Record<string, unknown>) => {
   const { variants, initial, animate, exit, ...rest } = props
   const filtered: Record<string, unknown> = {}
   for (const [key, value] of Object.entries(rest)) {
    if (typeof value !== 'function' && typeof value !== 'object') {
     filtered[key] = value
    } else if (key === 'className' || key === 'style') {
     filtered[key] = value
    }
   }
   return <div {...filtered}>{children as React.ReactNode}</div>
  },
 },
 AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('HintSystem', () => {
 const defaultProps = {
  puzzleId: 'puzzle-1',
  sessionId: 'session-1',
  language: 'de' as const,
  onClose: vi.fn(),
 }

 beforeEach(() => {
  defaultProps.onClose.mockClear()
  mockUseHint.mockClear()
  mockFetch.mockReset()
  mockGameState.current = {
   session: {
    startedAt: '2025-01-01T00:00:00Z',
    totalPauseSeconds: 0,
   },
  }
 })

 it('should show loading state initially', () => {
  mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves
  render(<HintSystem {...defaultProps} />)
  expect(screen.getByText('Wird geladen...')).toBeInTheDocument()
 })

 it('should show German heading', () => {
  mockFetch.mockReturnValue(new Promise(() => {}))
  render(<HintSystem {...defaultProps} />)
  expect(screen.getByText('Hinweise')).toBeInTheDocument()
 })

 it('should show English heading', () => {
  mockFetch.mockReturnValue(new Promise(() => {}))
  render(<HintSystem {...defaultProps} language="en" />)
  expect(screen.getByText('Hints')).toBeInTheDocument()
 })

 it('should have close button', () => {
  mockFetch.mockReturnValue(new Promise(() => {}))
  render(<HintSystem {...defaultProps} />)
  expect(screen.getByLabelText('Schließen')).toBeInTheDocument()
 })

 it('should call onClose when close button clicked', async () => {
  const user = userEvent.setup()
  mockFetch.mockReturnValue(new Promise(() => {}))
  render(<HintSystem {...defaultProps} />)
  await user.click(screen.getByLabelText('Schließen'))
  expect(defaultProps.onClose).toHaveBeenCalledOnce()
 })

 it('should show no hints available when empty', async () => {
  mockFetch.mockResolvedValue({
   ok: true,
   json: () => Promise.resolve({ data: [] }),
  })
  render(<HintSystem {...defaultProps} />)
  await waitFor(() => {
   expect(screen.getByText('Keine Hinweise verfügbar')).toBeInTheDocument()
  })
 })

 it('should show English no hints message', async () => {
  mockFetch.mockResolvedValue({
   ok: true,
   json: () => Promise.resolve({ data: [] }),
  })
  render(<HintSystem {...defaultProps} language="en" />)
  await waitFor(() => {
   expect(screen.getByText('No hints available')).toBeInTheDocument()
  })
 })

 it('should render hints when fetched', async () => {
  vi.setSystemTime(new Date('2025-01-01T00:10:00Z'))
  mockFetch.mockResolvedValue({
   ok: true,
   json: () =>
    Promise.resolve({
     data: [
      {
       id: 'hint-1',
       puzzleId: 'puzzle-1',
       hintLevel: 1,
       textDe: 'Kleiner Tipp',
       textEn: 'Small tip',
       pointPenalty: 10,
       availableAfterSeconds: 0,
      },
     ],
    }),
  })
  render(<HintSystem {...defaultProps} />)
  await waitFor(() => {
   expect(screen.getByText('Kleiner Hinweis')).toBeInTheDocument()
  })
  expect(screen.getByText('-10pts')).toBeInTheDocument()
  vi.useRealTimers()
 })

 it('should handle fetch error gracefully', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mockFetch.mockResolvedValue({
   ok: false,
  })
  render(<HintSystem {...defaultProps} />)
  await waitFor(() => {
   expect(screen.queryByText('Wird geladen...')).not.toBeInTheDocument()
  })
  consoleSpy.mockRestore()
 })
})
