import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

test.describe('Landing page', () => {
  test('should display hero section with CTA', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Entdeckt Warnemünde',
    )
    await expect(page.getByText('Das Vermächtnis des Lotsenkapitäns')).toBeVisible()

    // Hero CTA button (the one linking to #touren section)
    const ctaLink = page.getByRole('link', { name: 'Tour buchen' }).first()
    await expect(ctaLink).toBeVisible()
  })

  test('should display tour variant cards', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Familien-Tour').first()).toBeVisible()
    await expect(page.getByText('Erwachsenen-Tour').first()).toBeVisible()
    await expect(page.getByText('24,90€')).toBeVisible()
    await expect(page.getByText('29,90€')).toBeVisible()
  })

  test('should display "how it works" steps', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Buchen' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Starten' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Rätseln' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Entdecken' })).toBeVisible()
  })

  test('should display stats', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('2-4h')).toBeVisible()
    await expect(page.getByText('10+')).toBeVisible()
    await expect(page.getByText('3-5km')).toBeVisible()
  })

  test('should expand and collapse FAQ items', async ({ page }) => {
    await page.goto('/')

    const faqQuestion = page.getByText('Wie funktioniert die Escape Tour?')
    await expect(faqQuestion).toBeVisible()

    await faqQuestion.click()

    await expect(
      page.getByText('Ihr bucht online eure Tour und erhaltet einen Buchungscode'),
    ).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Tours page
// ---------------------------------------------------------------------------

test.describe('Tours page', () => {
  test('should display both tour variants with details', async ({ page }) => {
    await page.goto('/touren')

    await expect(
      page.getByRole('heading', { level: 1 }),
    ).toContainText('Touren')

    await expect(page.getByText('Familien-Tour').first()).toBeVisible()
    await expect(page.getByText('Erwachsenen-Tour').first()).toBeVisible()
  })

  test('should display route highlights', async ({ page }) => {
    await page.goto('/touren')

    await expect(page.getByText('Route Highlights').first()).toBeVisible()
    await expect(page.getByText('Leuchtturm').first()).toBeVisible()
  })

  test('should display feature cards', async ({ page }) => {
    await page.goto('/touren')

    await expect(page.getByRole('heading', { name: 'Live GPS-Navigation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '10 einzigartige Rätseltypen' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Offline-fähig' })).toBeVisible()
  })

  test('should have booking CTA links', async ({ page }) => {
    await page.goto('/touren')

    const bookingLinks = page.getByRole('link', { name: /buchen/i })
    await expect(bookingLinks.first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Pricing page
// ---------------------------------------------------------------------------

test.describe('Pricing page', () => {
  test('should display pricing cards for both variants', async ({ page }) => {
    await page.goto('/preise')

    await expect(
      page.getByRole('heading', { level: 1 }),
    ).toContainText('Preise')

    await expect(page.getByText('24,90€')).toBeVisible()
    await expect(page.getByText('29,90€')).toBeVisible()
  })

  test('should show group discounts', async ({ page }) => {
    await page.goto('/preise')

    await expect(page.getByText('Gruppenrabatt')).toBeVisible()
    await expect(page.getByText('10%')).toBeVisible()
    await expect(page.getByText('ab 6 Personen')).toBeVisible()
    await expect(page.getByText('15%')).toBeVisible()
    await expect(page.getByText('ab 10 Personen')).toBeVisible()
  })

  test('should display included items', async ({ page }) => {
    await page.goto('/preise')

    await expect(page.getByRole('heading', { name: 'GPS-Navigation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Alle Rätsel & Hinweise' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Teilnahmezertifikat' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Kostenlose Stornierung (24h)' })).toBeVisible()
  })

  test('should mark adult tour as popular', async ({ page }) => {
    await page.goto('/preise')

    await expect(page.getByText('Beliebteste Wahl')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Legal pages
// ---------------------------------------------------------------------------

test.describe('Legal pages', () => {
  test('should load impressum page', async ({ page }) => {
    await page.goto('/impressum')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Impressum')
  })

  test('should load datenschutz page', async ({ page }) => {
    await page.goto('/datenschutz')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Datenschutz')
  })

  test('should load AGB page', async ({ page }) => {
    await page.goto('/agb')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AGB')
  })
})

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe('Navigation', () => {
  test('should navigate to anchor sections via header links', async ({ page }) => {
    await page.goto('/')

    // Header nav links are anchors (#touren, #ablauf, #faq), not separate pages
    const tourenLink = page.locator('header').getByRole('link', { name: 'Touren' })
    if (await tourenLink.isVisible()) {
      await tourenLink.click()
      await expect(page).toHaveURL(/#touren/)
    }
  })

  test('should display footer with legal links', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Impressum' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Datenschutz' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'AGB' })).toBeVisible()
  })

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-that-does-not-exist')

    // 404 page shows "Schiff versenkt!" as title
    await expect(page.getByText('Schiff versenkt!')).toBeVisible()
    await expect(page.getByText('nicht gefunden')).toBeVisible()
  })
})
