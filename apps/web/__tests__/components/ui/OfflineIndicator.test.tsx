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
})
