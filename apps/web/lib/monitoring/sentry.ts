import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

let initialized = false

export function initSentry(): void {
  if (initialized || !SENTRY_DSN) return

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    enabled: process.env.NODE_ENV === 'production',
  })

  initialized = true
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_DSN) {
    console.error('[Sentry disabled]', error)
    return
  }

  Sentry.captureException(error, { extra: context })
}

export function setUser(id: string, email?: string): void {
  Sentry.setUser({ id, email })
}

export function clearUser(): void {
  Sentry.setUser(null)
}
