import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRateLimiter } from '@/lib/utils/rate-limit'

describe('rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow requests within the limit', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 })

    expect(limiter.check('key1').allowed).toBe(true)
    expect(limiter.check('key1').allowed).toBe(true)
    expect(limiter.check('key1').allowed).toBe(true)
  })

  it('should block requests exceeding the limit', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 2 })

    limiter.check('key1')
    limiter.check('key1')
    const result = limiter.check('key1')

    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('should allow requests after the window expires', () => {
    const limiter = createRateLimiter({ windowMs: 1_000, maxRequests: 1 })

    limiter.check('key1')
    expect(limiter.check('key1').allowed).toBe(false)

    vi.advanceTimersByTime(1_001)
    expect(limiter.check('key1').allowed).toBe(true)
  })

  it('should track different keys independently', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 1 })

    limiter.check('key1')
    expect(limiter.check('key1').allowed).toBe(false)
    expect(limiter.check('key2').allowed).toBe(true)
  })

  it('should reset a specific key', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 1 })

    limiter.check('key1')
    expect(limiter.check('key1').allowed).toBe(false)

    limiter.reset('key1')
    expect(limiter.check('key1').allowed).toBe(true)
  })

  it('should return correct retryAfterMs', () => {
    const limiter = createRateLimiter({ windowMs: 10_000, maxRequests: 1 })

    limiter.check('key1')
    vi.advanceTimersByTime(3_000)

    const result = limiter.check('key1')
    expect(result.allowed).toBe(false)
    // Window is 10s, 3s elapsed, so ~7s remaining
    expect(result.retryAfterMs).toBeGreaterThanOrEqual(6_900)
    expect(result.retryAfterMs).toBeLessThanOrEqual(7_100)
  })
})
