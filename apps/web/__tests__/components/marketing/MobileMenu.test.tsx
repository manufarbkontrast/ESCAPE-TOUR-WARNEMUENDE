// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileMenu } from '@/components/marketing/MobileMenu'

// Mock next/link
vi.mock('next/link', () => ({
 default: ({ children, href, onClick, ...rest }: Record<string, unknown>) => (
  <a href={href as string} onClick={onClick as () => void} {...rest}>
   {children as React.ReactNode}
  </a>
 ),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
 motion: {
  div: ({ children, ...props }: Record<string, unknown>) => {
   const { variants, initial, animate, exit, custom, ...rest } = props
   const filtered: Record<string, unknown> = {}
   for (const [key, value] of Object.entries(rest)) {
    if (typeof value !== 'function' && typeof value !== 'object') {
     filtered[key] = value
    } else if (key === 'className' || key === 'style') {
     filtered[key] = value
    }
   }
   return <div {...filtered}>{children as React.ReactNode}</div>
  },
 },
 AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('MobileMenu', () => {
 const mockOnClose = vi.fn()

 beforeEach(() => {
  mockOnClose.mockClear()
 })

 afterEach(() => {
  document.body.style.overflow = ''
 })

 it('should render nothing when closed', () => {
  const { container } = render(
   <MobileMenu isOpen={false} onClose={mockOnClose} />,
  )
  expect(container.innerHTML).toBe('')
 })

 it('should render navigation when open', () => {
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  expect(screen.getByText('Touren')).toBeInTheDocument()
  expect(screen.getByText("So funktioniert's")).toBeInTheDocument()
  expect(screen.getByText('FAQ')).toBeInTheDocument()
 })

 it('should render close button', () => {
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  expect(screen.getByLabelText('Menü schließen')).toBeInTheDocument()
 })

 it('should call onClose when close button clicked', async () => {
  const user = userEvent.setup()
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  await user.click(screen.getByLabelText('Menü schließen'))
  expect(mockOnClose).toHaveBeenCalledOnce()
 })

 it('should render booking CTA', () => {
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  expect(screen.getByText('Tour buchen')).toBeInTheDocument()
 })

 it('should have correct href for booking CTA', () => {
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  const cta = screen.getByText('Tour buchen')
  expect(cta).toHaveAttribute('href', '/buchen')
 })

 it('should call onClose when nav link clicked', async () => {
  const user = userEvent.setup()
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  await user.click(screen.getByText('Touren'))
  expect(mockOnClose).toHaveBeenCalled()
 })

 it('should have dialog role', () => {
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
 })

 it('should close on Escape key', async () => {
  const user = userEvent.setup()
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  await user.keyboard('{Escape}')
  expect(mockOnClose).toHaveBeenCalled()
 })

 it('should have correct nav link hrefs', () => {
  render(<MobileMenu isOpen={true} onClose={mockOnClose} />)
  expect(screen.getByText('Touren')).toHaveAttribute('href', '/#touren')
  expect(screen.getByText('FAQ')).toHaveAttribute('href', '/#faq')
 })
})
