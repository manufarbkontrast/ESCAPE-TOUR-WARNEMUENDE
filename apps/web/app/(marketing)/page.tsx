import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { Reveal } from '@/components/marketing/Reveal';
import { TOUR_VARIANTS, formatPrice, LOWEST_PRICE_CENTS } from '@/lib/config/tours';
import { TOUR_LOCATIONS } from '@/lib/config/locations';
import { FAQ_ITEMS } from '@/lib/config/faq';
import { OCCASIONS } from '@/lib/config/occasions';

export const metadata: Metadata = {
 title: 'Escape Tour Warnemünde – GPS-Rätseltour am Leuchtturm',
 description:
  `Löst als Team 12 Rätsel-Stationen durch Warnemünde. iPad wird gestellt, kein App-Download, Start am Leuchtturm. Ab ${formatPrice(LOWEST_PRICE_CENTS)} € pro Person.`,
 alternates: { canonical: '/' },
 openGraph: {
  title: 'Escape Tour Warnemünde – GPS-Rätseltour am Leuchtturm',
  description:
   'Löst als Team 12 Rätsel-Stationen durch Warnemünde. iPad wird gestellt, kein App-Download, Start am Leuchtturm.',
  url: 'https://myescapetour.com',
 },
};

const BOOKING_HREF = '/buchen?location=warnemuende';

/** Facts a visitor needs before deciding — shown directly under the headline. */
const HERO_FACTS = [
 { label: 'Preis', value: `ab ${formatPrice(LOWEST_PRICE_CENTS)} €`, note: 'pro Person' },
 { label: 'Dauer', value: '2–5 h', note: 'im eigenen Tempo' },
 { label: 'Stationen', value: '12', note: '3–5 km Rundweg' },
] as const;

/**
 * What the guest gets that competitors do not — the device is the strongest
 * one, so it leads.
 */
const INCLUDED = [
 {
  title: 'iPad ist dabei',
  text: 'Ihr bekommt beim Briefing ein vorbereitetes iPad. Kein eigener Akku, kein eigenes Datenvolumen.',
  path: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 17.5h.01',
 },
 {
  title: 'Kein Download',
  text: 'Keine App, kein Konto, keine Installation. Ihr nehmt das Gerät und lauft los.',
  path: 'M4 4h16v12H4zM8 20h8M12 16v4M9 10l3 3 3-3M12 6v7',
 },
 {
  title: 'Einweisung am Leuchtturm',
  text: 'Treffpunkt ist Shoes Please direkt am Leuchtturm. Wir erklären alles, bevor die Zeit läuft.',
  path: 'M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11zM12 8v3',
 },
 {
  title: 'Bei jedem Wetter',
  text: 'Die Route führt an überdachten Stellen vorbei. Pausen macht ihr, wann ihr wollt.',
  path: 'M18 10a4 4 0 0 0-4-4 4.08 4.08 0 0 0-2.16.6A6 6 0 0 0 6 10a4 4 0 0 0 0 8h12a4 4 0 0 0 0-8z',
 },
] as const;

/** The real start flow, including the 20-minute buffer before the slot. */
const STEPS = [
 {
  n: '01',
  title: 'Termin buchen',
  text: 'Variante, Datum und Uhrzeit wählen. Die Bestätigung mit eurem Startcode kommt sofort per E-Mail.',
 },
 {
  n: '02',
  title: '20 Minuten vorher da sein',
  text: 'Treffpunkt Shoes Please am Leuchtturm. Ihr bekommt das iPad und eine kurze Einweisung.',
 },
 {
  n: '03',
  title: 'Von Station zu Station',
  text: 'Die Karte führt euch zu Fuß. An jeder Station wartet ein Rätsel aus der Geschichte des Ortes.',
 },
 {
  n: '04',
  title: 'Zurück zum Start',
  text: 'Nach dem Rundweg gebt ihr das iPad zurück und bekommt eure Auswertung.',
 },
] as const;

