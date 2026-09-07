// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/marketing/Header'

// Mock next/link
vi.mock('next/link', () => ({
 default: ({
  children,
  href,
  ...rest
 }: {
  children: React.ReactNode
  href: string
  className?: string
 }) => (
  <a href={href} {...rest}>
   {children}
  </a>
 ),
}))

// Mock MobileMenu
vi.mock('@/components/marketing/MobileMenu', () => ({
 MobileMenu: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
  isOpen ? (
   <div data-testid="mobile-menu">
    <button onClick={onClose}>Close</button>
   </div>
  ) : null,
}))

// Mock cn utility
vi.mock('@/lib/utils/cn', () => ({
 cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

describe('Header', () => {
 it('should render logo with link to home', () => {
  render(<Header />)
  const logoLink = screen.getByText('Escape Tour').closest('a')
  expect(logoLink).toHaveAttribute('href', '/')
 })

 it('should render navigation links', () => {
  render(<Header />)
  expect(screen.getByText("So funktioniert's")).toBeInTheDocument()
  expect(screen.getByText('Preise')).toBeInTheDocument()
  expect(screen.getByText('FAQ')).toBeInTheDocument()
 })

 it('should have correct href for nav links', () => {
  render(<Header />)
  expect(screen.getByText("So funktioniert's").closest('a')).toHaveAttribute('href', '/#ablauf')
  expect(screen.getByText('Preise').closest('a')).toHaveAttribute('href', '/#preise')
  expect(screen.getByText('FAQ').closest('a')).toHaveAttribute('href', '/faq')
 })

 it('should render booking CTA button', () => {
  render(<Header />)
  const ctaLink = screen.getByText('Tour buchen')
  expect(ctaLink.closest('a')).toHaveAttribute('href', '/buchen')
 })

 it('should render mobile menu toggle button', () => {
  render(<Header />)
  expect(screen.getByLabelText('Menü öffnen')).toBeInTheDocument()
 })

 it('should open mobile menu when toggle is clicked', async () => {
  const user = userEvent.setup()
  render(<Header />)

  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()

  await user.click(screen.getByLabelText('Menü öffnen'))
  expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
 })

 it('should close mobile menu when close is triggered', async () => {
  const user = userEvent.setup()
  render(<Header />)

  await user.click(screen.getByLabelText('Menü öffnen'))
  expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

  await user.click(screen.getByText('Close'))
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
 })

 it('should render as a sticky header', () => {
  render(<Header />)
  const header = screen.getByRole('banner')
  expect(header.className).toContain('sticky')
 })
})

describe('Header — Hintergrund beim Scrollen', () => {
 /**
  * Ganz oben soll die Kopfzeile durchsichtig sein, damit das Hero-Foto bis
  * an den oberen Rand läuft. Sobald Inhalt darunter durchscrollt, braucht sie
  * einen Hintergrund — sonst wird der Text über dem Inhalt unlesbar.
  */
 function banner() {
  return document.querySelector('header') as HTMLElement
 }

 function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true })
  window.dispatchEvent(new Event('scroll'))
 }

 it('ist ganz oben ohne Hintergrund und ohne Rahmen', () => {
  scrollTo(0)
  render(<Header />)

  expect(banner().className).toContain('bg-transparent')
  expect(banner().className).not.toContain('bg-dark-950/95')
 })

 it('bekommt Hintergrund und Rahmen, sobald gescrollt wird', async () => {
  scrollTo(0)
  render(<Header />)

  await act(async () => {
   scrollTo(200)
  })

  expect(banner().className).toContain('bg-dark-950/95')
  expect(banner().className).toContain('border-white/10')
 })


 it('hat schon beim Laden Hintergrund, wenn die Seite bereits gescrollt ist', async () => {
  // Ankersprung (/#ablauf) oder wiederhergestellte Scrollposition: es folgt
  // kein Scroll-Ereignis mehr, aus dem die Leiste ihren Zustand ableiten
  // könnte — sie stünde sonst durchsichtig über dem Inhalt.
  scrollTo(1300)
  render(<Header />)

  await act(async () => {
   await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
  })

  expect(banner().className).toContain('bg-dark-950/95')
 })

 it('nimmt den Hintergrund zurück, wenn wieder ganz oben', async () => {
  scrollTo(300)
  render(<Header />)

  await act(async () => {
   scrollTo(0)
  })

  expect(banner().className).toContain('bg-transparent')
 })
})
