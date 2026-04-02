// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocumentAnalysisPuzzle } from '@/components/game/puzzles/DocumentAnalysisPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('DocumentAnalysisPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

 beforeEach(() => {
  mockOnSubmit.mockClear()
 })

 it('should render document image when imageUrl provided', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'document_analysis',
   imageUrl: 'https://example.com/doc.jpg',
  })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const img = screen.getByAltText('Dokument')
  expect(img).toHaveAttribute('src', 'https://example.com/doc.jpg')
 })

 it('should not show image when no imageUrl', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'document_analysis', imageUrl: null })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.queryByAltText('Dokument')).not.toBeInTheDocument()
 })

 it('should toggle zoom on image click', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ imageUrl: 'https://example.com/doc.jpg' })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const zoomBtn = screen.getByLabelText('Vergrößern')
  await user.click(zoomBtn)
  expect(screen.getByLabelText('Verkleinern')).toBeInTheDocument()
 })

 it('should submit trimmed answer', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ imageUrl: null })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByPlaceholderText('Eure Antwort...'), ' 1857 ')
  await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
  expect(mockOnSubmit).toHaveBeenCalledWith('1857')
 })

 it('should disable submit when empty', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'document_analysis' })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeDisabled()
 })

 it('should show submitting state', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'document_analysis' })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Prüfe...')).toBeInTheDocument()
 })
})
