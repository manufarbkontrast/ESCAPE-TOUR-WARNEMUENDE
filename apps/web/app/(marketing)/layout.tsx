import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface MarketingLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Header component for marketing pages
 * Contains logo and navigation
 */
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-800 bg-navy-950/95 backdrop-blur supports-[backdrop-filter]:bg-navy-950/75">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass-500 text-navy-950 font-bold text-xl transition-transform group-hover:scale-105">
              ⚓
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-none">
                Escape Tour
              </span>
              <span className="text-xs text-brass-400">Warnemünde</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/#touren"
              className="text-sm font-medium text-sand-200 hover:text-brass-400 transition-colors"
            >
              Touren
            </Link>
            <Link
              href="/#ablauf"
              className="text-sm font-medium text-sand-200 hover:text-brass-400 transition-colors"
            >
              So funktioniert's
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium text-sand-200 hover:text-brass-400 transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/buchen"
              className={cn(
                'btn btn-primary',
                'text-sm px-4 py-2'
              )}
            >
              Tour buchen
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden btn btn-ghost p-2"
            aria-label="Menü öffnen"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Footer component for marketing pages
 * Contains links and copyright information
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-navy-800 bg-navy-950 pattern-waves">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass-500 text-navy-950 font-bold text-xl">
                ⚓
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-none">
                  Escape Tour
                </span>
                <span className="text-xs text-brass-400">Warnemünde</span>
              </div>
            </div>
            <p className="text-sm text-sand-300 max-w-md">
              Entdeckt Warnemünde auf eine ganz neue Art. Löst Rätsel, erkundet
              historische Orte und erlebt eine unvergessliche Tour durch das Ostseebad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-brass-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#touren" className="text-sm text-sand-300 hover:text-brass-400 transition-colors">
                  Touren
                </Link>
              </li>
              <li>
                <Link href="/#ablauf" className="text-sm text-sand-300 hover:text-brass-400 transition-colors">
                  So funktioniert's
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-sm text-sand-300 hover:text-brass-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-brass-400">Rechtliches</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/impressum" className="text-sm text-sand-300 hover:text-brass-400 transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-sm text-sand-300 hover:text-brass-400 transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-sm text-sand-300 hover:text-brass-400 transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-nautical my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-sand-400">
          <p>© {currentYear} Escape Tour Warnemünde. Alle Rechte vorbehalten.</p>
          <div className="flex items-center space-x-4">
            <a
              href="mailto:info@escape-tour-warnemuende.de"
              className="hover:text-brass-400 transition-colors"
            >
              info@escape-tour-warnemuende.de
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Marketing layout component
 * Wraps marketing pages with header and footer
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
