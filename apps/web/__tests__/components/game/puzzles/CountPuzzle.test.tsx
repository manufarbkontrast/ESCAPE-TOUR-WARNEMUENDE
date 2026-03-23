// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountPuzzle } from '@/components/game/puzzles/CountPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('CountPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
 const puzzle = createMockPuzzle({ puzzleType: 'count' })

 beforeEach(() => {
  mockOnSubmit.mockClear()
 })

 it('should render with initial count of 0', () => {
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const input = screen.getByRole('spinbutton')
  expect(input).toHaveValue(0)
 })

 it('should increment count when + button is clicked', async () => {
  const user = userEvent.setup()
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.click(screen.getByLabelText('Erhöhen'))
  expect(screen.getByRole('spinbutton')).toHaveValue(1)
 })

 it('should decrement count when - button is clicked', async () => {
  const user = userEvent.setup()
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  // First increment to 2
  await user.click(screen.getByLabelText('Erhöhen'))
  await user.click(screen.getByLabelText('Erhöhen'))
  expect(screen.getByRole('spinbutton')).toHaveValue(2)

  // Then decrement to 1
  await user.click(screen.getByLabelText('Verringern'))
  expect(screen.getByRole('spinbutton')).toHaveValue(1)
 })

 it('should not decrement below 0', async () => {
  const user = userEvent.setup()
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const decrementBtn = screen.getByLabelText('Verringern')
  expect(decrementBtn).toBeDisabled()
 })

 it('should call onSubmit with current count', async () => {
  const user = userEvent.setup()
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.click(screen.getByLabelText('Erhöhen'))
  await user.click(screen.getByLabelText('Erhöhen'))
  await user.click(screen.getByLabelText('Erhöhen'))

  await user.click(screen.getByRole('button', { name: 'Antwort einreichen' }))
  expect(mockOnSubmit).toHaveBeenCalledWith(3)
 })

 it('should use English labels', () => {
  render(
   <CountPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByLabelText('Increase')).toBeInTheDocument()
  expect(screen.getByLabelText('Decrease')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeInTheDocument()
 })

 it('should show checking text when submitting', () => {
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Wird überprüft...')).toBeInTheDocument()
 })

 it('should disable buttons when submitting', () => {
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByRole('spinbutton')).toBeDisabled()
 })

 it('should allow direct number input', async () => {
  const user = userEvent.setup()
  render(
   <CountPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  const input = screen.getByRole('spinbutton')
  await user.clear(input)
  await user.type(input, '42')
  expect(input).toHaveValue(42)
 })
})
