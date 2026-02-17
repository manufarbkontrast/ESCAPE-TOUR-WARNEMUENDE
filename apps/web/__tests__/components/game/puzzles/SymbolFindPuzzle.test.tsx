// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SymbolFindPuzzle } from '@/components/game/puzzles/SymbolFindPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('SymbolFindPuzzle', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render text input with German placeholder', () => {
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find' })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByPlaceholderText('Symbol oder Text eingeben...')).toBeInTheDocument()
  })

  it('should render text input with English placeholder', () => {
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find' })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByPlaceholderText('Enter symbol or text...')).toBeInTheDocument()
  })

  it('should show instruction when provided', () => {
    const puzzle = createMockPuzzle({
      puzzleType: 'symbol_find',
      instructionDe: 'Finden Sie das Symbol am Leuchtturm',
    })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Finden Sie das Symbol am Leuchtturm')).toBeInTheDocument()
  })

  it('should show default search hint when no instruction', () => {
    const puzzle = createMockPuzzle({
      puzzleType: 'symbol_find',
      instructionDe: null,
      instructionEn: null,
    })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(
      screen.getByText('Suchen Sie an der beschriebenen Stelle nach dem Symbol oder Text.'),
    ).toBeInTheDocument()
  })

  it('should show reference image when imageUrl is set', () => {
    const puzzle = createMockPuzzle({
      puzzleType: 'symbol_find',
      imageUrl: 'https://example.com/hint.jpg',
    })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    const img = screen.getByAltText('Hinweisbild')
    expect(img).toHaveAttribute('src', 'https://example.com/hint.jpg')
  })

  it('should use English alt text for image', () => {
    const puzzle = createMockPuzzle({
      puzzleType: 'symbol_find',
      imageUrl: 'https://example.com/hint.jpg',
    })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByAltText('Hint image')).toBeInTheDocument()
  })

  it('should submit trimmed answer', async () => {
    const user = userEvent.setup()
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find' })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.type(screen.getByPlaceholderText('Symbol oder Text eingeben...'), '  ANKER  ')
    await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
    expect(mockOnSubmit).toHaveBeenCalledWith('ANKER')
  })

  it('should disable submit when input is empty', () => {
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find' })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeDisabled()
  })

  it('should show checking text when submitting', () => {
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find' })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
    )
    expect(screen.getByText('Prüfe...')).toBeInTheDocument()
  })

  it('should show case-sensitive hint when applicable', () => {
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find', caseSensitive: true })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Case sensitive')).toBeInTheDocument()
  })

  it('should disable input when submitting', () => {
    const puzzle = createMockPuzzle({ puzzleType: 'symbol_find' })
    render(
      <SymbolFindPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
    )
    expect(screen.getByPlaceholderText('Symbol oder Text eingeben...')).toBeDisabled()
  })
})
