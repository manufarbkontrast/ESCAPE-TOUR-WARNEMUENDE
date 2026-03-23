// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogicPuzzle } from '@/components/game/puzzles/LogicPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('LogicPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

 beforeEach(() => {
  mockOnSubmit.mockClear()
 })

 describe('with multiple choice options', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'logic',
   instructionDe: 'Waehle die richtige Antwort',
   instructionEn: 'Choose the correct answer',
   options: [
    { id: 'opt-a', textDe: 'Option A', textEn: 'Option A EN' },
    { id: 'opt-b', textDe: 'Option B', textEn: 'Option B EN' },
    { id: 'opt-c', textDe: 'Option C', textEn: 'Option C EN' },
   ],
  })

  it('should render all options as buttons', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   expect(screen.getByText('Option A')).toBeInTheDocument()
   expect(screen.getByText('Option B')).toBeInTheDocument()
   expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('should render English option text', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   expect(screen.getByText('Option A EN')).toBeInTheDocument()
  })

  it('should highlight selected option', async () => {
   const user = userEvent.setup()
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   const optionA = screen.getByText('Option A')
   await user.click(optionA)
   expect(optionA.className).toContain('border-white/20')
  })

  it('should disable submit when no option selected', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   const submitBtn = screen.getByRole('button', { name: 'Antwort prüfen' })
   expect(submitBtn).toBeDisabled()
  })

  it('should enable submit when option is selected', async () => {
   const user = userEvent.setup()
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   await user.click(screen.getByText('Option B'))
   const submitBtn = screen.getByRole('button', { name: 'Antwort prüfen' })
   expect(submitBtn).toBeEnabled()
  })

  it('should submit selected option ID', async () => {
   const user = userEvent.setup()
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   await user.click(screen.getByText('Option B'))
   await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
   expect(mockOnSubmit).toHaveBeenCalledWith('opt-b')
  })

  it('should show instruction text', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   expect(screen.getByText('Waehle die richtige Antwort')).toBeInTheDocument()
  })
 })

 describe('with text input fallback', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'logic',
   options: null,
   caseSensitive: true,
  })

  it('should render text input when no options', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeInTheDocument()
  })

  it('should disable submit when text is empty', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   const submitBtn = screen.getByRole('button', { name: 'Antwort prüfen' })
   expect(submitBtn).toBeDisabled()
  })

  it('should submit text answer', async () => {
   const user = userEvent.setup()
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'my answer')
   await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
   expect(mockOnSubmit).toHaveBeenCalledWith('my answer')
  })

  it('should show case-sensitive hint in text mode', () => {
   render(
    <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   expect(screen.getByText('Groß-/Kleinschreibung beachten')).toBeInTheDocument()
  })

  it('should not show case-sensitive hint in options mode', () => {
   const optionPuzzle = createMockPuzzle({
    caseSensitive: true,
    options: [{ id: 'a', textDe: 'A', textEn: 'A' }],
   })
   render(
    <LogicPuzzle puzzle={optionPuzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
   )
   expect(screen.queryByText('Groß-/Kleinschreibung beachten')).not.toBeInTheDocument()
  })
 })

 it('should render puzzle image when imageUrl is set', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'logic',
   imageUrl: 'https://example.com/puzzle.jpg',
   options: null,
  })
  render(
   <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const img = screen.getByAltText('Rätsel-Bild')
  expect(img).toBeInTheDocument()
  expect(img).toHaveAttribute('src', 'https://example.com/puzzle.jpg')
 })

 it('should show checking text when submitting', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'logic', options: null })
  render(
   <LogicPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Prüfe...')).toBeInTheDocument()
 })
})
