// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Timer } from '@/components/game/Timer'

// Mock the gameStore
const mockSession = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}))

vi.mock('@/stores/gameStore', () => ({
  useGameStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ session: mockSession.current }),
}))

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSession.current = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render nothing when session is null', () => {
    mockSession.current = null
    const { container } = render(<Timer sessionId="session-1" />)
    expect(container.innerHTML).toBe('')
  })

  it('should show 00:00 when session ID does not match (effect bails out)', () => {
    const now = new Date('2025-01-01T00:05:00Z').getTime()
    vi.setSystemTime(now)

    mockSession.current = {
      id: 'other-session',
      status: 'active',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 0,
    }
    render(<Timer sessionId="session-1" />)
    // Component renders because session is not null, but useEffect bails out
    // due to ID mismatch, so elapsed stays at default 0
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('should display formatted time 00:00 when startedAt is null', () => {
    mockSession.current = {
      id: 'session-1',
      status: 'active',
      startedAt: null,
      totalPauseSeconds: 0,
    }
    render(<Timer sessionId="session-1" />)
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('should display elapsed time based on startedAt', () => {
    const now = new Date('2025-01-01T00:05:30Z').getTime()
    vi.setSystemTime(now)

    mockSession.current = {
      id: 'session-1',
      status: 'active',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 0,
    }

    render(<Timer sessionId="session-1" />)
    // 5 minutes 30 seconds = 05:30
    expect(screen.getByText('05:30')).toBeInTheDocument()
  })

  it('should subtract pause seconds from elapsed time', () => {
    const now = new Date('2025-01-01T00:10:00Z').getTime()
    vi.setSystemTime(now)

    mockSession.current = {
      id: 'session-1',
      status: 'active',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 120, // 2 minutes paused
    }

    render(<Timer sessionId="session-1" />)
    // 10 minutes - 2 minutes pause = 08:00
    expect(screen.getByText('08:00')).toBeInTheDocument()
  })

  it('should show paused indicator when session is paused', () => {
    const now = new Date('2025-01-01T00:05:00Z').getTime()
    vi.setSystemTime(now)

    mockSession.current = {
      id: 'session-1',
      status: 'paused',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 0,
    }

    render(<Timer sessionId="session-1" />)
    expect(screen.getByText('(paused)')).toBeInTheDocument()
  })

  it('should not show paused indicator when session is active', () => {
    const now = new Date('2025-01-01T00:05:00Z').getTime()
    vi.setSystemTime(now)

    mockSession.current = {
      id: 'session-1',
      status: 'active',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 0,
    }

    render(<Timer sessionId="session-1" />)
    expect(screen.queryByText('(paused)')).not.toBeInTheDocument()
  })

  it('should update elapsed time every second when active', () => {
    const start = new Date('2025-01-01T00:00:00Z').getTime()
    vi.setSystemTime(start)

    mockSession.current = {
      id: 'session-1',
      status: 'active',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 0,
    }

    render(<Timer sessionId="session-1" />)
    expect(screen.getByText('00:00')).toBeInTheDocument()

    // Advance both system time and fake timers by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText('00:05')).toBeInTheDocument()
  })

  it('should not tick when paused', () => {
    const start = new Date('2025-01-01T00:01:00Z').getTime()
    vi.setSystemTime(start)

    mockSession.current = {
      id: 'session-1',
      status: 'paused',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 0,
    }

    render(<Timer sessionId="session-1" />)
    expect(screen.getByText('01:00')).toBeInTheDocument()

    act(() => {
      vi.setSystemTime(start + 10000)
      vi.advanceTimersByTime(5000)
    })
    // Should still show 01:00 because paused doesn't tick
    expect(screen.getByText('01:00')).toBeInTheDocument()
  })

  it('should never display negative time', () => {
    const now = new Date('2025-01-01T00:01:00Z').getTime()
    vi.setSystemTime(now)

    mockSession.current = {
      id: 'session-1',
      status: 'active',
      startedAt: '2025-01-01T00:00:00Z',
      totalPauseSeconds: 120, // More pause than elapsed
    }

    render(<Timer sessionId="session-1" />)
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})
