import Link from 'next/link';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { LocationSelector } from '@/components/marketing/LocationSelector';

/**
 * Key figures shown as an instrument-panel readout in the hero.
 */
const HERO_STATS = [
 { label: 'Spielzeit', value: '2–4 h' },
 { label: 'Stationen', value: '10+' },
 { label: 'Route', value: '3–5 km' },
] as const;

/**
 * Product promises — presented as a spec strip, not icon cards.
 */
const PROMISES = [
 {
  label: 'Sofort spielbar',
  path: 'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
 },
 {
  label: 'Jedes Wetter',
  path: 'M18 10a4 4 0 0 0-4-4 4.08 4.08 0 0 0-2.16.6A6 6 0 0 0 6 10a4 4 0 0 0 0 8h12a4 4 0 0 0 0-8z',
 },
 {
  label: 'Keine App nötig',
  path: 'M5 2h14a0 0 0 0 1 0 0v20a0 0 0 0 1 0 0H5a0 0 0 0 1 0 0V2a0 0 0 0 1 0 0zM12 18h.01',
 },
 {
  label: '2–5 km Route',
  path: 'M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11zM12 7v3',
 },
] as const;

/**
 * Four steps, shown as a technical numbered sequence.
 */
const STEPS = [
 { n: '01', title: 'Standort wählen', text: 'Wählt eure Stadt und die passende Tour.' },
 { n: '02', title: 'Buchen', text: 'Bucht online und erhaltet euren Startcode.' },
 { n: '03', title: 'Rätseln', text: 'Löst Rätsel an echten, besonderen Orten.' },
 { n: '04', title: 'Entdecken', text: 'Erlebt eure Stadt aus neuer Perspektive.' },
] as const;

/**
 * FAQ items — brand-level questions that apply to every location.
 */
const FAQ_ITEMS = [
 {
  question: 'Wie funktioniert eine Escape Tour?',
  answer:
   'Ihr wählt euren Standort, bucht online und erhaltet einen Buchungscode. Am Startpunkt gebt ihr den Code ein und werdet per GPS von Station zu Station geleitet. An jeder Station wartet ein Rätsel, das ihr mit eurem Smartphone löst.',
 },
 {
  question: 'Wie lange dauert eine Tour?',
  answer:
   'Je nach Standort und Variante dauert eine Tour ca. 2-4 Stunden. Ihr könnt jederzeit Pausen einlegen und die Tour in eurem eigenen Tempo spielen.',
 },
 {
  question: 'Ist die Tour auch bei Regen spielbar?',
  answer:
   'Die Touren sind grundsätzlich bei jedem Wetter spielbar. Bei starkem Regen empfehlen wir wetterfeste Kleidung. Viele Routen bieten überdachte Bereiche für Pausen.',
 },
 {
  question: 'Für welches Alter sind die Touren geeignet?',
  answer:
   'An jedem Standort gibt es meist eine Familien-Variante (ab 8 Jahren) und eine anspruchsvollere Variante für Jugendliche ab 14 Jahren und Erwachsene.',
 },
 {
  question: 'Brauche ich eine Internetverbindung?',
  answer:
   'Ja, ihr benötigt ein Smartphone mit Internetverbindung. Die App funktioniert auch offline für kurze Zeit, aber für die beste Erfahrung empfehlen wir eine stabile Verbindung.',
 },
 {
  question: 'Kann ich die Tour pausieren?',
  answer:
   'Ja! Ihr könnt die Tour jederzeit pausieren und später fortsetzen. Der Timer wird angehalten und eure Fortschritte werden gespeichert.',
 },
 {
  question: 'Was passiert wenn ich nicht weiterkomme?',
  answer:
   'Für jedes Rätsel stehen euch bis zu drei Hinweise zur Verfügung. Die Hinweise kosten zwar Punkte, aber sie helfen euch weiterzukommen. Als letzte Option könnt ihr die Lösung anzeigen lassen.',
 },
] as const;

/**
 * Landing page — brand-level, location-agnostic.
 * Aesthetic: a coastal navigation instrument. Mono chart annotations, a single
 * lighthouse beam, hairline rules; the location picker is the primary control.
 */
