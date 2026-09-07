'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { SITE, telHref } from '@/lib/config/site';

/**
 * Navigation link data
 */
const NAV_LINKS = [
 { label: "So funktioniert's", href: '/#ablauf' },
 { label: 'Preise', href: '/#preise' },
 { label: 'Gutschein', href: '/gutschein' },
 { label: 'FAQ', href: '/faq' },
] as const;

/** Wie weit gescrollt sein muss, bevor die Leiste einen Hintergrund bekommt. */
const SCROLLED_AFTER_PX = 24;

/**
 * Header component for marketing pages
 * Contains logo, desktop navigation, and mobile menu toggle
 */
export function Header() {
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);

 const handleOpenMenu = () => {
  setIsMenuOpen(true);
 };

 const handleCloseMenu = () => {
  setIsMenuOpen(false);
 };

 /**
  * At the very top the bar stays out of the way so the hero photo runs to
  * the edge of the screen; a solid bar there cut the picture off. As soon as
  * content scrolls underneath it, the bar needs a background or the links
  * become unreadable over whatever passes below.
  */
 useEffect(() => {
  const onScroll = () => setIsScrolled(window.scrollY > SCROLLED_AFTER_PX);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  // A jump to /#ablauf can happen between mount and the listener being live;
  // the scroll event that would have told us is then already gone, and the
  // bar stays transparent over content. One extra look on the next frame.
  const frame = requestAnimationFrame(onScroll);
  return () => {
   cancelAnimationFrame(frame);
   window.removeEventListener('scroll', onScroll);
  };
 }, []);

 return (
  <>
   <header
    className={cn(
     'sticky top-0 z-50 w-full border-b transition-[background-color,border-color] duration-200 ease-[var(--ease-out)]',
     isScrolled
      ? 'border-white/10 bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-dark-950/75'
      : 'border-transparent bg-transparent'
    )}
   >
    {/* Fortschritt durch die Seite. Ohne Scroll-Timeline im Browser bleibt
        die Linie auf scaleX(0) und ist damit schlicht nicht da — kein
        halbfertiger Balken. */}
    <div
     className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 bg-neon-400/70"
     aria-hidden="true"
    />
    <div className="container-custom">
     <div className="flex h-16 items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2 group">
       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-dark-950 transition-transform group-hover:scale-105">
        <Logo className="h-6 w-6" />
       </div>
       <span className="font-display font-bold text-lg leading-none">
        Escape Tour
       </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-6">
       {NAV_LINKS.map((link) => (
        <Link
         key={link.href}
         href={link.href}
         className="text-base font-semibold text-white/80 hover:text-white transition-colors"
        >
         {link.label}
        </Link>
       ))}
       {/* A local experience with a fixed meeting point needs a phone
           number in reach — questions come up twenty minutes before a slot. */}
       <a
        href={telHref(SITE.phone.display)}
        className="font-mono text-sm tabular-nums text-white/70 transition-colors hover:text-white"
       >
        {SITE.phone.display}
       </a>
       <Link
        href="/buchen"
        className={cn('btn btn-primary', 'text-sm px-4 py-2')}
       >
        Tour buchen
       </Link>
      </nav>

      {/* Mobile Menu Button */}
      <button
       type="button"
       className="lg:hidden btn btn-ghost p-2"
       aria-label="Menü öffnen"
       onClick={handleOpenMenu}
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

   <MobileMenu isOpen={isMenuOpen} onClose={handleCloseMenu} />
  </>
 );
}
