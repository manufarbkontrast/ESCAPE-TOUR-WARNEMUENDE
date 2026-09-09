'use client'

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { Easing } from 'framer-motion'
import { SITE } from '@/lib/config/site'

/**
 * Navigation link data for mobile menu
 */
const MOBILE_NAV_LINKS = [
  { label: "So funktioniert's", href: '/#ablauf' },
  { label: 'Preise', href: '/#preise' },
  { label: 'Gutschein', href: '/gutschein' },
  { label: 'FAQ', href: '/faq' },
] as const

const EASE_OUT: Easing = 'easeOut'
const EASE_IN: Easing = 'easeIn'

/**
 * Animation variants for the overlay container
 */
const overlayVariants: Variants = {
  hidden: { opacity: 0, y: '-100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: '-100%',
    transition: { duration: 0.25, ease: EASE_IN },
  },
}

/**
 * Staggered animation for nav items
 */
const navItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + index * 0.07, duration: 0.3, ease: EASE_OUT },
  }),
}

interface MobileMenuProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

/**
 * Full-screen mobile navigation menu
 * Slides down from top with framer-motion AnimatePresence
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const items = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button')
        if (items?.length) {
          const first = items[0],
            last = items[items.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }
      }
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'
      menuRef.current?.querySelector('button')?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscapeKey])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="fixed inset-0 z-[60] flex flex-col bg-coast-paper/98 backdrop-blur-lg"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              type="button"
              className="btn btn-ghost p-2"
              aria-label="Menü schließen"
              onClick={onClose}
            >
              <svg
                className="h-8 w-8 text-coast-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Der Erzählstrang, den die Kopfzeile unterhalb von `lg` weglässt —
         hier ist Platz dafür, und im geöffneten Menü hat er Ruhe zu wirken. */}
          <p className="px-6 text-center font-mono text-xs leading-relaxed tracking-wide text-coast-muted">
            {SITE.story}
          </p>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col items-center justify-center space-y-8">
            {MOBILE_NAV_LINKS.map((link, index) => (
              <motion.div
                key={link.href}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <Link
                  href={link.href}
                  className="text-2xl font-display font-semibold text-coast-muted hover:text-coast-ink transition-colors"
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {/* CTA Button */}
            <motion.div
              className="w-full max-w-xs pt-8"
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              custom={MOBILE_NAV_LINKS.length}
            >
              <Link
                href="/buchen"
                className="btn btn-primary w-full text-lg py-4 text-center block"
                onClick={onClose}
              >
                Tour buchen
              </Link>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
