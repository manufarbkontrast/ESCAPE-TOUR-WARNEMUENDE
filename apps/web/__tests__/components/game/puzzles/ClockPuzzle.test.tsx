// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClockPuzzle } from '@/components/game/puzzles/ClockPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('ClockPuzzle', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  const puzzle = createMockPuzzle({ puzzleType: 'clock' })

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render the clock SVG', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    const svg = document.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should show initial time 12:00', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('should show AM/PM toggle buttons in German', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Vormittag')).toBeInTheDocument()
    expect(screen.getByText('Nachmittag')).toBeInTheDocument()
  })

  it('should show AM/PM toggle buttons in English', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('AM')).toBeInTheDocument()
    expect(screen.getByText('PM')).toBeInTheDocument()
  })

  it('should switch to PM when Nachmittag is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.click(screen.getByText('Nachmittag'))
    // 12:00 PM = 12:00 in 24h
    expect(screen.getByText('12:00')).toBeInTheDocument()
  })

  it('should show instruction text when provided', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Geben Sie die Antwort ein.')).toBeInTheDocument()
  })

  it('should show submit button in German', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Uhrzeit prüfen')).toBeInTheDocument()
  })

  it('should show submit button in English', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Check time')).toBeInTheDocument()
  })

  it('should show loading text when submitting', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
    )
    expect(screen.getByText('Prüfe...')).toBeInTheDocument()
  })

  it('should call onSubmit with time string on form submit', async () => {
    const user = userEvent.setup()
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.click(screen.getByText('Uhrzeit prüfen'))
    expect(mockOnSubmit).toHaveBeenCalledWith('00:00')
  })

  it('should render hour labels 12, 3, 6, 9', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('should show drag hint text', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Zieht die Zeiger auf die richtige Uhrzeit')).toBeInTheDocument()
  })

  it('should disable submit button when submitting', () => {
    render(
      <ClockPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
    )
    const button = screen.getByText('Prüfe...')
    expect(button).toBeDisabled()
  })
})
