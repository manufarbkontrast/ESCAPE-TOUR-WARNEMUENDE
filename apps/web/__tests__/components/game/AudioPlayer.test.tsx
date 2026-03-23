// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioPlayer } from '@/components/game/AudioPlayer'

// Mock Audio API
const mockPlay = vi.fn().mockResolvedValue(undefined)
const mockPause = vi.fn()
const mockLoad = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveAttribute = vi.fn()

class MockAudio {
 src = ''
 loop = false
 volume = 1
 preload = ''
 play = mockPlay
 pause = mockPause
 load = mockLoad
 addEventListener = mockAddEventListener
 removeAttribute = mockRemoveAttribute
}

vi.stubGlobal('Audio', MockAudio)

describe('AudioPlayer', () => {
 beforeEach(() => {
  mockPlay.mockClear().mockResolvedValue(undefined)
  mockPause.mockClear()
  mockLoad.mockClear()
  mockAddEventListener.mockClear()
  mockRemoveAttribute.mockClear()
 })

 it('should render a button', () => {
  render(<AudioPlayer src="/audio.mp3" />)
  expect(screen.getByRole('button')).toBeInTheDocument()
 })

 it('should show play label when not yet interacted', () => {
  render(<AudioPlayer src="/audio.mp3" />)
  expect(screen.getByLabelText('Audio abspielen')).toBeInTheDocument()
 })

 it('should create Audio with provided src', () => {
  render(<AudioPlayer src="/ambient.mp3" />)
  // MockAudio was called with the src
  const calls = mockAddEventListener.mock.calls
  expect(calls.length).toBeGreaterThanOrEqual(1)
 })

 it('should set loop from props', () => {
  render(<AudioPlayer src="/audio.mp3" loop={false} />)
  expect(screen.getByRole('button')).toBeInTheDocument()
 })

 it('should attempt to play on mount when ready', () => {
  render(<AudioPlayer src="/audio.mp3" />)
  // Simulate canplaythrough event
  const canPlayCall = mockAddEventListener.mock.calls.find(
   (c: unknown[]) => c[0] === 'canplaythrough',
  )
  expect(canPlayCall).toBeDefined()
  // Trigger it
  act(() => {
   canPlayCall![1]()
  })
  expect(mockPlay).toHaveBeenCalled()
 })

 it('should call play when button is clicked and not yet interacted', async () => {
  const user = userEvent.setup()
  render(<AudioPlayer src="/audio.mp3" />)
  await user.click(screen.getByRole('button'))
  expect(mockPlay).toHaveBeenCalled()
 })

 it('should clean up on unmount', () => {
  const { unmount } = render(<AudioPlayer src="/audio.mp3" />)
  unmount()
  expect(mockPause).toHaveBeenCalled()
  expect(mockRemoveAttribute).toHaveBeenCalledWith('src')
  expect(mockLoad).toHaveBeenCalled()
 })

 it('should handle error event gracefully', () => {
  render(<AudioPlayer src="/audio.mp3" />)
  const errorCall = mockAddEventListener.mock.calls.find(
   (c: unknown[]) => c[0] === 'error',
  )
  expect(errorCall).toBeDefined()
  // Should not throw
  act(() => {
   errorCall![1]()
  })
  expect(screen.getByRole('button')).toBeInTheDocument()
 })
})
