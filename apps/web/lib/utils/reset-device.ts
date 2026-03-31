import { STAFF_TOKEN_STORAGE_KEY } from './staff-token'

interface ResetOptions {
  readonly preserveStaffToken?: boolean
}

export async function resetDevice(options?: ResetOptions): Promise<void> {
  const preserveStaffToken = options?.preserveStaffToken ?? false

  // Save staff token if needed
  let staffData: string | null = null
  if (preserveStaffToken) {
    staffData = localStorage.getItem(STAFF_TOKEN_STORAGE_KEY)
  }

  // Clear session cookie via API
  try {
    await fetch('/api/game/reset-device', { method: 'POST' })
  } catch {
    // Continue even if API call fails
  }

  // Clear all client storage
  localStorage.clear()
  sessionStorage.clear()

  // Restore staff token if preserved
  if (preserveStaffToken && staffData) {
    localStorage.setItem(STAFF_TOKEN_STORAGE_KEY, staffData)
  }

  // Unregister service workers
  try {
    const registrations = await navigator.serviceWorker?.getRegistrations()
    for (const reg of registrations ?? []) {
      await reg.unregister()
    }
  } catch {
    // SW not supported or failed
  }

  // Clear all caches
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  } catch {
    // Cache API not supported
  }

  // Hard navigate to staff page
  window.location.href = '/staff'
}
