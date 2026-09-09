// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookingPage from '@/app/(marketing)/buchen/page'

const query = vi.hoisted(() => ({ variant: 'family' }))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams({ variant: query.variant }),
}))

describe('Booking selection and running total', () => {
  it('retains the selected landing-page variant and applies the checkout discount rounding', async () => {
    query.variant = 'family'
    render(<BookingPage />)
    const summary = screen.getByRole('complementary', { name: 'Eure Auswahl' })
    expect(within(summary).getByText('Familien-Tour')).toBeInTheDocument()
    expect(within(summary).getByText('49,80 €')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('button', { name: 'Weiter', exact: true })[0])
    for (let i = 0; i < 4; i++)
      await user.click(screen.getByRole('button', { name: 'Teilnehmer erhöhen' }))
    expect(within(summary).getByText('134,46 €')).toBeInTheDocument()
    expect(within(summary).getByText(/10 % Gruppenrabatt/)).toBeInTheDocument()
  })

  it('falls back to a valid selection for an unknown variant query', () => {
    query.variant = 'unknown'
    render(<BookingPage />)
    expect(
      screen.getByRole('button', { name: /Erwachsenen-Tour/, pressed: true }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('complementary', { name: 'Eure Auswahl' })).getByText('59,80 €'),
    ).toBeInTheDocument()
  })
  it('shows the selected tour and total in the final summary without starting payment', async () => {
    query.variant = 'pro'
    render(<BookingPage />)
    const user = userEvent.setup()
    await user.click(screen.getAllByRole('button', { name: 'Weiter', exact: true })[0])
    await user.type(screen.getByLabelText(/E-Mail-Adresse/), 'preview@example.com')
    fireEvent.change(screen.getByLabelText(/Wunschdatum/), { target: { value: '2026-12-20' } })
    await user.click(screen.getByRole('button', { name: 'Weiter zur Zusammenfassung' }))
    expect(screen.getByRole('heading', { name: 'Zusammenfassung' })).toBeInTheDocument()
    expect(screen.getByText('Profi-Tour')).toBeInTheDocument()
    expect(screen.getByText('69,80 €')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jetzt bezahlen' })).toBeEnabled()
  })
})
