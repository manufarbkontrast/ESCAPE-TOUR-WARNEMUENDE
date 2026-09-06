// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'

// Mock the useOnlineStatus hook
const mockIsOnline = vi.hoisted(() => ({ current: true }))

vi.mock('@/lib/hooks/useOnlineStatus', () => ({
 useOnlineStatus: () => ({
  isOnline: mockIsOnline.current,
 }),
}))

describe('OfflineIndicator', () => {
 it('should render nothing when online', () => {
  mockIsOnline.current = true
  const { container } = render(<OfflineIndicator />)
  expect(container.innerHTML).toBe('')
 })

 it('should render banner when offline', () => {
  mockIsOnline.current = false
  render(<OfflineIndicator />)
  expect(screen.getByRole('status')).toBeInTheDocument()
 })

 it('should show offline message', () => {
  mockIsOnline.current = false
  render(<OfflineIndicator />)
  expect(screen.getByText(/offline/i)).toBeInTheDocument()
 })

 it('should have aria-live assertive', () => {
  mockIsOnline.current = false
  render(<OfflineIndicator />)
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
 })

 it('should not promise that data is stored locally', () => {
  // Nothing ever fills the offline queue — queueAction() has no callers, and
  // the endpoints it would sync to do not exist. Telling a team their answers
  // are safe is simply untrue.
  mockIsOnline.current = false
  render(<OfflineIndicator />)

  const banner = screen.getByRole('status')
  expect(banner.textContent).not.toMatch(/lokal gespeichert/i)
  expect(banner.textContent).not.toMatch(/warten/i)
 })

 it('should say what actually happens while offline', () => {
  mockIsOnline.current = false
  render(<OfflineIndicator />)

  // The team needs to know why the submit button does nothing.
  expect(screen.getByRole('status').textContent).toMatch(/Verbindung/i)
 })

 it('should not poll storage while offline', async () => {
  // The old version queried IndexedDB every two seconds for a count that was
  // always zero — pure battery drain on a four-hour tour.
  mockIsOnline.current = false
  const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

  render(<OfflineIndicator />)

  expect(setIntervalSpy).not.toHaveBeenCalled()
  setIntervalSpy.mockRestore()
 })
})
