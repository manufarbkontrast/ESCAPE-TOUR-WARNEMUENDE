interface RateLimitConfig {
  readonly windowMs: number
  readonly maxRequests: number
}

interface RateLimitResult {
  readonly allowed: boolean
  readonly retryAfterMs: number
}

const CLEANUP_INTERVAL_MS = 60_000

export function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, number[]>()

  const cleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of store) {
      const valid = timestamps.filter((t) => now - t < config.windowMs)
      if (valid.length === 0) {
        store.delete(key)
      } else {
        store.set(key, valid)
      }
    }
  }, CLEANUP_INTERVAL_MS)

  // Allow GC to collect the timer if the limiter is no longer referenced
  if (cleanup.unref) {
    cleanup.unref()
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now()
      const timestamps = (store.get(key) ?? []).filter(
        (t) => now - t < config.windowMs,
      )

      if (timestamps.length >= config.maxRequests) {
        const oldestInWindow = timestamps[0]!
        const retryAfterMs = config.windowMs - (now - oldestInWindow)
        store.set(key, timestamps)
        return { allowed: false, retryAfterMs }
      }

      timestamps.push(now)
      store.set(key, timestamps)
      return { allowed: true, retryAfterMs: 0 }
    },

    reset(key: string): void {
      store.delete(key)
    },
  }
}
