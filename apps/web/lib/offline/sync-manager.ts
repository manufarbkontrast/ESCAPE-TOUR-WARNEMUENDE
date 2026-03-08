'use client'

import { OFFLINE_DB_NAME, OFFLINE_DB_VERSION, OFFLINE_MAX_RETRIES } from '@escape-tour/shared'

interface PendingAction {
  readonly id: string
  readonly type: 'puzzle_attempt' | 'station_progress' | 'session_update'
  readonly data: Record<string, unknown>
  readonly timestamp: number
  readonly retryCount: number
}

interface CachedData {
  readonly type: string
  readonly data: unknown
  readonly lastUpdated: number
}

/**
 * Manages offline data storage and sync using IndexedDB.
 * Queues actions when offline and syncs when back online.
 */
class OfflineSyncManager {
  private db: IDBDatabase | null = null
  private syncInProgress = false
  private initialized = false

  async init(): Promise<void> {
    if (this.initialized) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('cachedData')) {
          db.createObjectStore('cachedData', { keyPath: 'type' })
        }
      }

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        window.addEventListener('online', () => {
          void this.syncPendingActions()
        })
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }
    })
  }

  async queueAction(
    type: PendingAction['type'],
    data: Record<string, unknown>,
  ): Promise<string> {
    if (!this.db) await this.init()

    const action: PendingAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingActions', 'readwrite')
      const store = tx.objectStore('pendingActions')
      const request = store.put(action)

      request.onsuccess = () => {
        if (navigator.onLine) {
          void this.syncPendingActions()
        }
        resolve(action.id)
      }

      request.onerror = () => reject(new Error('Failed to queue action'))
    })
  }

  async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine || !this.db) return

    this.syncInProgress = true

    try {
      const actions = await this.getAllPendingActions()

      for (const action of actions) {
        try {
          const response = await fetch(`/api/game/${action.type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.data),
          })

          if (response.ok) {
            await this.deleteAction(action.id)
          } else if (action.retryCount >= OFFLINE_MAX_RETRIES) {
            await this.deleteAction(action.id)
            console.error('Offline action failed after max retries:', action.id)
          } else {
            await this.updateRetryCount(action)
          }
        } catch (error) {
          // Network error — increment retry count so it's retried later
          console.error('Sync error for action:', action.id, error)
          if (action.retryCount >= OFFLINE_MAX_RETRIES) {
            await this.deleteAction(action.id)
          } else {
            await this.updateRetryCount(action)
          }
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async cacheGameData(tourId: string): Promise<boolean> {
    if (!this.db) await this.init()

    try {
      const [tourRes, stationsRes, puzzlesRes, hintsRes] = await Promise.all([
        fetch(`/api/game/tour/${tourId}`),
        fetch(`/api/game/tour/${tourId}/stations`),
        fetch(`/api/game/tour/${tourId}/puzzles`),
        fetch(`/api/game/tour/${tourId}/hints`),
      ])

      const responses = [tourRes, stationsRes, puzzlesRes, hintsRes]
      const failedResponse = responses.find((r) => !r.ok)
      if (failedResponse) {
        throw new Error(`Failed to fetch game data (status ${failedResponse.status})`)
      }

      const [tour, stations, puzzles, hints] = await Promise.all([
        tourRes.json(),
        stationsRes.json(),
        puzzlesRes.json(),
        hintsRes.json(),
      ])

      await Promise.all([
        this.putCachedData('tour', tour),
        this.putCachedData('stations', stations),
        this.putCachedData('puzzles', puzzles),
        this.putCachedData('hints', hints),
      ])

      return true
    } catch (error) {
      console.error('Failed to cache game data:', error)
      return false
    }
  }

  async getCachedData(type: string): Promise<unknown | null> {
    if (!this.db) await this.init()

    return new Promise((resolve) => {
      const tx = this.db!.transaction('cachedData', 'readonly')
      const store = tx.objectStore('cachedData')
      const request = store.get(type)

      request.onsuccess = () => resolve(request.result?.data ?? null)
      request.onerror = () => resolve(null)
    })
  }

  async hasPendingActions(): Promise<boolean> {
    const actions = await this.getAllPendingActions()
    return actions.length > 0
  }

  async getPendingCount(): Promise<number> {
    const actions = await this.getAllPendingActions()
    return actions.length
  }

  private getAllPendingActions(): Promise<readonly PendingAction[]> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve([])
        return
      }
      const tx = this.db.transaction('pendingActions', 'readonly')
      const store = tx.objectStore('pendingActions')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result ?? [])
      request.onerror = () => resolve([])
    })
  }

  private deleteAction(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingActions', 'readwrite')
      const store = tx.objectStore('pendingActions')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete action'))
    })
  }

  private updateRetryCount(action: PendingAction): Promise<void> {
    const updated: PendingAction = {
      ...action,
      retryCount: action.retryCount + 1,
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingActions', 'readwrite')
      const store = tx.objectStore('pendingActions')
      const request = store.put(updated)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to update retry count'))
    })
  }

  private putCachedData(type: string, data: unknown): Promise<void> {
    const cached: CachedData = { type, data, lastUpdated: Date.now() }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('cachedData', 'readwrite')
      const store = tx.objectStore('cachedData')
      const request = store.put(cached)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to cache data'))
    })
  }
}

export const offlineSync = new OfflineSyncManager()
