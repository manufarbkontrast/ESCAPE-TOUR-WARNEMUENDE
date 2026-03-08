import { test, expect } from '@playwright/test'

test.describe('Game completion page', () => {
  test('should display certificate for demo session', async ({ page }) => {
    await page.goto('/play/demo-session-001/complete')

    await expect(page.getByText('Geschafft!')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Gold-Abzeichen')).toBeVisible()
  })

  test('should display certificate card with team info', async ({ page }) => {
    await page.goto('/play/demo-session-001/complete')

    await expect(page.getByText('Geschafft!')).toBeVisible({ timeout: 10_000 })

    await expect(page.getByText('Zertifikat')).toBeVisible()
    await expect(page.getByText('Demo Team')).toBeVisible()
    await expect(
      page.getByText('Das Vermaechtnis des Lotsenkapitaens'),
    ).toBeVisible()
    await expect(page.getByText('DEMO-2026-GOLD')).toBeVisible()
  })

  test('should display stats grid', async ({ page }) => {
    await page.goto('/play/demo-session-001/complete')

    await expect(page.getByText('Geschafft!')).toBeVisible({ timeout: 10_000 })

    // Stats - use exact matching to avoid strict mode violations
    await expect(page.getByText('750')).toBeVisible() // total points
    await expect(page.getByText('55 min')).toBeVisible() // play time

    // Use labels to find stats reliably
    await expect(page.getByText('Punkte')).toBeVisible()
    await expect(page.getByText('Spielzeit')).toBeVisible()
    await expect(page.getByText('Stationen')).toBeVisible()
    await expect(page.getByText('Hinweise')).toBeVisible()
  })

  test('should display action buttons', async ({ page }) => {
    await page.goto('/play/demo-session-001/complete')

    await expect(page.getByText('Geschafft!')).toBeVisible({ timeout: 10_000 })

    await expect(
      page.getByRole('button', { name: /Ergebnis teilen/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Startseite/i }),
    ).toBeVisible()
  })

  test('should navigate to home when clicking back button', async ({ page }) => {
    await page.goto('/play/demo-session-001/complete')

    await expect(page.getByText('Geschafft!')).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: /Startseite/i }).click()
    await page.waitForURL('/', { timeout: 5_000 })
  })

  test('should show error for non-existent session certificate', async ({ page }) => {
    await page.goto('/play/invalid-session-999/complete')

    // Should show error state (network error since Supabase is not configured)
    await expect(
      page.getByText(/Netzwerkfehler|Fehler|Error|nicht geladen/i),
    ).toBeVisible({ timeout: 15_000 })

    await expect(
      page.getByRole('button', { name: /Startseite/i }),
    ).toBeVisible()
  })
})
