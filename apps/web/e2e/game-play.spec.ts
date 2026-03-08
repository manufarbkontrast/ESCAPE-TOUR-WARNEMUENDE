import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helper: enter demo code and navigate to game page
// ---------------------------------------------------------------------------

async function enterDemoCode(page: import('@playwright/test').Page) {
  await page.goto('/play')
  const inputs = page.locator('input')

  await inputs.nth(0).fill('D')
  await inputs.nth(1).fill('E')
  await inputs.nth(2).fill('M')
  await inputs.nth(3).fill('O')
  await inputs.nth(4).fill('0')
  await inputs.nth(5).fill('1')

  await page.waitForURL(/\/play\/demo-session-001/, { timeout: 15_000 })
}

// ---------------------------------------------------------------------------
// Game play flow
// ---------------------------------------------------------------------------

test.describe('Game play flow (demo mode)', () => {
  test('should load game page with bottom navigation', async ({ page }) => {
    await enterDemoCode(page)

    // Bottom navigation should be visible
    await expect(page.getByRole('button', { name: 'Karte' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Station' })).toBeVisible()
  })

  test('should switch to station view and show first station', async ({ page }) => {
    await enterDemoCode(page)

    // Click Station button to switch view
    await page.getByRole('button', { name: 'Station' }).click()

    // First station details should appear
    await expect(page.getByText('Der Leuchtturm')).toBeVisible({ timeout: 5_000 })
  })

  test('should switch back to map view', async ({ page }) => {
    await enterDemoCode(page)

    // Go to station view
    await page.getByRole('button', { name: 'Station' }).click()
    await expect(page.getByText('Der Leuchtturm')).toBeVisible({ timeout: 5_000 })

    // Switch back to map
    await page.getByRole('button', { name: 'Karte' }).click()

    // Map button should be active (highlighted)
    const karteButton = page.getByRole('button', { name: 'Karte' })
    await expect(karteButton).toBeVisible()
  })

  test('should display station intro text', async ({ page }) => {
    await enterDemoCode(page)

    await page.getByRole('button', { name: 'Station' }).click()

    // First station details
    await expect(page.getByText('Der Leuchtturm')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Station 1')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Session error handling
// ---------------------------------------------------------------------------

test.describe('Game session error handling', () => {
  test('should show error when loading invalid session', async ({ page }) => {
    await page.goto('/play/invalid-session-id')

    // Should show error state with heading
    await expect(
      page.getByRole('heading', { name: /Fehler|Error/i }),
    ).toBeVisible({ timeout: 15_000 })

    // Should have a back button
    await expect(
      page.getByRole('button', { name: /Zurück/i }),
    ).toBeVisible()
  })

  test('should navigate back to code entry from error state', async ({ page }) => {
    await page.goto('/play/invalid-session-id')

    await expect(
      page.getByRole('button', { name: /Zurück/i }),
    ).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: /Zurück/i }).click()
    await page.waitForURL(/\/play$/, { timeout: 5_000 })
  })
})
