// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { variants, initial, animate, exit, ...rest } = props
      const safeProps: Record<string, unknown> = {}
      if (rest.className) safeProps.className = rest.className
      return <div {...safeProps}>{children as React.ReactNode}</div>
    },
    svg: ({ children, ...props }: Record<string, unknown>) => {
      const { animate, transition, ...rest } = props
      const safeProps: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(rest)) {
        if (typeof v === 'string' || typeof v === 'number') safeProps[k] = v
      }
      return <svg {...safeProps}>{children as React.ReactNode}</svg>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const FAQ_ITEMS = [
  { question: 'Wie lange dauert die Tour?', answer: 'Etwa 2-3 Stunden.' },
  { question: 'Fuer wen ist die Tour geeignet?', answer: 'Fuer alle ab 10 Jahren.' },
  { question: 'Was brauche ich?', answer: 'Ein Smartphone mit GPS.' },
] as const

describe('FaqAccordion', () => {
  it('should render all questions', () => {
    render(<FaqAccordion items={FAQ_ITEMS} />)
    expect(screen.getByText('Wie lange dauert die Tour?')).toBeInTheDocument()
    expect(screen.getByText('Fuer wen ist die Tour geeignet?')).toBeInTheDocument()
    expect(screen.getByText('Was brauche ich?')).toBeInTheDocument()
  })

  it('should start with all items collapsed', () => {
    render(<FaqAccordion items={FAQ_ITEMS} />)
    expect(screen.queryByText('Etwa 2-3 Stunden.')).not.toBeInTheDocument()
    expect(screen.queryByText('Fuer alle ab 10 Jahren.')).not.toBeInTheDocument()
    expect(screen.queryByText('Ein Smartphone mit GPS.')).not.toBeInTheDocument()
  })

  it('should expand item on click', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={FAQ_ITEMS} />)

    await user.click(screen.getByText('Wie lange dauert die Tour?'))
    expect(screen.getByText('Etwa 2-3 Stunden.')).toBeInTheDocument()
  })

  it('should collapse item on second click', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={FAQ_ITEMS} />)

    await user.click(screen.getByText('Wie lange dauert die Tour?'))
    expect(screen.getByText('Etwa 2-3 Stunden.')).toBeInTheDocument()

    await user.click(screen.getByText('Wie lange dauert die Tour?'))
    expect(screen.queryByText('Etwa 2-3 Stunden.')).not.toBeInTheDocument()
  })

  it('should only allow one item open at a time', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={FAQ_ITEMS} />)

    // Open first
    await user.click(screen.getByText('Wie lange dauert die Tour?'))
    expect(screen.getByText('Etwa 2-3 Stunden.')).toBeInTheDocument()

    // Open second — first should close
    await user.click(screen.getByText('Was brauche ich?'))
    expect(screen.queryByText('Etwa 2-3 Stunden.')).not.toBeInTheDocument()
    expect(screen.getByText('Ein Smartphone mit GPS.')).toBeInTheDocument()
  })

  it('should have aria-expanded attribute', async () => {
    const user = userEvent.setup()
    render(<FaqAccordion items={FAQ_ITEMS} />)

    const firstButton = screen.getByText('Wie lange dauert die Tour?').closest('button')!
    expect(firstButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(firstButton)
    expect(firstButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('should render empty list without errors', () => {
    render(<FaqAccordion items={[]} />)
    // No errors, no list items
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should render a single item', async () => {
    const user = userEvent.setup()
    const singleItem = [{ question: 'Frage?', answer: 'Antwort.' }]
    render(<FaqAccordion items={singleItem} />)

    expect(screen.getByText('Frage?')).toBeInTheDocument()
    await user.click(screen.getByText('Frage?'))
    expect(screen.getByText('Antwort.')).toBeInTheDocument()
  })
})
