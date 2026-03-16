import Link from 'next/link';

/**
 * Quick links for footer navigation
 */
const QUICK_LINKS = [
  { label: 'Touren', href: '/#touren' },
  { label: "So funktioniert's", href: '/#ablauf' },
  { label: 'FAQ', href: '/#faq' },
] as const;

/**
 * Legal links for footer
 */
const LEGAL_LINKS = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutz', href: '/datenschutz' },
  { label: 'AGB', href: '/agb' },
] as const;

/**
 * Footer component for marketing pages
 * Server component - contains links and copyright information
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-dark-800 bg-dark-950 pattern-waves">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-dark-950">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="3" />
                  <line x1="12" y1="8" x2="12" y2="22" />
                  <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-none">
                  Escape Tour
                </span>
                <span className="text-xs text-dark-300">Warnemünde</span>
              </div>
            </div>
            <p className="text-sm text-dark-200 max-w-md font-medium">
              Entdeckt Warnemünde auf eine ganz neue Art. Löst Rätsel, erkundet
              historische Orte und erlebt eine unvergessliche Tour durch das Ostseebad.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-200 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Rechtliches</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-200 hover:text-white transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider-neon my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-dark-300">
          <p>© {currentYear} Escape Tour Warnemünde. Alle Rechte vorbehalten.</p>
          <div className="flex items-center space-x-4">
            <a
              href="mailto:info@escape-tour-warnemuende.de"
              className="hover:text-dark-200 transition-colors"
            >
              info@escape-tour-warnemuende.de
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
