// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PuzzleRenderer } from '@/components/game/PuzzleRenderer'
import type { Puzzle } from '@escape-tour/shared'

// Mock framer-motion
vi.mock('framer-motion', () => ({
 motion: {
  div: ({ children, ...props }: Record<string, unknown>) => {
   const { variants, initial, animate, exit, transition, ...rest } = props
   const filtered: Record<string, unknown> = {}
   for (const [key, value] of Object.entries(rest)) {
    if (typeof value !== 'function' && typeof value !== 'object') {
     filtered[key] = value
    } else if (key === 'className' || key === 'style') {
     filtered[key] = value
    }
   }
   return <div {...filtered}>{children as React.ReactNode}</div>
  },
  p: ({ children, ...props }: Record<string, unknown>) => {
   const { variants, initial, animate, exit, transition, ...rest } = props
   const filtered: Record<string, unknown> = {}
   for (const [key, value] of Object.entries(rest)) {
    if (typeof value !== 'function' && typeof value !== 'object') {
     filtered[key] = value
    } else if (key === 'className' || key === 'style') {
     filtered[key] = value
    }
   }
   return <p {...filtered}>{children as React.ReactNode}</p>
  },
 },
 AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock sounds
vi.mock('@/lib/sounds', () => ({
 playSuccessSound: vi.fn(),
 playErrorSound: vi.fn(),
}))

// Mock demo helpers
vi.mock('@/lib/demo/helpers', () => ({
 isDemoPuzzle: (id: string) => id.startsWith('demo-'),
}))

// Mock location store (for NavigationPuzzle)
vi.mock('@/stores/locationStore', () => ({
 useLocationStore: () => ({
  userLocation: null,
  isTracking: false,
  error: null,
  startWatching: vi.fn(),
  stopWatching: vi.fn(),
  setLocation: vi.fn(),
 }),
}))

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createPuzzle(overrides: Partial<Puzzle> = {}): Puzzle {
 return {
  id: 'puzzle-1',
  stationId: 'station-1',
  orderIndex: 0,
  puzzleType: 'text_analysis',
  difficulty: 'medium',
  questionDe: 'Wie heißt der Kapitän?',
  questionEn: 'What is the captain name?',
  instructionDe: 'Lesen Sie den Text',
  instructionEn: 'Read the text',
  answerType: 'text',
  correctAnswer: { value: 'test' },
  answerValidationMode: 'exact',
  caseSensitive: false,
  options: null,
  arMarkerUrl: null,
  arContent: null,
  targetLocation: null,
  targetRadiusMeters: null,
  imageUrl: null,
  audioUrl: null,
  basePoints: 100,
  timeBonusEnabled: true,
  timeBonusMaxSeconds: 300,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
 }
}

describe('PuzzleRenderer', () => {
 const mockOnComplete = vi.fn()

 beforeEach(() => {
  mockOnComplete.mockClear()
  mockFetch.mockReset()
 })

 it('should render question text', () => {
  const puzzle = createPuzzle()
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Wie heißt der Kapitän?')).toBeInTheDocument()
 })

 it('should render English question', () => {
  const puzzle = createPuzzle()
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="en" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('What is the captain name?')).toBeInTheDocument()
 })

 it('should render difficulty badge', () => {
  const puzzle = createPuzzle({ difficulty: 'hard' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Schwer')).toBeInTheDocument()
 })

 it('should render English difficulty badge', () => {
  const puzzle = createPuzzle({ difficulty: 'easy' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="en" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Easy')).toBeInTheDocument()
 })

 it('should render base points', () => {
  const puzzle = createPuzzle({ basePoints: 200 })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('200')).toBeInTheDocument()
 })

 it('should render instruction text', () => {
  const puzzle = createPuzzle()
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Lesen Sie den Text')).toBeInTheDocument()
 })

 it('should render text_analysis puzzle type', () => {
  const puzzle = createPuzzle({ puzzleType: 'text_analysis' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  // TextInputPuzzle renders a placeholder
  expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeInTheDocument()
 })

 it('should render count puzzle type', () => {
  const puzzle = createPuzzle({ puzzleType: 'count' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByRole('spinbutton')).toBeInTheDocument()
 })

 it('should render combination puzzle type', () => {
  const puzzle = createPuzzle({ puzzleType: 'combination' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  const inputs = screen.getAllByRole('textbox')
  expect(inputs.length).toBe(4)
 })

 it('should render logic puzzle type with options', () => {
  const puzzle = createPuzzle({
   puzzleType: 'logic',
   options: [
    { id: 'a', textDe: 'Antwort A', textEn: 'Answer A' },
    { id: 'b', textDe: 'Antwort B', textEn: 'Answer B' },
   ],
  })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Antwort A')).toBeInTheDocument()
  expect(screen.getByText('Antwort B')).toBeInTheDocument()
 })

 it('should render photo_search puzzle type', () => {
  const puzzle = createPuzzle({
   puzzleType: 'photo_search',
   imageUrl: 'https://example.com/photo.jpg',
  })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByAltText('Suchbild')).toBeInTheDocument()
 })

 it('should render navigation puzzle type', () => {
  const puzzle = createPuzzle({
   puzzleType: 'navigation',
   targetLocation: null,
  })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Kein Zielort definiert.')).toBeInTheDocument()
 })

 it('should render unknown puzzle type with message', () => {
  const puzzle = createPuzzle({ puzzleType: 'unknown_type' as Puzzle['puzzleType'] })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Rätseltyp wird noch entwickelt')).toBeInTheDocument()
 })

 it('should render demo skip button for demo puzzles', () => {
  const puzzle = createPuzzle({ id: 'demo-puzzle-1' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.getByText('Rätsel überspringen (Demo)')).toBeInTheDocument()
 })

 it('should not render demo skip button for non-demo puzzles', () => {
  const puzzle = createPuzzle({ id: 'puzzle-1' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  expect(screen.queryByText('Rätsel überspringen (Demo)')).not.toBeInTheDocument()
 })

 it('should call onComplete when demo skip clicked', async () => {
  const user = userEvent.setup()
  const puzzle = createPuzzle({ id: 'demo-puzzle-1' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  await user.click(screen.getByText('Rätsel überspringen (Demo)'))
  expect(mockOnComplete).toHaveBeenCalledOnce()
 })

 it('should show error message on failed answer validation', async () => {
  const user = userEvent.setup()
  mockFetch.mockResolvedValue({
   ok: true,
   json: () =>
    Promise.resolve({
     data: {
      isCorrect: false,
      pointsEarned: 0,
      timeBonusEarned: 0,
      feedback: {
       messageDe: 'Leider falsch',
       messageEn: 'Incorrect',
      },
     },
     error: null,
    }),
  })

  const puzzle = createPuzzle({ puzzleType: 'text_analysis' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )

  await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'wrong')
  await user.click(screen.getByRole('button', { name: 'Antwort einreichen' }))

  await waitFor(() => {
   expect(screen.getByText('Leider falsch')).toBeInTheDocument()
  })
 })

 it('should show attempt counter after wrong answer', async () => {
  const user = userEvent.setup()
  mockFetch.mockResolvedValue({
   ok: true,
   json: () =>
    Promise.resolve({
     data: {
      isCorrect: false,
      pointsEarned: 0,
      timeBonusEarned: 0,
      feedback: { messageDe: 'Falsch', messageEn: 'Wrong' },
     },
     error: null,
    }),
  })

  const puzzle = createPuzzle({ puzzleType: 'text_analysis' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )

  await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'wrong')
  await user.click(screen.getByRole('button', { name: 'Antwort einreichen' }))

  await waitFor(() => {
   expect(screen.getByText(/Versuche.*1/)).toBeInTheDocument()
  })
 })

 it('should render puzzle image when imageUrl exists', () => {
  const puzzle = createPuzzle({
   imageUrl: 'https://example.com/puzzle-img.jpg',
  })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )
  const img = screen.getByAltText('Wie heißt der Kapitän?')
  expect(img).toHaveAttribute('src', 'https://example.com/puzzle-img.jpg')
 })

 it('should handle network error gracefully', async () => {
  const user = userEvent.setup()
  mockFetch.mockResolvedValue({ ok: false })

  const puzzle = createPuzzle({ puzzleType: 'text_analysis' })
  render(
   <PuzzleRenderer puzzle={puzzle} sessionId="s1" language="de" onComplete={mockOnComplete} />,
  )

  await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'test')
  await user.click(screen.getByRole('button', { name: 'Antwort einreichen' }))

  await waitFor(() => {
   expect(screen.getByText('Netzwerkfehler')).toBeInTheDocument()
  })
 })
})
