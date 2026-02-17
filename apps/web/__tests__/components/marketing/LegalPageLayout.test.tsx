// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LegalPageLayout } from '@/components/marketing/LegalPageLayout'

describe('LegalPageLayout', () => {
  it('should render title', () => {
    render(
      <LegalPageLayout title="Impressum" lastUpdated="Januar 2025">
        <p>Content here</p>
      </LegalPageLayout>,
    )
    expect(screen.getByText('Impressum')).toBeInTheDocument()
  })

  it('should render last updated date', () => {
    render(
      <LegalPageLayout title="Impressum" lastUpdated="Januar 2025">
        <p>Content here</p>
      </LegalPageLayout>,
    )
    expect(screen.getByText('Stand: Januar 2025')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <LegalPageLayout title="Datenschutz" lastUpdated="Februar 2025">
        <p>Privacy policy content</p>
      </LegalPageLayout>,
    )
    expect(screen.getByText('Privacy policy content')).toBeInTheDocument()
  })

  it('should render as section element', () => {
    const { container } = render(
      <LegalPageLayout title="AGB" lastUpdated="2025">
        <p>Terms</p>
      </LegalPageLayout>,
    )
    expect(container.querySelector('section')).not.toBeNull()
  })

  it('should render h1 for title', () => {
    render(
      <LegalPageLayout title="Impressum" lastUpdated="2025">
        <p>Content</p>
      </LegalPageLayout>,
    )
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Impressum')
  })
})