/** Stations shown as a visual teaser of the route. */
const ROUTE_PREVIEW = [
 { image: '/images/stations/01_leuchtturm.webp', name: 'Leuchtturm', n: '01' },
 { image: '/images/stations/02_teepott.webp', name: 'Teepott', n: '02' },
 { image: '/images/stations/10_alter_strom.webp', name: 'Alter Strom', n: '10' },
 { image: '/images/stations/11_fischmarkt.webp', name: 'Fischmarkt', n: '11' },
] as const;



/** Other cities, listed honestly as not-yet-bookable. */
const UPCOMING_LOCATIONS = TOUR_LOCATIONS.filter((location) => !location.available);

function FactReadout({
 label,
 value,
 note,
}: {
 readonly label: string;
 readonly value: string;
 readonly note: string;
}) {
 return (
  <div>
   <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/45">
    {label}
   </div>
   <div className="mt-1.5 font-mono text-2xl tabular-nums text-white">{value}</div>
   <div className="mt-0.5 text-sm text-white/50">{note}</div>
  </div>
 );
}

export default function HomePage() {
 return (
  <div className="w-full">
   {/* Hero — the tour, its price and the way in, all above the fold */}
   {/* Der negative Rand zieht den Hero unter die Kopfzeile. Die ist sticky
       und liegt damit im normalen Fluss — ohne den Versatz nähme sie eigene
       Höhe ein, das Foto begänne erst darunter und die Leiste sässe als
       schwarzer Balken davor.

       Höhe und Versatz gehören zusammen: die Leiste ist 80 px hoch (h-16
       plus pt-4 in Header.tsx), also -mt-20. Wer eines ändert, ändert beides,
       sonst klafft über dem Foto ein Streifen Hintergrund. Die
       Innenabstände (pt-40 / md:pt-48) holen die 80 px wieder auf, damit der
       Text so steht wie ohne den Versatz. */}
   <section className="relative -mt-20 overflow-hidden">
    {/* The photo carries the place; the scrims exist only so the text stays
        legible on top of it — they are not decoration. */}
    <div className="absolute inset-0" aria-hidden="true">
     {/* Eigener Kasten, damit das Foto beim Scrollen nachlaufen kann, ohne
         oben oder unten den Hintergrund freizugeben — daher 120 % Höhe und
         der Versatz nach oben. Die Verläufe bleiben bewusst draussen: sie
         sollen an der Kante kleben, nicht mitwandern. */}
     <div className="hero-parallax absolute inset-x-0 -top-[10%] h-[120%]">
      <Image
       src="/images/stations/01_leuchtturm.webp"
       alt=""
       fill
       priority
       sizes="100vw"
       className="photo-drift object-cover"
      />
     </div>
     {/* One scrim, running sideways: the text sits left, so that is where the
         darkening belongs, and the photo stays readable on the right.

         A vertical scrim was tried for narrow windows and dropped again. This
         hero carries a lot of low-contrast text — the coordinate line and the
         second headline line are white/60 — and all of it needs a dark ground.
         Lightening the top far enough to show the sky made them unreadable;
         keeping them readable made the photo black anyway. The sideways
         gradient is the better answer at every width: it darkens where the
         words are instead of everywhere. */}
     <div
      className="absolute inset-0"
      style={{
       background:
        'linear-gradient(100deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.88) 38%, rgba(10,10,10,0.55) 70%, rgba(10,10,10,0.4) 100%)',
      }}
     />
     <div
      className="absolute inset-x-0 bottom-0 h-32"
      style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0), #0a0a0a)' }}
     />
     {/* The lighthouse beam — the one intentional light source on the site,
         and the hero photo is the lighthouse itself. Already used on
         /warnemuende; the home page had been the only page without it.
         `beam-live` gives it a light characteristic instead of leaving it a
         painted-on glow. */}
     <div className="hero-beam beam-live" />
    </div>

    <div className="container-custom relative pb-20 pt-40 md:pb-28 md:pt-48">
     <div className="max-w-3xl">
      {/* Staggered on load rather than on scroll: above the fold an observer
          would fire instantly anyway, and this needs no JavaScript. */}
      <span
       className="rise block font-mono text-xs tabular-nums text-neon-400/80"
       style={{ animationDelay: '0ms' }}
      >
       54.1766° N · 12.0837° E · Warnemünde
      </span>

      <h1
       className="rise mt-5 font-display text-5xl leading-[1.03] text-white md:text-7xl"
       style={{ animationDelay: '90ms' }}
      >
       Zwölf Rätsel,
       <span className="mt-1 block text-white/60">ein Ostseebad</span>
      </h1>

      {/* Der Absatz nannte vorher nur, was man bekommt — iPad, Stationen,
          Wegstrecke. Das steht ohnehin eine Zeile tiefer in den Eckdaten und
          im Abschnitt „Was ist dabei". Hier steht deshalb jetzt die
          Geschichte: Scheel, sein Vermächtnis und die Jahreszahl sind der
          kanonische Erzählstrang aus `lib/demo/data.ts`, nicht neu erfunden.
          Der praktische Haken bleibt am Ende, damit der Absatz nicht nur
          Stimmung ist. */}
      <p
       className="rise mt-6 max-w-xl text-lg leading-relaxed text-white/75"
       style={{ animationDelay: '180ms' }}
      >
       1928 ließ Lotsenkapitän Friedrich Scheel sein Vermächtnis in Stein
       schlagen. Die Spur dorthin liegt bis heute in Warnemünde, auf zwölf
       Stationen zwischen Leuchtturm und Altem Strom. Ihr bekommt ein iPad und
       den ersten Hinweis — den Rest macht ihr selbst.
      </p>

      <div
       className="rise mt-9 flex flex-col gap-3 sm:flex-row"
       style={{ animationDelay: '260ms' }}
      >
       <Link href={BOOKING_HREF} className="btn btn-primary btn-lg">
        Termin buchen
       </Link>
       <Link href="#ablauf" className="btn btn-secondary btn-lg">
        So läuft&apos;s ab
       </Link>
      </div>

      {/* Kein Kasten mehr: der gerahmte, abgerundete Block mit Trennstrichen
          las sich wie ein Formularfeld. Drei Ablesungen unter einer
          Haarlinie passen zur Instrumentensprache der Seite. */}
      <div
       className="rise mt-12 grid max-w-xl grid-cols-1 gap-y-5 border-t border-white/20 pt-5 sm:grid-cols-3 sm:gap-x-8"
       style={{ animationDelay: '340ms' }}
      >
       {HERO_FACTS.map((fact) => (
        <FactReadout key={fact.label} {...fact} />
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* What is included — the device promise sits first on purpose */}
   <section className="container-custom py-16 md:py-20">
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
     {INCLUDED.map((item, index) => (
      <Reveal
       key={item.title}
       className="rule-in pt-5"
       delay={index * 45}
      >
       <svg
        className="h-6 w-6 text-neon-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
       >
        <path d={item.path} />
       </svg>
       <h2 className="mt-4 text-lg font-bold text-white">{item.title}</h2>
       <p className="mt-2 text-base leading-relaxed text-white/60">{item.text}</p>
      </Reveal>
     ))}
    </div>
   </section>

   {/* How it works */}
   <section id="ablauf" className="scroll-mt-20 border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <Reveal>
      <h2 className="heading-rule max-w-2xl font-display text-4xl text-white md:text-5xl">
       Vom Buchen bis zum Rückweg
      </h2>
     </Reveal>

     {/* Drawn as a route with markers, not as another card row. The four
         steps are a sequence, and the section above already uses the
         border-top grid — repeating it here made the two read as one
         undifferentiated block. */}
     <div className="relative mt-14">
      {/* In its own Reveal so the line can draw itself once the block
          arrives — the draw is keyed off Reveal dropping .reveal-pending. */}
      <Reveal className="absolute inset-x-0 top-[0.4375rem] hidden lg:block">
       <div className="route-line" aria-hidden="true" />
      </Reveal>

      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
       {STEPS.map((step, index) => (
        <Reveal key={step.n} delay={index * 45}>
         <div className="flex items-center gap-3">
          {/* Opaque centre so the marker sits on the line, not under it. */}
          <span
           className="route-marker h-3.5 w-3.5 flex-shrink-0 rounded-full border border-neon-400/60 bg-dark-950"
           aria-hidden="true"
          />
          <span className="font-mono text-sm tabular-nums text-neon-400">{step.n}</span>
          {/* Unterhalb von `lg` gibt es die lange Verbindungslinie nicht —
              jeder Schritt bekommt deshalb sein eigenes kurzes Stück, damit
              die wandernden Striche auf jeder Breite zu sehen sind. */}
          <span className="route-line ml-1 flex-1 lg:hidden" aria-hidden="true" />
         </div>
         <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
         <p className="mt-2 text-base leading-relaxed text-white/60">{step.text}</p>
        </Reveal>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* Variants and prices */}
   <section id="preise" className="scroll-mt-20 border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <Reveal className="max-w-2xl">
      <h2 className="heading-rule font-display text-4xl text-white md:text-5xl">
       Drei Varianten, eine Route
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-white/65">
       Gleiche Stationen, unterschiedlich harte Rätsel. Preis pro Person, iPad
       inklusive.
      </p>
     </Reveal>

     {/* Drei Spalten unter Haarlinien statt drei schwebender Kacheln. Die
         gerundeten Rechtecke mit Rahmen und dem über die Kante hängenden
         Abzeichen waren das Muster, das die Seite billig wirken liess. Die
         Empfehlung steht jetzt in der Zeile, nicht als Aufkleber darüber,
         und wird durch die kräftigere Oberlinie getragen. */}
     <div className="mt-12 grid gap-x-10 gap-y-14 lg:grid-cols-3">
      {TOUR_VARIANTS.map((variant, index) => (
       <Reveal
        key={variant.id}
        delay={index * 50}
        className={cn(
         'rule-in flex flex-col pt-6',
         variant.recommended && 'rule-in-accent'
        )}
       >
        <div className="flex min-h-[1.25rem] items-center">
         {variant.recommended && (
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-neon-400">
           Am meisten gebucht
          </span>
         )}
        </div>

        <div className="mt-3">
         <h3 className="text-2xl font-bold text-white">{variant.name}</h3>
         <p className="mt-1 text-sm font-semibold text-white/50">{variant.ageLabel}</p>
        </div>

        <div className="mt-6 flex items-baseline gap-2">
         <span className="font-display text-4xl text-white">
          {formatPrice(variant.priceCents)}&nbsp;€
         </span>
         <span className="text-sm font-semibold text-white/50">pro Person</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/12 py-4">
         <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
           Dauer
          </div>
          <div className="mt-1 font-mono text-sm tabular-nums text-white">{variant.duration}</div>
         </div>
         <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
           Weg
          </div>
          <div className="mt-1 font-mono text-sm tabular-nums text-white">{variant.distance}</div>
         </div>
         <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
           Rätsel
          </div>
          <div className="mt-1 font-mono text-sm text-white">{variant.difficulty}</div>
         </div>
        </div>

        <ul className="mt-6 mb-8 space-y-3">
         {variant.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-base text-white/75">
           <svg
            className="mt-1 h-4 w-4 flex-shrink-0 text-neon-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
           >
            <path d="M20 6 9 17l-5-5" />
           </svg>
           {feature}
          </li>
         ))}
        </ul>

        {/* mt-auto keeps all three buttons on one line regardless of how many
            feature rows a variant has. */}
        <Link
         href={`${BOOKING_HREF}&variant=${variant.id}`}
         className="btn btn-primary mt-auto w-full"
        >
         {variant.name} buchen
        </Link>
       </Reveal>
      ))}
     </div>

     <p className="mt-8 text-base text-white/60">
      Ab 6 Personen 10 % Rabatt, ab 10 Personen 15 % — wird im Buchungsschritt
      automatisch abgezogen.
     </p>
    </div>
   </section>

   {/* Route preview */}
   <section className="border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <Reveal className="max-w-2xl">
      <h2 className="heading-rule font-display text-4xl text-white md:text-5xl">
       Der Rundweg
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-white/65">
       Start und Ziel am Leuchtturm. Dazwischen Teepott, Westmole, Kurhaus,
       Strand, Kirchplatz, Heimatmuseum, Vogtei, Edvard-Munch-Haus, Alter Strom,
       Fischmarkt und Bahnhof.
      </p>
     </Reveal>

     <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ROUTE_PREVIEW.map((station, index) => (
       <Reveal key={station.n} delay={index * 45}>
        <figure className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10">
         <Image
          src={station.image}
          alt={`Station ${station.n}: ${station.name} in Warnemünde`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="photo-parallax object-cover"
         />
         <div className="absolute inset-x-0 bottom-0 bg-dark-950/85 px-4 py-3">
          <figcaption className="flex items-baseline gap-2.5">
           <span className="font-mono text-xs tabular-nums text-neon-400">{station.n}</span>
           <span className="text-base font-bold text-white">{station.name}</span>
          </figcaption>
         </div>
        </figure>
       </Reveal>
      ))}
     </div>
    </div>
   </section>

   {/* Who it is for */}
   <section className="border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <Reveal>
      <h2 className="heading-rule max-w-2xl font-display text-4xl text-white md:text-5xl">
       Für wen sich das lohnt
      </h2>
     </Reveal>

     <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
      {OCCASIONS.map((occasion, index) => (
       <Reveal key={occasion.slug} delay={index * 45} className="rule-in">
        {/* Wie die Preisspalten: Linie statt Kasten. Der Hover ändert nur
            Farbe und Deckkraft — die Projektregeln schliessen
            Transform-Effekte beim Überfahren aus. */}
        <Link
         href={`/fuer/${occasion.slug}`}
         className="group block h-full pt-6 transition-colors duration-200"
        >
         <h3 className="text-xl font-bold text-white">{occasion.navLabel}</h3>
         <p className="mt-3 text-base leading-relaxed text-white/65 transition-colors duration-200 group-hover:text-white/80">
          {occasion.intro}
         </p>
         <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neon-300 transition-colors duration-200 group-hover:text-neon-200">
          Mehr dazu
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
         </span>
        </Link>
       </Reveal>
      ))}
     </div>
    </div>
   </section>

   {/* FAQ */}
   <section id="faq" className="scroll-mt-20 border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:self-start">
       <h2 className="font-display text-4xl text-white md:text-5xl">Gut zu wissen</h2>
       <p className="mt-4 max-w-sm text-base leading-relaxed text-white/60">
        Alles, was ihr vor der Tour wissen müsst. Noch Fragen?{' '}
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
   <section className="border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
       <h2 className="heading-rule font-display text-4xl text-white md:text-5xl">
        Wann wollt ihr los?
       </h2>
       <p className="mt-4 text-lg leading-relaxed text-white/65">
        Slots gibt es täglich. Ihr braucht nichts mitzubringen außer Schuhen,
        in denen ihr ein paar Kilometer laufen könnt.
       </p>
      </div>
      <Link href={BOOKING_HREF} className="btn btn-primary btn-lg self-start md:self-auto">
       Termin buchen
      </Link>
     </Reveal>
    </div>
   </section>

   {/* Other locations — small and honest */}
   {UPCOMING_LOCATIONS.length > 0 && (
    <section className="border-t border-white/[0.06] py-12">
     <div className="container-custom">
      <p className="text-base text-white/55">
       <span className="font-semibold text-white/75">In Vorbereitung:</span>{' '}
       {UPCOMING_LOCATIONS.map((location) => location.name).join(', ')}. Aktuell
       ist nur Warnemünde buchbar.
      </p>
     </div>
    </section>
   )}
  </div>
 );
}
