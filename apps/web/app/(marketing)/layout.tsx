import { Header } from '@/components/marketing/Header'
import './maritime.css'
import { Footer } from '@/components/marketing/Footer'

interface MarketingLayoutProps {
  readonly children: React.ReactNode
}

/**
 * Marketing layout component
 * Wraps marketing pages with header and footer
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="maritime-site flex min-h-screen flex-col">
      <a className="et-skip" href="#inhalt">
        Zum Inhalt
      </a>
      <Header />
      <main id="inhalt" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
