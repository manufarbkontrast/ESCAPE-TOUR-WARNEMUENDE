// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SlidePuzzle } from '@/components/game/puzzles/SlidePuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

describe('SlidePuzzle', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  const puzzle = createMockPuzzle({ puzzleType: 'slide_puzzle' })

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render the puzzle grid after initialization', async () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    // Wait for shuffled tiles to appear (1-8 visible, 0 is empty)
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('should show instruction text when provided', () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Geben Sie die Antwort ein.')).toBeInTheDocument()
  })

  it('should show move counter', () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Züge: 0')).toBeInTheDocument()
  })

  it('should show English move counter', () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.getByText('Moves: 0')).toBeInTheDocument()
  })

  it('should show help text for sliding tiles', () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(
      screen.getByText('Tippt auf eine markierte Kachel, um sie zu verschieben.'),
    ).toBeInTheDocument()
  })

  it('should show English help text', () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(
      screen.getByText('Tap a highlighted tile to slide it.'),
    ).toBeInTheDocument()
  })

  it('should increment move counter when a tile is clicked', async () => {
    const user = userEvent.setup()
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )

    // Wait for tiles to render
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    // Find all tile buttons and click one (some will be adjacent to empty)
    const buttons = screen.getAllByRole('button')
    const enabledButtons = buttons.filter((b) => !b.hasAttribute('disabled'))

    if (enabledButtons.length > 0) {
      await user.click(enabledButtons[0])
      // Move counter should have incremented
      await waitFor(() => {
        expect(screen.getByText('Züge: 1')).toBeInTheDocument()
      })
    }
  })

  it('should not show answer input before puzzle is solved', () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )
    expect(screen.queryByPlaceholderText('Lösungswort eingeben...')).not.toBeInTheDocument()
  })

  it('should render all 8 numbered tiles', async () => {
    render(
      <SlidePuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
    )

    await waitFor(() => {
      for (let i = 1; i <= 8; i++) {
        expect(screen.getByText(String(i))).toBeInTheDocument()
      }
    })
  })
})
