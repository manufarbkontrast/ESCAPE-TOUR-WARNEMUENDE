import { test, expect } from '@playwright/test'

test.describe('Booking code entry flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play')
  })

  test('should display code entry page with title and input', async ({ page }) => {
    await expect(page.getByText('Escape Tour starten')).toBeVisible()
    await expect(
      page.getByText('Buchungscode', { exact: true }),
    ).toBeVisible()

    // 6 input fields should exist
    const inputs = page.locator('input')
    await expect(inputs).toHaveCount(6)
  })

  test('should accept DEMO01 code and redirect to game session', async ({ page }) => {
    const inputs = page.locator('input')

    await inputs.nth(0).fill('D')
    await inputs.nth(1).fill('E')
    await inputs.nth(2).fill('M')
    await inputs.nth(3).fill('O')
    await inputs.nth(4).fill('0')
    await inputs.nth(5).fill('1')

    // Should redirect to game page
    await page.waitForURL(/\/play\/demo-session-001/, { timeout: 10_000 })
    expect(page.url()).toContain('/play/demo-session-001')
  })

  test('should show error for invalid booking code', async ({ page }) => {
    const inputs = page.locator('input')

    await inputs.nth(0).fill('X')
    await inputs.nth(1).fill('X')
    await inputs.nth(2).fill('X')
    await inputs.nth(3).fill('X')
    await inputs.nth(4).fill('X')
    await inputs.nth(5).fill('X')

    // Should show an error message (could be invalid code or server error depending on Supabase)
    await expect(
      page.getByText(/Ungültiger Buchungscode|Serverfehler|Server error/),
    ).toBeVisible({ timeout: 15_000 })

    // Should stay on the play page
    expect(page.url()).toMatch(/\/play\/?$/)
  })

  test('should auto-focus next input on character entry', async ({ page }) => {
    const inputs = page.locator('input')

    await inputs.nth(0).click()
    await page.keyboard.type('D')

    // Second input should now be focused
    await expect(inputs.nth(1)).toBeFocused()
  })
})
