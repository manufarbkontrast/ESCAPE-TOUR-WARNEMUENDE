// @vitest-environment jsdom
/**
 * Tests for the screen wake lock.
 *
 * The iPad has to stay awake for a two- to four-hour walk. This hook is the
 * only thing keeping it on, so its acquire/release bookkeeping matters.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWakeLock } from '@/hooks/useWakeLock'

interface FakeSentinel {
  released: boolean
  release: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
}

let requestMock: ReturnType<typeof vi.fn>
let sentinels: FakeSentinel[]

function createSentinel(): FakeSentinel {
  const sentinel: FakeSentinel = {
    released: false,
    release: vi.fn(async () => {
      sentinel.released = true
    }),
    addEventListener: vi.fn(),
  }
  sentinels.push(sentinel)
  return sentinel
}

beforeEach(() => {
  sentinels = []
  requestMock = vi.fn(async () => createSentinel())
  Object.defineProperty(navigator, 'wakeLock', {
    value: { request: requestMock },
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useWakeLock', () => {
  it('should request a screen lock when enabled', async () => {
    const { result } = renderHook(() => useWakeLock(true))

    await waitFor(() => expect(result.current.isActive).toBe(true))
    expect(requestMock).toHaveBeenCalledWith('screen')
  })

  it('should not request anything while disabled', async () => {
    // This was the actual bug: sessions stayed 'pending', so the layout
    // always passed false and the display kept sleeping mid-tour.
    const { result } = renderHook(() => useWakeLock(false))

    await waitFor(() => expect(result.current.isActive).toBe(false))
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('should acquire once the session becomes active', async () => {
    const { result, rerender } = renderHook(({ on }) => useWakeLock(on), {
      initialProps: { on: false },
    })

    expect(requestMock).not.toHaveBeenCalled()

    rerender({ on: true })

    await waitFor(() => expect(result.current.isActive).toBe(true))
  })

  it('should release the lock on unmount', async () => {
    const { result, unmount } = renderHook(() => useWakeLock(true))
    await waitFor(() => expect(result.current.isActive).toBe(true))

    unmount()

    await waitFor(() => expect(sentinels[0].release).toHaveBeenCalled())
  })

  it('should not stack sentinels when the tab becomes visible again', async () => {
    // Returning to the app fired acquire() again and overwrote the ref without
    // releasing it. Over a long tour with app switches that abandons locks.
    const { result } = renderHook(() => useWakeLock(true))
    await waitFor(() => expect(result.current.isActive).toBe(true))

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(requestMock).toHaveBeenCalledTimes(1)
    expect(sentinels).toHaveLength(1)
  })

  it('should re-acquire when the browser released the lock while hidden', async () => {
    const { result } = renderHook(() => useWakeLock(true))
    await waitFor(() => expect(result.current.isActive).toBe(true))

    // iOS releases the lock when the app goes to the background.
    sentinels[0].released = true

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await waitFor(() => expect(requestMock).toHaveBeenCalledTimes(2))
  })

  it('should report unsupported browsers instead of throwing', async () => {
    // The hook checks `'wakeLock' in navigator`, so the property has to be
    // gone — setting it to undefined would still count as supported.
    Reflect.deleteProperty(navigator, 'wakeLock')

    const { result } = renderHook(() => useWakeLock(true))

    expect(result.current.isSupported).toBe(false)
    expect(result.current.isActive).toBe(false)
  })

  it('should survive a rejected request', async () => {
    requestMock.mockRejectedValue(new Error('NotAllowedError'))

    const { result } = renderHook(() => useWakeLock(true))

    await waitFor(() => expect(result.current.isActive).toBe(false))
  })
})
