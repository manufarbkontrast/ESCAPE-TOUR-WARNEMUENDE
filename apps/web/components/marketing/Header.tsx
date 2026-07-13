'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';

/**
 * Navigation link data
 */
const NAV_LINKS = [
 { label: 'Standorte', href: '/#standort' },
 { label: "So funktioniert's", href: '/#ablauf' },
 { label: 'FAQ', href: '/#faq' },
] as const;

/**
 * Header component for marketing pages
 * Contains logo, desktop navigation, and mobile menu toggle
 */
export function Header() {
 const [isMenuOpen, setIsMenuOpen] = useState(false);

 const handleOpenMenu = () => {
  setIsMenuOpen(true);
 };

 const handleCloseMenu = () => {
  setIsMenuOpen(false);
 };

 return (
  <>
   <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-dark-950/95 backdrop-blur supports-[backdrop-filter]:bg-dark-950/75">
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
      <nav className="hidden md:flex items-center space-x-6">
       {NAV_LINKS.map((link) => (
        <Link
         key={link.href}
         href={link.href}
         className="text-base font-semibold text-white/80 hover:text-white transition-colors"
        >
         {link.label}
        </Link>
       ))}
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
       className="md:hidden btn btn-ghost p-2"
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
