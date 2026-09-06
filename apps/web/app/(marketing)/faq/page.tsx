import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { FAQ_ITEMS } from '@/lib/config/faq';
import { SITE, telHref, mailHref } from '@/lib/config/site';

export const metadata: Metadata = {
 title: 'Häufige Fragen – Escape Tour Warnemünde',
 description:
  'Braucht ihr eine App? Wo ist der Treffpunkt? Was passiert bei Regen? Die Antworten auf die Fragen, die uns vor einer Buchung am häufigsten erreichen.',
 alternates: { canonical: '/faq' },
 openGraph: {
  title: 'Häufige Fragen – Escape Tour Warnemünde',
  description:
   'Treffpunkt, Ausrüstung, Dauer, Wetter, Stornierung — alles, was ihr vor der Tour wissen müsst.',
  url: 'https://myescapetour.com/faq',
 },
};

/**
 * Structured data so the answers can appear directly in search results.
 *
 * This is the main reason the FAQ deserves its own page rather than staying an
 * anchor on the landing page: an accordion inside a marketing page competes
 * with everything else on it for the same URL.
 */
const faqJsonLd = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: FAQ_ITEMS.map((item) => ({
  '@type': 'Question',
  name: item.question,
  acceptedAnswer: { '@type': 'Answer', text: item.answer },
 })),
};

export default function FaqPage() {
 return (
  <div className="w-full">
   <script
    type="application/ld+json"
    // The content is our own static config, not user input.
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
   />

   <section className="container-custom py-20 md:py-28">
    <div className="max-w-2xl">
     <h1 className="font-display text-5xl leading-[1.05] text-white md:text-6xl">
      Häufige Fragen
     </h1>
     <p className="mt-6 text-lg leading-relaxed text-white/70">
      Was uns vor einer Buchung am häufigsten erreicht. Steht eure Frage nicht
      dabei, ruft an oder schreibt uns — wir antworten in der Regel am selben
      Tag.
     </p>
    </div>

    <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
     <div>
      <FaqAccordion items={FAQ_ITEMS} />
     </div>

     <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="card">
       <h2 className="text-xl font-bold text-white">Noch etwas offen?</h2>
       <p className="mt-3 text-base leading-relaxed text-white/65">
        Gerade bei Gruppen, Firmenfeiern oder knappen Zeitfenstern lohnt sich
        ein kurzer Anruf.
       </p>

       <dl className="mt-6 space-y-4 border-t border-white/10 pt-6">
        <div>
         <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
          Telefon
         </dt>
         <dd className="mt-1">
          <a
           href={telHref(SITE.phone.display)}
           className="font-mono text-lg tabular-nums text-white hover:text-neon-300"
          >
           {SITE.phone.display}
          </a>
          <div className="mt-0.5 text-sm text-white/50">{SITE.phone.hours}</div>
         </dd>
        </div>

        <div>
         <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
          E-Mail
         </dt>
         <dd className="mt-1">
          <a
           href={mailHref(SITE.email)}
           className="break-all text-base text-white hover:text-neon-300"
          >
           {SITE.email}
          </a>
         </dd>
        </div>

        <div>
         <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
          Treffpunkt
         </dt>
         <dd className="mt-1 text-base text-white">
          {SITE.meetingPoint.name}
          <div className="text-sm text-white/50">{SITE.meetingPoint.detail}</div>
         </dd>
        </div>
       </dl>

       <Link href="/kontakt" className="btn btn-secondary mt-6 w-full">
        Zum Kontaktformular
       </Link>
      </div>
     </aside>
    </div>

    <div className="mt-16 border-t border-white/[0.06] pt-12">
     <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <p className="max-w-xl text-lg text-white/70">
       Alles geklärt? Dann sucht euch einen Termin aus.
      </p>
      <Link
       href="/buchen?location=warnemuende"
       className="btn btn-primary btn-lg self-start md:self-auto"
      >
       Termin buchen
      </Link>
     </div>
    </div>
   </section>
  </div>
 );
}
