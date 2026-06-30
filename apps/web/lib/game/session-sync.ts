/**
 * Server sync for game session progress.
 * Persists station progress and completion via PATCH /api/game/session
 * so progress survives device switches and the certificate endpoint
 * (which requires status='completed') works for real sessions.
 */

import type { SessionStatus } from '@escape-tour/shared'

export interface SessionSyncUpdates {
  readonly status?: SessionStatus
  readonly currentStationIndex?: number
}

export interface SessionSyncOptions {
  readonly retryDelayMs?: number
}

export type SessionSyncResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string }

// Demo ('demo-session-001') and staff ('staff-…') sessions are local-only;
// the PATCH endpoint only persists real UUID sessions.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DEFAULT_RETRY_DELAY_MS = 1_000

const delay = (ms: number) =>
  ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve()

async function patchSession(
  sessionId: string,
  updates: SessionSyncUpdates,
): Promise<SessionSyncResult & { readonly retryable?: boolean }> {
  try {
    const response = await fetch('/api/game/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, ...updates }),
    })

    if (response.ok) {
      return { ok: true }
    }

    return {
      ok: false,
      error: `Session sync failed with status ${response.status}`,
      retryable: response.status >= 500,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Session sync failed',
      retryable: true,
    }
  }
}

/**
 * Persist session updates to the server. Retries once on network/5xx errors.
 * No-op (success) for demo/staff sessions, which live in localStorage only.
 */
export async function syncSessionProgress(
  sessionId: string,
  updates: SessionSyncUpdates,
  options?: SessionSyncOptions,
): Promise<SessionSyncResult> {
  if (!UUID_REGEX.test(sessionId)) {
    return { ok: true }
  }

  const first = await patchSession(sessionId, updates)
  if (first.ok || !first.retryable) {
    return first.ok ? { ok: true } : { ok: false, error: first.error }
  }

  await delay(options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS)

  const second = await patchSession(sessionId, updates)
  return second.ok ? { ok: true } : { ok: false, error: second.error }
}
