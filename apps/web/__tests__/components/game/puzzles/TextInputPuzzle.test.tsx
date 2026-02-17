// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInputPuzzle } from '@/components/game/puzzles/TextInputPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('TextInputPuzzle', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  const puzzle = createMockPuzzle({ puzzleType: 'text_analysis' })

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render text input with German placeholder', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeInTheDocument()
  })

  it('should render text input with English placeholder', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument()
  })

  it('should render submit button in German', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByRole('button', { name: 'Antwort einreichen' })).toBeInTheDocument()
  })

  it('should render submit button in English', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeInTheDocument()
  })

  it('should show checking text when submitting', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
    )
    expect(screen.getByText('Wird überprüft...')).toBeInTheDocument()
  })

  it('should disable submit button when input is empty', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    const submitBtn = screen.getByRole('button', { name: 'Antwort einreichen' })
    expect(submitBtn).toBeDisabled()
  })

  it('should enable submit button when input has value', async () => {
    const user = userEvent.setup()
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'test')
    const submitBtn = screen.getByRole('button', { name: 'Antwort einreichen' })
    expect(submitBtn).toBeEnabled()
  })

  it('should call onSubmit with trimmed answer on form submit', async () => {
    const user = userEvent.setup()
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), '  hello  ')
    await user.click(screen.getByRole('button', { name: 'Antwort einreichen' }))
    expect(mockOnSubmit).toHaveBeenCalledWith('hello')
  })

  it('should not submit when answer is only whitespace', async () => {
    const user = userEvent.setup()
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), '   ')
    const submitBtn = screen.getByRole('button', { name: 'Antwort einreichen' })
    expect(submitBtn).toBeDisabled()
  })

  it('should show case-sensitive hint when puzzle is case sensitive', () => {
    const csPuzzle = createMockPuzzle({ caseSensitive: true })
    render(
      <TextInputPuzzle puzzle={csPuzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Groß-/Kleinschreibung beachten')).toBeInTheDocument()
  })

  it('should not show case-sensitive hint when not case sensitive', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.queryByText('Groß-/Kleinschreibung beachten')).not.toBeInTheDocument()
  })

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup()
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'test')
    expect(screen.getByLabelText('Löschen')).toBeInTheDocument()
  })

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    const input = screen.getByPlaceholderText('Ihre Antwort eingeben...')
    await user.type(input, 'test')
    await user.click(screen.getByLabelText('Löschen'))
    expect(input).toHaveValue('')
  })

  it('should disable input when submitting', () => {
    render(
      <TextInputPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
    )
    expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeDisabled()
  })
})
