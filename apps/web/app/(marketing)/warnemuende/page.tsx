import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';

export const metadata: Metadata = {
 title: 'Escape Tour Warnemünde – Das Vermächtnis des Lotsenkapitäns',
 description:
  'Entdeckt Warnemünde auf eine ganz neue Art. Eine spannende GPS-Escape-Tour durch die maritime Geschichte des Ostseebades.',
 alternates: { canonical: '/warnemuende' },
 openGraph: {
  title: 'Escape Tour Warnemünde – Das Vermächtnis des Lotsenkapitäns',
  description:
   'Entdeckt Warnemünde auf eine ganz neue Art. Eine spannende GPS-Escape-Tour durch die maritime Geschichte des Ostseebades.',
  url: 'https://myescapetour.com/warnemuende',
 },
};

/**
 * Key figures shown as an instrument-panel readout in the hero.
 */
const HERO_STATS = [
 { label: 'Spielzeit', value: '2–4 h' },
 { label: 'Stationen', value: '12' },
 { label: 'Route', value: '3–5 km' },
] as const;

/**
 * Product promises — presented as a spec strip.
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
 { n: '01', title: 'Buchen', text: 'Wählt eure Tour und bucht online.' },
 { n: '02', title: 'Starten', text: 'Startet am Leuchtturm, wann ihr wollt.' },
 { n: '03', title: 'Rätseln', text: 'Löst Rätsel an historischen Orten.' },
 { n: '04', title: 'Entdecken', text: 'Erlebt Warnemünde aus neuer Perspektive.' },
] as const;

/**
 * Tour variant card data type
 */
interface TourVariant {
 readonly id: string;
 readonly name: string;
 readonly description: string;
 readonly price: string;
 readonly duration: string;
 readonly difficulty: string;
 readonly features: ReadonlyArray<string>;
 readonly popular?: boolean;
}

/**
 * Tour variants configuration
 */
const TOUR_VARIANTS: ReadonlyArray<TourVariant> = [
 {
  id: 'family',
  name: 'Familien-Tour',
  description: 'Perfekt für Familien mit Kindern ab 8 Jahren. Leichtere Rätsel und kürzere Laufwege.',
  price: '24,90',
  duration: '2-3 Stunden',
  difficulty: 'Leicht',
  features: [
   'Kinderfreundliche Rätsel',
   'Kürzere Route (3 km)',
   'Familienfreundliche Stationen',
   'Flexible Pausen möglich',
  ],
 },
 {
  id: 'adult',
  name: 'Erwachsenen-Tour',
  description: 'Herausfordernde Rätsel und spannende historische Details für Erwachsene und Jugendliche ab 14 Jahren.',
  price: '29,90',
  duration: '3-4 Stunden',
  difficulty: 'Mittel',
  popular: true,
  features: [
   'Anspruchsvolle Rätsel',
   'Erweiterte Route (5 km)',
   'Historische Tiefe',
   'Exklusive Bonus-Inhalte',
  ],
 },
] as const;

/**
 * Tour variant card component
 */
function TourCard({ variant }: { readonly variant: TourVariant }) {
 return (
  <div
   className={cn(
    'card-hover relative',
    variant.popular && 'ring-1 ring-neon-400/40'
   )}
  >
   {variant.popular && (
    <div className="absolute -top-3 left-6">
     <span className="eyebrow rounded bg-white px-2.5 py-1 text-dark-950">
      Beliebteste Wahl
     </span>
    </div>
   )}

   <div className="space-y-5">
    <div>
     <h3 className="text-2xl font-bold text-white">{variant.name}</h3>
     <p className="mt-2 text-base leading-relaxed text-white/60">{variant.description}</p>
    </div>

    <div className="flex items-baseline gap-2">
     <span className="font-display text-4xl text-white">{variant.price}&euro;</span>
     <span className="text-sm font-semibold text-white/50">pro Person</span>
    </div>

    <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-4">
     <div>
      <div className="eyebrow text-[0.65rem]">Dauer</div>
      <div className="mt-1.5 font-mono text-base tabular-nums text-white">{variant.duration}</div>
     </div>
     <div>
      <div className="eyebrow text-[0.65rem]">Schwierigkeit</div>
      <div className="mt-1.5 font-mono text-base text-white">{variant.difficulty}</div>
     </div>
    </div>

    <ul className="space-y-3">
     {variant.features.map((feature, index) => (
      <li key={index} className="flex items-start gap-2.5">
       <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-neon-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
       >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
       </svg>
       <span className="text-base font-semibold text-white/85">{feature}</span>
      </li>
     ))}
    </ul>

    <Link
     href={`/buchen?variant=${variant.id}`}
     className={cn('btn w-full', variant.popular ? 'btn-primary' : 'btn-secondary')}
    >
     Tour buchen
    </Link>
   </div>
  </div>
 );
}

/**
 * FAQ items for the accordion section
 */
