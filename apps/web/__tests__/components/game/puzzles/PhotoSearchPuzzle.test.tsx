// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhotoSearchPuzzle } from '@/components/game/puzzles/PhotoSearchPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('PhotoSearchPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

 beforeEach(() => {
  mockOnSubmit.mockClear()
 })

 it('should render image when imageUrl is provided', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'photo_search',
   imageUrl: 'https://example.com/photo.jpg',
  })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const img = screen.getByAltText('Suchbild')
  expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
 })

 it('should use English alt text', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'photo_search',
   imageUrl: 'https://example.com/photo.jpg',
  })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByAltText('Search image')).toBeInTheDocument()
 })

 it('should show instruction when provided', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'photo_search',
   instructionDe: 'Schauen Sie genau hin',
  })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Schauen Sie genau hin')).toBeInTheDocument()
 })

 it('should show default observation hint when no instruction', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'photo_search',
   instructionDe: null,
  })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(
   screen.getByText('Betrachten Sie das Bild genau und beantworten Sie die Frage.'),
  ).toBeInTheDocument()
 })

 it('should submit trimmed answer', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'photo_search' })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByPlaceholderText('Was haben Sie entdeckt?'), ' Leuchtturm ')
  await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
  expect(mockOnSubmit).toHaveBeenCalledWith('Leuchtturm')
 })

 it('should disable submit when empty', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'photo_search' })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeDisabled()
 })

 it('should show case-sensitive hint', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'photo_search', caseSensitive: true })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Case sensitive')).toBeInTheDocument()
 })
})
