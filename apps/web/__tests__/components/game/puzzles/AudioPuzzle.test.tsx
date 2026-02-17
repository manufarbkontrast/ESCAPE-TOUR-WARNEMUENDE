// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioPuzzle } from '@/components/game/puzzles/AudioPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

// Mock requestAnimationFrame / cancelAnimationFrame
let rafCallback: FrameRequestCallback | null = null
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  rafCallback = cb
  return 1
})
vi.stubGlobal('cancelAnimationFrame', vi.fn())

describe('AudioPuzzle', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    mockOnSubmit.mockClear()
    rafCallback = null
  })

  describe('with audio url', () => {
    const puzzle = createMockPuzzle({
      puzzleType: 'audio',
      audioUrl: 'https://example.com/sound.mp3',
    })

    it('should render play button', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByLabelText('Abspielen')).toBeInTheDocument()
    })

    it('should render English play label', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })

    it('should render progress bar', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should render answer input', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeInTheDocument()
    })

    it('should render English placeholder', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument()
    })

    it('should disable submit when empty', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeDisabled()
    })

    it('should submit trimmed answer', async () => {
      const user = userEvent.setup()
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), '  Morse  ')
      await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
      expect(mockOnSubmit).toHaveBeenCalledWith('Morse')
    })

    it('should show checking text when submitting in German', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
      )
      expect(screen.getByText('Prüfe...')).toBeInTheDocument()
    })

    it('should show checking text when submitting in English', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={true} />,
      )
      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })

    it('should show English submit label', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByRole('button', { name: 'Check answer' })).toBeInTheDocument()
    })

    it('should show case-sensitive hint in German', () => {
      const csPuzzle = createMockPuzzle({
        puzzleType: 'audio',
        audioUrl: 'https://example.com/sound.mp3',
        caseSensitive: true,
      })
      render(
        <AudioPuzzle puzzle={csPuzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByText('Groß-/Kleinschreibung beachten')).toBeInTheDocument()
    })

    it('should show case-sensitive hint in English', () => {
      const csPuzzle = createMockPuzzle({
        puzzleType: 'audio',
        audioUrl: 'https://example.com/sound.mp3',
        caseSensitive: true,
      })
      render(
        <AudioPuzzle puzzle={csPuzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByText('Case sensitive')).toBeInTheDocument()
    })

    it('should disable play button when submitting', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
      )
      expect(screen.getByLabelText('Abspielen')).toBeDisabled()
    })

    it('should disable input when submitting', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
      )
      expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeDisabled()
    })

    it('should toggle play/pause via play button click', async () => {
      const user = userEvent.setup()
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )

      // Clicking play button triggers togglePlayback
      const playBtn = screen.getByLabelText('Abspielen')
      await user.click(playBtn)
      // After first click the label should change to Pause
      expect(screen.getByLabelText('Pause')).toBeInTheDocument()

      // Click again to pause
      await user.click(screen.getByLabelText('Pause'))
      expect(screen.getByLabelText('Abspielen')).toBeInTheDocument()
    })

    it('should handle audio ended event', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      const audio = document.querySelector('audio')
      expect(audio).not.toBeNull()

      // Simulate ended event
      fireEvent.ended(audio!)
      // Should reset to play state
      expect(screen.getByLabelText('Abspielen')).toBeInTheDocument()
    })

    it('should handle loadedmetadata event', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      const audio = document.querySelector('audio') as HTMLAudioElement
      expect(audio).not.toBeNull()

      // jsdom doesn't set duration, but fireEvent triggers the handler
      Object.defineProperty(audio, 'duration', { value: 120, writable: true })
      fireEvent.loadedMetadata(audio)

      // Should display formatted duration time (2:00)
      expect(screen.getByText('2:00')).toBeInTheDocument()
    })

    it('should handle progress bar click', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      const progressBar = screen.getByRole('progressbar')
      const audio = document.querySelector('audio') as HTMLAudioElement

      // Set duration on audio element
      Object.defineProperty(audio, 'duration', { value: 100, writable: true })

      // Mock getBoundingClientRect so the fraction calculation works in jsdom
      progressBar.getBoundingClientRect = () => ({
        left: 0, top: 0, right: 200, bottom: 10, width: 200, height: 10,
        x: 0, y: 0, toJSON: () => {},
      })

      // Simulate click at the 25% position (50px of 200px)
      fireEvent.click(progressBar, { clientX: 50 })

      // The handler should have set audio.currentTime = 0.25 * 100 = 25
      expect(audio.currentTime).toBe(25)
    })

    it('should not submit empty answer', async () => {
      const user = userEvent.setup()
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      // Try submitting with only whitespace
      const input = screen.getByPlaceholderText('Ihre Antwort eingeben...')
      await user.type(input, '   ')
      // Button should still be disabled because trimmed value is empty
      expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeDisabled()
    })

    it('should render audio element with correct src', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      const audio = document.querySelector('audio')
      expect(audio).not.toBeNull()
      expect(audio!.getAttribute('src')).toBe('https://example.com/sound.mp3')
    })

    it('should display 0:00 initial time', () => {
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      const timeDisplays = screen.getAllByText('0:00')
      expect(timeDisplays.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('without audio url', () => {
    it('should show no-audio message in German', () => {
      const puzzle = createMockPuzzle({ puzzleType: 'audio', audioUrl: null })
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByText('Keine Audiodatei verfügbar.')).toBeInTheDocument()
    })

    it('should show no-audio message in English', () => {
      const puzzle = createMockPuzzle({ puzzleType: 'audio', audioUrl: null })
      render(
        <AudioPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByText('No audio file available.')).toBeInTheDocument()
    })

    it('should still render answer input without audio', () => {
      const puzzle = createMockPuzzle({ puzzleType: 'audio', audioUrl: null })
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeInTheDocument()
    })

    it('should not render play button without audio', () => {
      const puzzle = createMockPuzzle({ puzzleType: 'audio', audioUrl: null })
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.queryByLabelText('Abspielen')).not.toBeInTheDocument()
    })

    it('should not render progress bar without audio', () => {
      const puzzle = createMockPuzzle({ puzzleType: 'audio', audioUrl: null })
      render(
        <AudioPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
      )
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })
})
