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

 it('should not render image when no imageUrl', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'photo_search', imageUrl: null })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.queryByAltText('Suchbild')).not.toBeInTheDocument()
 })

 it('should submit trimmed answer', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'photo_search' })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByPlaceholderText('Eure Antwort...'), ' Leuchtturm ')
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

 it('should show submitting state', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'photo_search' })
  render(
   <PhotoSearchPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Prüfe...')).toBeInTheDocument()
 })
})
