// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ARPuzzle } from '@/components/game/puzzles/ARPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

// Mock getUserMedia
const mockStop = vi.fn()
const mockGetUserMedia = vi.fn()

beforeEach(() => {
 mockStop.mockClear()
 mockGetUserMedia.mockClear()
 Object.defineProperty(navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
  configurable: true,
 })
})

describe('ARPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

 beforeEach(() => {
  mockOnSubmit.mockClear()
 })

 it('should render camera activate button in German', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Kamera aktivieren')).toBeInTheDocument()
 })

 it('should render camera activate button in English', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Activate camera')).toBeInTheDocument()
 })

 it('should show instruction text', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'ar_puzzle',
   instructionDe: 'Richten Sie die Kamera auf das Denkmal',
  })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Richten Sie die Kamera auf das Denkmal')).toBeInTheDocument()
 })

 it('should show English instruction when language is en', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'ar_puzzle',
   instructionDe: 'Richten Sie die Kamera',
   instructionEn: 'Point the camera at the target',
  })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Point the camera at the target')).toBeInTheDocument()
 })

 it('should show default instruction when none provided in German', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'ar_puzzle',
   instructionDe: null,
   instructionEn: null,
   arContent: null,
  })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(
   screen.getByText('Richten Sie die Kamera auf das Ziel und finden Sie die Antwort.'),
  ).toBeInTheDocument()
 })

 it('should show default instruction when none provided in English', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'ar_puzzle',
   instructionDe: null,
   instructionEn: null,
   arContent: null,
  })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(
   screen.getByText('Point the camera at the target and find the answer.'),
  ).toBeInTheDocument()
 })

 it('should show targetDescription from arContent when no instruction', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'ar_puzzle',
   instructionDe: null,
   instructionEn: null,
   arContent: { targetDescription: 'Look for the lighthouse marker', overlayText: '', markerUrl: null },
  })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Look for the lighthouse marker')).toBeInTheDocument()
 })

 it('should render answer input with German placeholder', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeInTheDocument()
 })

 it('should render answer input with English placeholder', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument()
 })

 it('should disable submit when empty', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeDisabled()
 })

 it('should show German submit label', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Antwort prüfen' })).toBeInTheDocument()
 })

 it('should show English submit label', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Check answer' })).toBeInTheDocument()
 })

 it('should submit trimmed answer', async () => {
  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), ' 1878 ')
  await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))
  expect(mockOnSubmit).toHaveBeenCalledWith('1878')
 })

 it('should show German checking text when submitting', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Prüfe...')).toBeInTheDocument()
 })

 it('should show English checking text when submitting', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Checking...')).toBeInTheDocument()
 })

 it('should disable camera button when submitting', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  const cameraBtn = screen.getByText('Kamera aktivieren').closest('button')
  expect(cameraBtn).toBeDisabled()
 })

 it('should disable answer input when submitting', () => {
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByPlaceholderText('Ihre Antwort eingeben...')).toBeDisabled()
 })

 it('should activate camera on button click', async () => {
  const mockStream = {
   getTracks: () => [{ stop: mockStop }],
  }
  mockGetUserMedia.mockResolvedValue(mockStream)

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  await user.click(screen.getByText('Kamera aktivieren'))

  await waitFor(() => {
   expect(mockGetUserMedia).toHaveBeenCalledWith({
    video: { facingMode: 'environment' },
   })
  })

  // Camera close button should appear
  await waitFor(() => {
   expect(screen.getByLabelText('Kamera schließen')).toBeInTheDocument()
  })
 })

 it('should show camera error when getUserMedia fails in German', async () => {
  mockGetUserMedia.mockRejectedValue(new Error('Permission denied'))

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  await user.click(screen.getByText('Kamera aktivieren'))

  await waitFor(() => {
   expect(
    screen.getByText('Kamera konnte nicht gestartet werden. Bitte erlauben Sie den Zugriff.'),
   ).toBeInTheDocument()
  })
 })

 it('should show camera error when getUserMedia fails in English', async () => {
  mockGetUserMedia.mockRejectedValue(new Error('Permission denied'))

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  await user.click(screen.getByText('Activate camera'))

  await waitFor(() => {
   expect(
    screen.getByText('Could not start camera. Please allow access.'),
   ).toBeInTheDocument()
  })
 })

 it('should stop camera when close button clicked', async () => {
  const mockStream = {
   getTracks: () => [{ stop: mockStop }],
  }
  mockGetUserMedia.mockResolvedValue(mockStream)

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  // Activate camera
  await user.click(screen.getByText('Kamera aktivieren'))

  await waitFor(() => {
   expect(screen.getByLabelText('Kamera schließen')).toBeInTheDocument()
  })

  // Close camera
  await user.click(screen.getByLabelText('Kamera schließen'))

  expect(mockStop).toHaveBeenCalled()
  // Camera activate button should be back
  await waitFor(() => {
   expect(screen.getByText('Kamera aktivieren')).toBeInTheDocument()
  })
 })

 it('should show overlay text when arContent has overlayText', async () => {
  const mockStream = {
   getTracks: () => [{ stop: mockStop }],
  }
  mockGetUserMedia.mockResolvedValue(mockStream)

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({
   puzzleType: 'ar_puzzle',
   arContent: { overlayText: 'Scan the QR code', targetDescription: '', markerUrl: null },
  })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  await user.click(screen.getByText('Kamera aktivieren'))

  await waitFor(() => {
   expect(screen.getByText('Scan the QR code')).toBeInTheDocument()
  })
 })

 it('should show English close camera label', async () => {
  const mockStream = {
   getTracks: () => [{ stop: mockStop }],
  }
  mockGetUserMedia.mockResolvedValue(mockStream)

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  await user.click(screen.getByText('Activate camera'))

  await waitFor(() => {
   expect(screen.getByLabelText('Close camera')).toBeInTheDocument()
  })
 })

 it('should stop camera and submit when answer submitted with active camera', async () => {
  const mockStream = {
   getTracks: () => [{ stop: mockStop }],
  }
  mockGetUserMedia.mockResolvedValue(mockStream)

  const user = userEvent.setup()
  const puzzle = createMockPuzzle({ puzzleType: 'ar_puzzle' })
  render(
   <ARPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )

  // Activate camera first
  await user.click(screen.getByText('Kamera aktivieren'))
  await waitFor(() => {
   expect(screen.getByLabelText('Kamera schließen')).toBeInTheDocument()
  })

  // Now type answer and submit
  await user.type(screen.getByPlaceholderText('Ihre Antwort eingeben...'), 'answer')
  await user.click(screen.getByRole('button', { name: 'Antwort prüfen' }))

  // Should have stopped camera and submitted
  expect(mockStop).toHaveBeenCalled()
  expect(mockOnSubmit).toHaveBeenCalledWith('answer')
 })
})
