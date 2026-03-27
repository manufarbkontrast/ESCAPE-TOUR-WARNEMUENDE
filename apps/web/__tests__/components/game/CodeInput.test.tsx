// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeInput } from '@/components/game/CodeInput'

describe('CodeInput', () => {
 const defaultProps = {
  onComplete: vi.fn(),
 } as const

 function renderCodeInput(overrides: Partial<Parameters<typeof CodeInput>[0]> = {}) {
  return render(<CodeInput {...defaultProps} {...overrides} />)
 }

 it('should render 6 input fields by default', () => {
  renderCodeInput()
  const inputs = screen.getAllByRole('textbox')
  expect(inputs).toHaveLength(6)
 })

 it('should render custom length', () => {
  renderCodeInput({ length: 4 })
  const inputs = screen.getAllByRole('textbox')
  expect(inputs).toHaveLength(4)
 })

 it('should have aria labels in German by default', () => {
  renderCodeInput()
  expect(screen.getByLabelText('Zeichen 1')).toBeInTheDocument()
  expect(screen.getByLabelText('Zeichen 6')).toBeInTheDocument()
 })

 it('should have aria labels in English', () => {
  renderCodeInput({ language: 'en' })
  expect(screen.getByLabelText('Character 1')).toBeInTheDocument()
  expect(screen.getByLabelText('Character 6')).toBeInTheDocument()
 })

 it('should auto-focus first input on mount', () => {
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  expect(firstInput).toHaveFocus()
 })

 it('should convert input to uppercase', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  await user.type(firstInput, 'a')
  expect(firstInput).toHaveValue('A')
 })

 it('should advance focus to next input on character entry', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  const secondInput = screen.getByLabelText('Zeichen 2')
  await user.type(firstInput, 'A')
  expect(secondInput).toHaveFocus()
 })

 it('should call onComplete when all fields are filled', async () => {
  const onComplete = vi.fn()
  const user = userEvent.setup()
  renderCodeInput({ onComplete, length: 3 })

  const firstInput = screen.getByLabelText('Zeichen 1')
  await user.type(firstInput, 'A')
  await user.type(screen.getByLabelText('Zeichen 2'), 'B')
  await user.type(screen.getByLabelText('Zeichen 3'), 'C')

  expect(onComplete).toHaveBeenCalledWith('ABC')
 })

 it('should reject non-alphanumeric input', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  await user.type(firstInput, '!')
  expect(firstInput).toHaveValue('')
 })

 it('should move focus back on Backspace when current field empty', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  const secondInput = screen.getByLabelText('Zeichen 2')

  await user.type(firstInput, 'A')
  expect(secondInput).toHaveFocus()

  await user.keyboard('{Backspace}')
  expect(firstInput).toHaveFocus()
 })

 it('should clear current field on Backspace when field has value', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  await user.type(firstInput, 'A')
  // Focus is now on second input; click back to first
  await user.click(firstInput)
  await user.keyboard('{Backspace}')
  expect(firstInput).toHaveValue('')
 })

 it('should handle ArrowLeft navigation', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  const secondInput = screen.getByLabelText('Zeichen 2')

  await user.type(firstInput, 'A')
  expect(secondInput).toHaveFocus()

  await user.keyboard('{ArrowLeft}')
  expect(firstInput).toHaveFocus()
 })

 it('should handle ArrowRight navigation', async () => {
  const user = userEvent.setup()
  renderCodeInput()
  const firstInput = screen.getByLabelText('Zeichen 1')
  const secondInput = screen.getByLabelText('Zeichen 2')

  await user.click(firstInput)
  await user.keyboard('{ArrowRight}')
  expect(secondInput).toHaveFocus()
 })

 it('should handle paste with full code', () => {
  renderCodeInput({ length: 4 })
  const firstInput = screen.getByLabelText('Zeichen 1')

  fireEvent.paste(firstInput, {
   clipboardData: { getData: () => 'AB12' },
  })

  expect(screen.getByLabelText('Zeichen 1')).toHaveValue('A')
  expect(screen.getByLabelText('Zeichen 2')).toHaveValue('B')
  expect(screen.getByLabelText('Zeichen 3')).toHaveValue('1')
  expect(screen.getByLabelText('Zeichen 4')).toHaveValue('2')
 })

 it('should strip non-alphanumeric characters from paste', () => {
  renderCodeInput({ length: 4 })
  const firstInput = screen.getByLabelText('Zeichen 1')

  fireEvent.paste(firstInput, {
   clipboardData: { getData: () => 'A-B!1' },
  })

  expect(screen.getByLabelText('Zeichen 1')).toHaveValue('A')
  expect(screen.getByLabelText('Zeichen 2')).toHaveValue('B')
  expect(screen.getByLabelText('Zeichen 3')).toHaveValue('1')
 })

 it('should call onComplete after pasting full code', () => {
  const onComplete = vi.fn()
  renderCodeInput({ onComplete, length: 3 })
  const firstInput = screen.getByLabelText('Zeichen 1')

  fireEvent.paste(firstInput, {
   clipboardData: { getData: () => 'ABC' },
  })

  expect(onComplete).toHaveBeenCalledWith('ABC')
 })

 it('should disable inputs when isSubmitting is true', () => {
  renderCodeInput({ isSubmitting: true })
  const inputs = screen.getAllByRole('textbox')
  inputs.forEach((input) => {
   expect(input).toBeDisabled()
  })
 })

 it('should show error message when error prop is set', () => {
  renderCodeInput({ error: 'Invalid code' })
  expect(screen.getByText('Invalid code')).toBeInTheDocument()
 })

 it('should not show error when error is null', () => {
  renderCodeInput({ error: null })
  expect(screen.queryByText('Invalid code')).not.toBeInTheDocument()
 })

 it('should show submitting text in German', () => {
  renderCodeInput({ isSubmitting: true })
  expect(screen.getByText('Wird überprüft...')).toBeInTheDocument()
 })

 it('should show submitting text in English', () => {
  renderCodeInput({ isSubmitting: true, language: 'en' })
  expect(screen.getByText('Checking...')).toBeInTheDocument()
 })

 it('should apply error styling to inputs when error exists', () => {
  renderCodeInput({ error: 'Bad code' })
  const firstInput = screen.getByLabelText('Zeichen 1')
  expect(firstInput.style.borderColor).toContain('239')
 })
})
