/**
 * Merges the locally persisted session with the copy the server returns.
 *
 * The play page used to overwrite the persisted session with the server's on
 * every load. For demo and staff sessions the server answers from a constant
 * with `currentStationIndex: 0`, so any reload — a tab discarded by iOS, a
 * supervisor hitting refresh — threw a team back to station one.
 *
 * Progress is monotonic: a station once reached, a point once earned and a
 * hint once spent never go away. Everything descriptive comes from the
 * server, which owns it.
 */

import type { GameSession, SessionStatus } from '@escape-tour/shared'

/** Terminal status — once a tour is finished, nothing reopens it. */
const COMPLETED: SessionStatus = 'completed'

/**
 * Statuses the client sets first and syncs afterwards — the server lags
 * behind until the PATCH lands.
 */
const CLIENT_OWNED: ReadonlySet<SessionStatus> = new Set<SessionStatus>(['active', 'paused'])

function earliest(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return new Date(a) <= new Date(b) ? a : b
}

function mergeStatus(local: SessionStatus, fetched: SessionStatus): SessionStatus {
  if (local === COMPLETED || fetched === COMPLETED) {
    return COMPLETED
  }

  // A pause is never synced — pauseSession() only touches the store, so the
  // server still reports 'active'. Taking the server's word would silently
  // resume a paused tour on reload.
  if (local === 'paused') {
    return 'paused'
  }

  // Falling back to the server's 'pending' would switch the wake lock off
  // again before the activation PATCH has landed.
  if (fetched === 'pending' && CLIENT_OWNED.has(local)) {
    return local
  }

  return fetched
}

/**
 * @param local   session from the persisted store, if any
 * @param fetched session as the API returned it
 */
export function mergeSession(local: GameSession | null, fetched: GameSession): GameSession {
  // A different session means a different booking — nothing to carry over.
  if (!local || local.id !== fetched.id) {
    return fetched
  }

  return {
    ...fetched,
    status: mergeStatus(local.status, fetched.status),
    currentStationIndex: Math.max(local.currentStationIndex, fetched.currentStationIndex),
    totalPoints: Math.max(local.totalPoints, fetched.totalPoints),
    hintsUsed: Math.max(local.hintsUsed, fetched.hintsUsed),
    puzzlesSkipped: Math.max(local.puzzlesSkipped, fetched.puzzlesSkipped),
    totalPauseSeconds: Math.max(local.totalPauseSeconds, fetched.totalPauseSeconds),
    // Keeping the earlier stamp stops the timer from restarting on reload.
    startedAt: earliest(local.startedAt, fetched.startedAt),
    completedAt: fetched.completedAt ?? local.completedAt,
    pausedAt: fetched.pausedAt ?? local.pausedAt,
  }
}
