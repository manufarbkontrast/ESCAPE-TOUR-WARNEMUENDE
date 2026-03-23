// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CombinationPuzzle } from '@/components/game/puzzles/CombinationPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('CombinationPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
 const puzzle = createMockPuzzle({
  puzzleType: 'combination',
  instructionDe: 'Finde den Code',
  instructionEn: 'Find the code',
 })

 beforeEach(() => {
  mockOnSubmit.mockClear()
 })

 it('should render 4 input fields', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const inputs = screen.getAllByRole('textbox')
  expect(inputs).toHaveLength(4)
 })

 it('should have aria labels for each input', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByLabelText('Zeichen 1')).toBeInTheDocument()
  expect(screen.getByLabelText('Zeichen 4')).toBeInTheDocument()
 })

 it('should display instruction text', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Finde den Code')).toBeInTheDocument()
 })

 it('should convert input to uppercase', async () => {
  const user = userEvent.setup()
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const firstInput = screen.getByLabelText('Zeichen 1')
  await user.type(firstInput, 'a')
  expect(firstInput).toHaveValue('A')
 })

 it('should advance focus on character entry', async () => {
  const user = userEvent.setup()
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByLabelText('Zeichen 1'), 'A')
  expect(screen.getByLabelText('Zeichen 2')).toHaveFocus()
 })

 it('should disable submit when not all fields filled', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const submitBtn = screen.getByRole('button', { name: 'Antwort prüfen' })
  expect(submitBtn).toBeDisabled()
 })

 it('should enable submit when all fields are filled', async () => {
  const user = userEvent.setup()
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByLabelText('Zeichen 1'), 'A')
  await user.type(screen.getByLabelText('Zeichen 2'), 'B')
  await user.type(screen.getByLabelText('Zeichen 3'), 'C')
  await user.type(screen.getByLabelText('Zeichen 4'), 'D')

  const submitBtn = screen.getByRole('button', { name: 'Antwort prüfen' })
  expect(submitBtn).toBeEnabled()
 })

 it('should call onSubmit with joined digits', async () => {
  const user = userEvent.setup()
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByLabelText('Zeichen 1'), '1')
  await user.type(screen.getByLabelText('Zeichen 2'), '2')
  await user.type(screen.getByLabelText('Zeichen 3'), '3')
  await user.type(screen.getByLabelText('Zeichen 4'), '4')

  await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
  expect(mockOnSubmit).toHaveBeenCalledWith('1234')
 })

 it('should handle paste', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  fireEvent.paste(screen.getByLabelText('Zeichen 1'), {
   clipboardData: { getData: () => 'WXYZ' },
  })

  expect(screen.getByLabelText('Zeichen 1')).toHaveValue('W')
  expect(screen.getByLabelText('Zeichen 2')).toHaveValue('X')
  expect(screen.getByLabelText('Zeichen 3')).toHaveValue('Y')
  expect(screen.getByLabelText('Zeichen 4')).toHaveValue('Z')
 })

 it('should handle Backspace navigation', async () => {
  const user = userEvent.setup()
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByLabelText('Zeichen 1'), 'A')
  // Now on field 2
  await user.keyboard('{Backspace}')
  // Should go back to field 1
  expect(screen.getByLabelText('Zeichen 1')).toHaveFocus()
 })

 it('should show checking text when submitting', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Prüfe...')).toBeInTheDocument()
 })

 it('should use English labels', () => {
  render(
   <CombinationPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByLabelText('Character 1')).toBeInTheDocument()
  expect(screen.getByText('Find the code')).toBeInTheDocument()
 })
})
