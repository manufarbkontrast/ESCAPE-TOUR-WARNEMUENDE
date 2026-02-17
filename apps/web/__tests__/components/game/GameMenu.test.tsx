// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameMenu } from '@/components/game/GameMenu'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock gameStore
const mockGameState = vi.hoisted(() => ({
  current: {
    session: null as Record<string, unknown> | null,
  },
}))

const mockPauseSession = vi.fn()
const mockResumeSession = vi.fn()

vi.mock('@/stores', () => ({
  useGameStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      session: mockGameState.current.session,
      pauseSession: mockPauseSession,
      resumeSession: mockResumeSession,
    }),
}))

// Mock audioStore
const mockAudioState = vi.hoisted(() => ({
  current: { isMuted: false },
}))
const mockToggleMute = vi.fn()

vi.mock('@/stores/audioStore', () => ({
  useAudioStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isMuted: mockAudioState.current.isMuted,
      toggleMute: mockToggleMute,
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

describe('GameMenu', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockPush.mockClear()
    mockPauseSession.mockClear()
    mockResumeSession.mockClear()
    mockToggleMute.mockClear()
    mockGameState.current = { session: null }
    mockAudioState.current = { isMuted: false }
  })

  it('should render nothing when closed', () => {
    const { container } = render(
      <GameMenu isOpen={false} onClose={mockOnClose} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('should render menu heading when open', () => {
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Menü')).toBeInTheDocument()
  })

  it('should render close button', () => {
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByLabelText('Menü schließen')).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', async () => {
    const user = userEvent.setup()
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    await user.click(screen.getByLabelText('Menü schließen'))
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('should show pause button when session is active', () => {
    mockGameState.current = {
      session: { status: 'active', totalPoints: 250 },
    }
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Tour pausieren')).toBeInTheDocument()
  })

  it('should show resume button when session is paused', () => {
    mockGameState.current = {
      session: { status: 'paused', totalPoints: 250 },
    }
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Tour fortsetzen')).toBeInTheDocument()
  })

  it('should call pauseSession when pause clicked', async () => {
    const user = userEvent.setup()
    mockGameState.current = {
      session: { status: 'active', totalPoints: 100 },
    }
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    await user.click(screen.getByText('Tour pausieren'))
    expect(mockPauseSession).toHaveBeenCalledOnce()
  })

  it('should call resumeSession when resume clicked', async () => {
    const user = userEvent.setup()
    mockGameState.current = {
      session: { status: 'paused', totalPoints: 100 },
    }
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    await user.click(screen.getByText('Tour fortsetzen'))
    expect(mockResumeSession).toHaveBeenCalledOnce()
  })

  it('should show sound toggle when unmuted', () => {
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Ton ausschalten')).toBeInTheDocument()
  })

  it('should show sound toggle when muted', () => {
    mockAudioState.current = { isMuted: true }
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Ton einschalten')).toBeInTheDocument()
  })

  it('should call toggleMute when sound button clicked', async () => {
    const user = userEvent.setup()
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    await user.click(screen.getByText('Ton ausschalten'))
    expect(mockToggleMute).toHaveBeenCalledOnce()
  })

  it('should show points when session exists', () => {
    mockGameState.current = {
      session: { status: 'active', totalPoints: 500 },
    }
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Punkte')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('should navigate to home on exit tour', async () => {
    const user = userEvent.setup()
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    await user.click(screen.getByText('Tour verlassen'))
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should have dialog role', () => {
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should close on Escape key', async () => {
    const user = userEvent.setup()
    render(<GameMenu isOpen={true} onClose={mockOnClose} />)
    await user.keyboard('{Escape}')
    expect(mockOnClose).toHaveBeenCalled()
  })
})
