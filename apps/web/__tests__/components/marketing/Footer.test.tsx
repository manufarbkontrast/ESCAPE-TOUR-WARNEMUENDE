// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/marketing/Footer'

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

describe('Footer', () => {
 it('should render brand name', () => {
  render(<Footer />)
  expect(screen.getByText('Escape Tour')).toBeInTheDocument()
  expect(screen.getByText('Warnemünde')).toBeInTheDocument()
 })

 it('should render brand description', () => {
  render(<Footer />)
  expect(
   screen.getByText(/Entdeckt Warnemünde auf eine ganz neue Art/),
  ).toBeInTheDocument()
 })

 it('should render quick links', () => {
  render(<Footer />)
  const tourenLinks = screen.getAllByText('Touren')
  expect(tourenLinks.length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText("So funktioniert's")).toBeInTheDocument()
  expect(screen.getByText('FAQ')).toBeInTheDocument()
 })

 it('should have correct hrefs for quick links', () => {
  render(<Footer />)
  const faqLink = screen.getByText('FAQ')
  expect(faqLink.closest('a')).toHaveAttribute('href', '/#faq')
 })

 it('should render legal links', () => {
  render(<Footer />)
  expect(screen.getByText('Impressum')).toBeInTheDocument()
  expect(screen.getByText('Datenschutz')).toBeInTheDocument()
  expect(screen.getByText('AGB')).toBeInTheDocument()
 })

 it('should have correct hrefs for legal links', () => {
  render(<Footer />)
  expect(screen.getByText('Impressum').closest('a')).toHaveAttribute('href', '/impressum')
  expect(screen.getByText('Datenschutz').closest('a')).toHaveAttribute('href', '/datenschutz')
  expect(screen.getByText('AGB').closest('a')).toHaveAttribute('href', '/agb')
 })

 it('should render section headings', () => {
  render(<Footer />)
  expect(screen.getByText('Navigation')).toBeInTheDocument()
  expect(screen.getByText('Rechtliches')).toBeInTheDocument()
 })

 it('should render copyright with current year', () => {
  render(<Footer />)
  const currentYear = new Date().getFullYear()
  expect(
   screen.getByText(`© ${currentYear} Escape Tour Warnemünde. Alle Rechte vorbehalten.`),
  ).toBeInTheDocument()
 })

 it('should render email link', () => {
  render(<Footer />)
  const emailLink = screen.getByText('info@escape-tour-warnemuende.de')
  expect(emailLink.closest('a')).toHaveAttribute(
   'href',
   'mailto:info@escape-tour-warnemuende.de',
  )
 })

 it('should render as footer element', () => {
  render(<Footer />)
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
 })
})
