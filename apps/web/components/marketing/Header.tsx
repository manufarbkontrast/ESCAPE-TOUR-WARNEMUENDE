'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { SITE } from '@/lib/config/site'

const NAV_LINKS = [
  { label: "So funktioniert's", href: '/#ablauf' },
  { label: 'Preise', href: '/#preise' },
  { label: 'Gutschein', href: '/gutschein' },
  { label: 'FAQ', href: '/faq' },
] as const

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    toggleRef.current?.focus()
  }, [])
  return (
    <>
      <header className="et-header sticky">
        <div className="et-wrap et-nav">
          <Link href="/" className="et-brand">
            <Logo />
            <span>
              <strong>{SITE.name}</strong>
              <small>Warnemünde entdecken</small>
            </span>
          </Link>
          <nav className="et-navlinks" aria-label="Hauptnavigation">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link className="et-btn" href="/buchen">
              Tour buchen <span aria-hidden="true">↗</span>
            </Link>
          </nav>
          <button
            ref={toggleRef}
            type="button"
            className="et-menu"
            aria-label="Menü öffnen"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            Menü{' '}
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  )
}
