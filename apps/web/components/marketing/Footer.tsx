import Link from 'next/link';
import { Logo } from './Logo';
import { SITE, telHref, mailHref } from '@/lib/config/site';

/**
 * Quick links for footer navigation
 */
const QUICK_LINKS = [
 { label: "So funktioniert's", href: '/#ablauf' },
 { label: 'Preise', href: '/#preise' },
 { label: 'Häufige Fragen', href: '/faq' },
 { label: 'Kontakt', href: '/kontakt' },
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
  <footer className="w-full border-t border-white/10">
   <div className="container-custom py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
     {/* Brand Column */}
     <div className="col-span-1 md:col-span-2">
      <div className="flex items-center space-x-2 mb-4">
       <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-dark-950">
        <Logo className="h-6 w-6" />
       </div>
       <span className="font-display font-bold text-lg leading-none">
        Escape Tour
       </span>
      </div>
      <p className="text-base text-white/70 max-w-md font-semibold">
       Rätseltouren an echten Orten. In Warnemünde führen euch zwölf
       Stationen vom Leuchtturm über die Westmole bis zum Alten Strom —
       das iPad bekommt ihr von uns.
      </p>
     </div>

     {/* Navigation */}
     <div>
      <h3 className="font-semibold mb-4 text-white">Navigation</h3>
      <ul className="space-y-2">
       {QUICK_LINKS.map((link) => (
        <li key={link.href}>
         <Link
          href={link.href}
          className="text-base text-white/70 hover:text-white transition-colors font-semibold"
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
          className="text-base text-white/70 hover:text-white transition-colors font-semibold"
         >
          {link.label}
         </Link>
        </li>
       ))}
      </ul>
     </div>
    </div>

    <div className="border-t border-white/10 my-8" />

    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-base text-white/60 font-semibold">
     <p>© {currentYear} Escape Tour. Alle Rechte vorbehalten.</p>
     <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
      <a
       href={telHref(SITE.phone.display)}
       className="font-mono tabular-nums transition-colors hover:text-white"
      >
       {SITE.phone.display}
      </a>
      <a href={mailHref(SITE.email)} className="transition-colors hover:text-white">
       {SITE.email}
      </a>
     </div>
    </div>
   </div>
  </footer>
 );
}
