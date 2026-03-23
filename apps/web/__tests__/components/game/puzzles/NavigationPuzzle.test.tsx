// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavigationPuzzle } from '@/components/game/puzzles/NavigationPuzzle'
import { createMockPuzzle } from '@/__tests__/helpers/mock-puzzle'

// Mock the locationStore
const mockLocationState = vi.hoisted(() => ({
 current: {
  userLocation: null as { lat: number; lng: number; accuracy: number; timestamp: number } | null,
  isTracking: false,
  error: null as string | null,
 },
}))

const mockStartWatching = vi.fn()
const mockStopWatching = vi.fn()
const mockSetLocation = vi.fn()

vi.mock('@/stores/locationStore', () => ({
 useLocationStore: () => ({
  ...mockLocationState.current,
  startWatching: mockStartWatching,
  stopWatching: mockStopWatching,
  setLocation: mockSetLocation,
 }),
}))

describe('NavigationPuzzle', () => {
 const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

 beforeEach(() => {
  mockOnSubmit.mockClear()
  mockStartWatching.mockClear()
  mockStopWatching.mockClear()
  mockSetLocation.mockClear()
  mockLocationState.current = {
   userLocation: null,
   isTracking: false,
   error: null,
  }
 })

 it('should show no-target message when targetLocation is null', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: null,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Kein Zielort definiert.')).toBeInTheDocument()
 })

 it('should show English no-target message', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: null,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('No target location defined.')).toBeInTheDocument()
 })

 it('should show instruction text when provided', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
   instructionDe: 'Gehen Sie zum Leuchtturm',
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Gehen Sie zum Leuchtturm')).toBeInTheDocument()
 })

 it('should show getting location text when tracking without position', () => {
  mockLocationState.current = {
   userLocation: null,
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Position wird ermittelt...')).toBeInTheDocument()
 })

 it('should show English getting location text', () => {
  mockLocationState.current = {
   userLocation: null,
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Getting location...')).toBeInTheDocument()
 })

 it('should show distance when user has location', () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 10, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.18, lng: 12.08 },
   targetRadiusMeters: 20,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  // Distance should be displayed (about 1.1 km)
  expect(screen.getByText('Entfernung zum Ziel')).toBeInTheDocument()
 })

 it('should show arrival message when within radius', () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 5, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
   targetRadiusMeters: 50,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Sie sind am Ziel!')).toBeInTheDocument()
 })

 it('should show English arrival message', () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 5, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
   targetRadiusMeters: 50,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('You have arrived!')).toBeInTheDocument()
 })

 it('should show accuracy indicator when user has location', () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 15, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText(/Genauigkeit.*15 m/)).toBeInTheDocument()
 })

 it('should disable arrival button when not within radius and not demo', () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 10, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.18, lng: 12.08 },
   targetRadiusMeters: 20,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Ich bin da!' })).toBeDisabled()
 })

 it('should enable arrival button when within radius', async () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 5, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
   targetRadiusMeters: 50,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByRole('button', { name: 'Ich bin da!' })).toBeEnabled()
 })

 it('should call onSubmit with user coordinates when arrival button clicked', async () => {
  const user = userEvent.setup()
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 5, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
   targetRadiusMeters: 50,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  await user.click(screen.getByRole('button', { name: 'Ich bin da!' }))
  expect(mockOnSubmit).toHaveBeenCalledWith({ lat: 54.17, lng: 12.08 })
 })

 it('should show checking text when submitting', () => {
  mockLocationState.current = {
   userLocation: { lat: 54.17, lng: 12.08, accuracy: 5, timestamp: Date.now() },
   isTracking: true,
   error: null,
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
   targetRadiusMeters: 50,
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={true} />,
  )
  expect(screen.getByText('Prüfe...')).toBeInTheDocument()
 })

 it('should show demo mode indicator', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} isDemo={true} />,
  )
  expect(screen.getByText('Demo-Modus: GPS simuliert')).toBeInTheDocument()
 })

 it('should show English demo mode indicator', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="en" onSubmit={mockOnSubmit} isSubmitting={false} isDemo={true} />,
  )
  expect(screen.getByText('Demo mode: GPS simulated')).toBeInTheDocument()
 })

 it('should show location error when present', () => {
  mockLocationState.current = {
   userLocation: null,
   isTracking: false,
   error: 'Location permission denied',
  }
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(screen.getByText('Location permission denied')).toBeInTheDocument()
 })

 it('should start watching on mount', () => {
  const puzzle = createMockPuzzle({
   puzzleType: 'navigation',
   targetLocation: { lat: 54.17, lng: 12.08 },
  })
  render(
   <NavigationPuzzle puzzle={puzzle} language="de" onSubmit={mockOnSubmit} isSubmitting={false} />,
  )
  expect(mockStartWatching).toHaveBeenCalled()
 })
})
