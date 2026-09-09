import Link from 'next/link'
import { Logo } from './Logo'
import { SITE, telHref, mailHref } from '@/lib/config/site'

const QUICK_LINKS = [
  { label: "So funktioniert's", href: '/#ablauf' },
  { label: 'Preise', href: '/#preise' },
  { label: 'Gutschein', href: '/gutschein' },
  { label: 'Häufige Fragen', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt' },
]
const LEGAL_LINKS = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutz', href: '/datenschutz' },
  { label: 'AGB', href: '/agb' },
]

export function Footer() {
  return (
    <footer className="et-footer">
      <div className="et-wrap et-footer-grid">
        <div>
          <Link href="/" className="et-brand">
            <Logo />
            <span>
              <strong>{SITE.name}</strong>
              <small>Ein Ort. Unzählige Entdeckungen.</small>
            </span>
          </Link>
          <p className="et-footer-description">
            Rätseltouren an echten Orten. Zwölf Stationen durch Warnemünde – das iPad bekommt ihr
            von uns.
          </p>
        </div>
        <div>
          <h3>Navigation</h3>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Rechtliches</h3>
          <ul>
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Persönlich für euch da</h3>
          <a href={telHref(SITE.phone.display)}>{SITE.phone.display}</a>
          <p>{SITE.phone.hours}</p>
          <a className="et-footer-email" href={mailHref(SITE.email)}>
            {SITE.email}
          </a>
        </div>
      </div>
      <div className="et-wrap et-footer-bottom">
        <p>© {new Date().getFullYear()} Escape Tour. Alle Rechte vorbehalten.</p>
        <p>Warnemünde · Ostsee</p>
      </div>
    </footer>
  )
}