const FAQ_ITEMS = [
 {
  question: 'Wie funktioniert die Escape Tour?',
  answer:
   'Ihr bucht online eure Tour und erhaltet einen Buchungscode. Am Startpunkt gebt ihr den Code ein und werdet von Station zu Station geleitet. An jeder Station wartet ein Rätsel auf euch, das ihr mit eurem Smartphone löst.',
 },
 {
  question: 'Wie lange dauert die Tour?',
  answer:
   'Die Familien-Tour dauert ca. 2-3 Stunden, die Erwachsenen-Tour ca. 3-4 Stunden. Ihr könnt jederzeit Pausen einlegen und die Tour in eurem eigenen Tempo spielen.',
 },
 {
  question: 'Ist die Tour auch bei Regen spielbar?',
  answer:
   'Die Tour ist grundsätzlich bei jedem Wetter spielbar. Bei starkem Regen empfehlen wir wetterfeste Kleidung. Einige Stationen bieten überdachte Bereiche.',
 },
 {
  question: 'Für welches Alter ist die Tour geeignet?',
  answer:
   'Die Familien-Tour ist für Kinder ab 8 Jahren geeignet. Die Erwachsenen-Tour richtet sich an Jugendliche ab 14 Jahren und Erwachsene.',
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
 * Testimonial data
 */
const TESTIMONIALS = [
 {
  quote: 'Eine fantastische Tour! Die Rätsel waren anspruchsvoll und die historischen Details super interessant. Absolut empfehlenswert!',
  name: 'Familie Schneider',
  city: 'Hamburg',
 },
 {
  quote: 'Warnemünde mal ganz anders erleben. Perfekt für einen Tagesausflug, wir kommen definitiv wieder!',
  name: 'Thomas & Lisa',
  city: 'Berlin',
 },
 {
  quote: 'Die Kinder waren begeistert! Endlich eine Aktivität, die der ganzen Familie Spaß macht. Top organisiert.',
  name: 'Martina K.',
  city: 'Rostock',
 },
] as const;

/**
 * Warnemünde tour page — location-specific content, coastal-instrument aesthetic.
 */
export default function WarnemuendePage() {
 return (
  <div className="w-full">
   {/* Hero */}
   <section className="relative overflow-hidden">
    <div className="hero-beam" aria-hidden="true" />
    <div className="chart-grid absolute inset-0" aria-hidden="true" />

    <div className="container-custom relative py-20 md:py-28">
     <div className="mx-auto max-w-3xl text-center">
      {/* Back to locations */}
      <Link
       href="/#standort"
       className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/55 transition-colors hover:text-white"
      >
       <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
       </svg>
       Alle Standorte
      </Link>

      {/* Coordinate signature + eyebrow */}
      <div className="mt-8 flex flex-col items-center gap-2">
       <span className="font-mono text-xs tabular-nums text-neon-400/80">54.1766° N · 12.0837° E</span>
       <span className="eyebrow">Das Vermächtnis des Lotsenkapitäns</span>
      </div>

      {/* Headline */}
      <h1 className="mt-6 font-display text-5xl leading-[1.02] text-white md:text-7xl">
       Entdeckt Warnemünde
       <span className="mt-1 block text-white/55">auf eine ganz neue Art</span>
      </h1>

      {/* Description */}
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
       Begebt euch auf eine spannende Escape-Tour durch Warnemünde. Löst
       Rätsel, entdeckt versteckte Orte und erlebt die maritime Geschichte
       des Ostseebades hautnah.
      </p>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
       <Link href="/buchen?location=warnemuende" className="btn btn-primary btn-lg">
        Tour buchen
       </Link>
       <Link href="#ablauf" className="btn btn-ghost btn-lg">
        Mehr erfahren
       </Link>
      </div>

      {/* Instrument-panel stats */}
      <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
       {HERO_STATS.map((stat) => (
        <div key={stat.label} className="px-4 py-4">
         <div className="eyebrow text-[0.65rem]">{stat.label}</div>
         <div className="mt-1.5 font-mono text-xl tabular-nums text-white">{stat.value}</div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* Promises — spec strip */}
   <section className="container-custom pb-8">
    <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 md:grid-cols-4 md:divide-y-0">
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

   {/* Tour Variants */}
   <section id="touren" className="container-custom scroll-mt-20 py-20 md:py-28">
    <div className="max-w-2xl">
     <span className="eyebrow">Touren</span>
     <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">
      Wählt eure perfekte Tour
     </h2>
     <p className="mt-4 text-lg leading-relaxed text-white/60">
      Ob als Familie mit Kindern oder als anspruchsvolle Herausforderung –
      wir haben die richtige Tour für euch.
     </p>
    </div>

    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:max-w-5xl">
     {TOUR_VARIANTS.map((variant) => (
      <TourCard key={variant.id} variant={variant} />
     ))}
    </div>

    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-white/55">
     <div className="flex items-center gap-2">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Sichere Zahlung
     </div>
     <div className="flex items-center gap-2">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
       <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      Sofortige Bestätigung
     </div>
     <div className="flex items-center gap-2">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <polyline points="23 4 23 10 17 10" />
       <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      Flexibel stornierbar
     </div>
    </div>
   </section>

   {/* Testimonials */}
   <section className="border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <div className="max-w-2xl">
      <span className="eyebrow">Stimmen</span>
      <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">
       Über 500 begeisterte Teilnehmer
      </h2>
     </div>

     <div className="mt-12 grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((testimonial) => (
       <figure key={testimonial.name} className="card flex flex-col gap-4">
        <div className="flex gap-0.5" aria-hidden="true">
         {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="h-4 w-4 text-neon-400" viewBox="0 0 24 24" fill="currentColor" stroke="none">
           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
         ))}
        </div>
        <blockquote className="text-base leading-relaxed text-white/85">
         &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-auto border-t border-white/10 pt-4">
         <div className="text-base font-bold text-white">{testimonial.name}</div>
         <div className="font-mono text-xs text-white/45">{testimonial.city}</div>
        </figcaption>
       </figure>
      ))}
     </div>
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
       <h2 className="mt-4 font-display text-4xl text-white md:text-5xl">Gut zu wissen</h2>
       <p className="mt-4 max-w-sm text-base leading-relaxed text-white/60">
        Alles, was ihr vor eurer Tour wissen müsst.
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
       Startet jetzt eure Escape Tour durch Warnemünde.
      </p>
      <div className="mt-8">
       <Link href="/buchen?location=warnemuende" className="btn btn-primary btn-lg">
        Tour buchen
       </Link>
      </div>
     </div>
    </div>
   </section>
  </div>
 );
}
