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

 it('should show no-document message when no imageUrl', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'document_analysis',
   imageUrl: null,
  })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Kein Dokument verfügbar.')).toBeInTheDocument()
 })

 it('should show English no-document message', () => {
  const puzzle = createMockPuzzle({ imageUrl: null })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('No document available.')).toBeInTheDocument()
 })

 it('should toggle zoom on image click', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({
   imageUrl: 'https://example.com/doc.jpg',
  })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  // Initially not zoomed
  const zoomBtn = screen.getByLabelText('Vergrößern')
  expect(zoomBtn).toBeInTheDocument()

  // Click to zoom in
  await user.click(zoomBtn)
  expect(screen.getByLabelText('Verkleinern')).toBeInTheDocument()

  // Click to zoom out
  await user.click(screen.getByLabelText('Verkleinern'))
  expect(screen.getByLabelText('Vergrößern')).toBeInTheDocument()
 })

 it('should submit trimmed answer', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ imageUrl: null })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), ' 1857 ')
  await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
  expect(mockOnSubmit).toHaveBeenCalledWith('1857')
 })

 it('should show instruction from puzzle', () => {
  const puzzle = createMockPuzzle({
   instructionDe: 'Lesen Sie das Dokument genau.',
  })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Lesen Sie das Dokument genau.')).toBeInTheDocument()
 })

 it('should show default hint when no instruction', () => {
  const puzzle = createMockPuzzle({ instructionDe: null })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(
   screen.getByText('Untersuchen Sie das Dokument sorgfältig. Tippen Sie zum Vergrößern.'),
  ).toBeInTheDocument()
 })

 it('should show case-sensitive hint when applicable', () => {
  const puzzle = createMockPuzzle({ caseSensitive: true })
  render(
   <DocumentAnalysisPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Groß-/Kleinschreibung beachten')).toBeInTheDocument()
 })
})