export default function HomePage() {
 return (
  <div className="w-full">
   {/* Hero */}
   <section id="standort" className="relative overflow-hidden scroll-mt-20">
    <div className="hero-beam" aria-hidden="true" />
    <div className="chart-grid absolute inset-0" aria-hidden="true" />

    <div className="container-custom relative py-20 md:py-28">
     <div className="mx-auto max-w-3xl text-center">
      {/* Mono eyebrow — instrument annotation instead of a pill badge */}
      <div className="flex items-center justify-center gap-3">
       <span className="hidden h-px w-8 bg-white/15 sm:block" />
       <span className="eyebrow">Interaktive GPS-Escape-Touren</span>
       <span className="hidden h-px w-8 bg-white/15 sm:block" />
      </div>

      {/* Headline */}
      <h1 className="mt-7 font-display text-5xl leading-[1.02] text-white md:text-7xl">
       Erlebt eure Stadt
       <span className="mt-1 block text-white/55">als Escape-Abenteuer</span>
      </h1>

      {/* Description */}
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
       Löst Rätsel an echten Orten, entdeckt versteckte Ecken und erlebt
       Städte per GPS-Escape-Tour. Wählt euren Standort und legt los.
      </p>

      {/* Location picker (primary control) */}
      <div className="mt-10">
       <LocationSelector />
      </div>

      {/* Instrument-panel stats */}
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] divide-x divide-white/10">
       {HERO_STATS.map((stat) => (
        <div key={stat.label} className="px-4 py-4">
         <div className="eyebrow text-[0.65rem]">{stat.label}</div>
         <div className="mt-1.5 font-mono text-xl tabular-nums text-white">
          {stat.value}
         </div>
        </div>
       ))}
      </div>

      <Link
       href="#ablauf"
       className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition-colors hover:text-white"
      >
       So funktioniert&apos;s
       <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M19 12l-7 7-7-7" />
       </svg>
      </Link>
     </div>
    </div>
   </section>

   {/* Promises — spec strip */}
   <section className="container-custom pb-8">
    <div className="mx-auto grid max-w-4xl grid-cols-2 overflow-hidden rounded-xl border border-white/10 md:grid-cols-4 divide-x divide-y divide-white/10 md:divide-y-0">
     {PROMISES.map((promise) => (
      <div key={promise.label} className="flex items-center gap-3 px-5 py-5">
       <svg className="h-5 w-5 flex-shrink-0 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={promise.path} />
       </svg>
       <span className="text-sm font-semibold text-white/85">{promise.label}</span>
      </div>
     ))}
    </div>
   </section>

   {/* How it works */}
   <section id="ablauf" className="container-custom scroll-mt-20 py-20 md:py-28">
    <div className="max-w-2xl">
     <span className="eyebrow">Ablauf</span>
     <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">
      In vier Schritten zum Abenteuer
     </h2>
    </div>

    <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
     {STEPS.map((step) => (
      <div key={step.n} className="border-t border-white/15 pt-5">
       <div className="font-mono text-sm tabular-nums text-neon-400">{step.n}</div>
       <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
       <p className="mt-2 text-base leading-relaxed text-white/60">{step.text}</p>
      </div>
     ))}
    </div>
   </section>

   {/* FAQ */}
   <section id="faq" className="scroll-mt-20 border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:self-start">
       <span className="eyebrow">FAQ</span>
       <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">
        Gut zu wissen
       </h2>
       <p className="mt-4 max-w-sm text-base leading-relaxed text-white/60">
        Alles, was ihr vor eurer Tour wissen müsst. Noch Fragen?{' '}
        <Link href="/kontakt" className="text-neon-300 underline-offset-4 hover:underline">
         Schreibt uns.
        </Link>
       </p>
      </div>

      <div>
       <FaqAccordion items={FAQ_ITEMS} />
      </div>
     </div>
    </div>
   </section>

   {/* Final CTA */}
   <section className="container-custom py-24 md:py-32">
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-16 text-center md:py-20">
     <div className="hero-beam" aria-hidden="true" />
     <div className="relative">
      <span className="eyebrow">Los geht&apos;s</span>
      <h2 className="mx-auto mt-4 max-w-xl font-display text-4xl text-white md:text-5xl">
       Bereit für euer Abenteuer?
      </h2>
      <p className="mx-auto mt-4 max-w-md text-lg text-white/65">
       Wählt euren Standort und legt sofort los.
      </p>
      <div className="mt-8">
       <Link href="#standort" className="btn btn-primary btn-lg">
        Standort wählen
       </Link>
      </div>
     </div>
    </div>
   </section>
  </div>
 );
}
