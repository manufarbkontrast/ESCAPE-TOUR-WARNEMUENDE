// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoryContent } from '@/components/game/StoryContent'

// Mock framer-motion to render children without animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { variants, initial, animate, exit, ...rest } = props
      return <div {...filterDomProps(rest)}>{children as React.ReactNode}</div>
    },
    span: ({ children, ...props }: Record<string, unknown>) => {
      const { variants, initial, animate, exit, ...rest } = props
      return <span {...filterDomProps(rest)}>{children as React.ReactNode}</span>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function filterDomProps(props: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (typeof value !== 'function' && typeof value !== 'object') {
      filtered[key] = value
    } else if (key === 'className' || key === 'style') {
      filtered[key] = value
    }
  }
  return filtered
}

describe('StoryContent', () => {
  const defaultProps = {
    content: 'Es war einmal ein Kapitaen.',
    backgroundImageUrl: null,
    onContinue: vi.fn(),
    language: 'de' as const,
  }

  it('should render story text word by word', () => {
    render(<StoryContent {...defaultProps} />)
    expect(screen.getByText('Es')).toBeInTheDocument()
    expect(screen.getByText('war')).toBeInTheDocument()
    expect(screen.getByText('einmal')).toBeInTheDocument()
    expect(screen.getByText('ein')).toBeInTheDocument()
    expect(screen.getByText('Kapitaen.')).toBeInTheDocument()
  })

  it('should render continue button in German', () => {
    render(<StoryContent {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
  })

  it('should render continue button in English', () => {
    render(<StoryContent {...defaultProps} language="en" />)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should call onContinue when button is clicked', async () => {
    const onContinue = vi.fn()
    const user = userEvent.setup()
    render(<StoryContent {...defaultProps} onContinue={onContinue} />)
    await user.click(screen.getByRole('button', { name: 'Weiter' }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('should render no-content message when content is null', () => {
    render(<StoryContent {...defaultProps} content={null} />)
    expect(screen.getByText('Keine Geschichte verfügbar.')).toBeInTheDocument()
  })

  it('should render no-content message in English', () => {
    render(<StoryContent {...defaultProps} content={null} language="en" />)
    expect(screen.getByText('No story content available.')).toBeInTheDocument()
  })

  it('should still show continue button when content is null', () => {
    render(<StoryContent {...defaultProps} content={null} />)
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument()
  })

  it('should split multiple paragraphs', () => {
    render(
      <StoryContent
        {...defaultProps}
        content={'Absatz eins.\n\nAbsatz zwei.'}
      />,
    )
    expect(screen.getByText('eins.')).toBeInTheDocument()
    expect(screen.getByText('zwei.')).toBeInTheDocument()
  })

  it('should render background image container when url provided', () => {
    const { container } = render(
      <StoryContent
        {...defaultProps}
        backgroundImageUrl="https://example.com/bg.jpg"
      />,
    )
    // The component uses inline style `backgroundImage` on a div
    const bgDiv = container.querySelector('.bg-cover')
    expect(bgDiv).not.toBeNull()
  })

  it('should not render background image container when null', () => {
    const { container } = render(
      <StoryContent {...defaultProps} backgroundImageUrl={null} />,
    )
    const bgDiv = container.querySelector('.bg-cover')
    expect(bgDiv).toBeNull()
  })
})
