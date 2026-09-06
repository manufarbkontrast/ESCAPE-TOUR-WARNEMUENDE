import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, mailHref, telHref } from '@/lib/config/site';

export const metadata: Metadata = {
 title: 'Gutschein gekauft – Escape Tour Warnemünde',
 // This page is only reached from Stripe; it has no business in an index.
 robots: { index: false, follow: false },
};

/**
 * Shown after Stripe redirects back from a voucher purchase.
 *
 * Deliberately does not look the voucher up: it is created by the webhook, so
 * polling for it here would show "not found" whenever Stripe's callback beats
 * the webhook by a second. The mail is the delivery channel, and this page
 * says so.
 */
export default function VoucherConfirmationPage() {
 return (
  <div className="w-full">
   <section className="container-custom py-20 md:py-28">
    <div className="mx-auto max-w-2xl">
     <svg
      className="h-12 w-12 text-neon-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
     >
      <path d="M20 6 9 17l-5-5" />
     </svg>

     <h1 className="mt-6 font-display text-4xl leading-[1.1] text-white md:text-5xl">
      Danke — der Gutschein ist unterwegs
     </h1>

     <p className="mt-6 text-lg leading-relaxed text-white/75">
      Wir schicken ihn in den nächsten Minuten an die E-Mail-Adresse, die ihr
      bei der Zahlung angegeben habt. Darin steht der Gutscheincode, die Tour,
      die Personenzahl und wie er eingelöst wird.
     </p>

     <div className="card mt-10">
      <h2 className="text-lg font-bold text-white">Nichts angekommen?</h2>
      <p className="mt-3 text-base leading-relaxed text-white/65">
       Schaut zuerst im Spam-Ordner nach. Wenn nach einer halben Stunde immer
       noch nichts da ist, meldet euch — wir finden die Zahlung und schicken
       den Gutschein erneut.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
       <a href={telHref(SITE.phone.display)} className="btn btn-secondary">
        {SITE.phone.display}
       </a>
       <a href={mailHref(SITE.email, 'Gutschein nicht angekommen')} className="btn btn-secondary">
        E-Mail schreiben
       </a>
      </div>
     </div>

     <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      <Link href="/" className="btn btn-primary">
       Zur Startseite
      </Link>
      <Link href="/gutschein/einloesen" className="btn btn-ghost">
       Gutschein einlösen
      </Link>
     </div>
    </div>
   </section>
  </div>
 );
}
