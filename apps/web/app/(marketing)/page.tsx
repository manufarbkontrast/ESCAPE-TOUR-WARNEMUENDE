import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { TOUR_VARIANTS, formatPrice, LOWEST_PRICE_CENTS } from '@/lib/config/tours';
import { TOUR_LOCATIONS } from '@/lib/config/locations';

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

/** Group types the tour is built for — each with the concrete reason. */
const AUDIENCES = [
 {
  title: 'Familien',
  text: 'Die Familien-Tour hat kindgerechte Rätsel ab 8 Jahren und einen kürzeren Weg von 3 km.',
 },
 {
  title: 'Kreuzfahrt-Gäste',
  text: 'Der Bahnhof liegt am Rundweg, das Terminal ist zu Fuß erreichbar. Die Familien-Tour passt in ein 3-Stunden-Zeitfenster an Land.',
 },
 {
  title: 'Firmen & Teams',
  text: 'Ab 6 Personen 10 % Rabatt, ab 10 Personen 15 %. Mehrere Teams können parallel starten.',
 },
 {
  title: 'Freundesgruppen',
  text: 'Die Profi-Tour verzichtet auf Hinweise in den Fragen und rechnet mit Chiffren und mehrstufigen Aufgaben.',
 },
] as const;

const FAQ_ITEMS = [
 {
  question: 'Brauchen wir ein eigenes Handy oder eine App?',
  answer:
   'Nein. Ihr bekommt beim Briefing ein vorbereitetes iPad mit Karte, Rätseln und Story — inklusive Internetverbindung. Es gibt nichts zu installieren und kein Konto anzulegen. Euer eigenes Handy braucht ihr nur, wenn ihr Fotos machen wollt.',
 },
 {
  question: 'Wo und wann treffen wir uns?',
  answer:
   'Treffpunkt ist Shoes Please direkt am Leuchtturm in Warnemünde. Kommt 20 Minuten vor eurem gebuchten Slot — in dieser Zeit bekommt ihr das iPad und eine kurze Einweisung. Die Spielzeit läuft erst danach.',
 },
 {
  question: 'Wie lange dauert die Tour?',
  answer:
   'Je nach Variante 2 bis 5 Stunden. Ihr spielt in eurem eigenen Tempo, könnt jederzeit pausieren und unterwegs Kaffee trinken oder essen gehen — die Zeit lässt sich anhalten.',
 },
 {
  question: 'Wie groß darf unser Team sein?',
  answer:
   'Gebucht wird pro Person. Ein Team teilt sich ein iPad, sinnvoll sind 2 bis 5 Personen pro Gerät. Größere Gruppen teilen wir in mehrere Teams auf, die parallel starten. Ab 6 Personen gibt es 10 % Rabatt, ab 10 Personen 15 %.',
 },
 {
  question: 'Was ist bei schlechtem Wetter?',
  answer:
   'Die Tour findet bei jedem Wetter statt, die Route führt an überdachten Stellen vorbei. Zieht euch wetterfest an. Wenn euch das Wetter zu ungemütlich ist: euer Buchungscode ist 12 Monate gültig und auf andere Personen übertragbar.',
 },
 {
  question: 'Können wir stornieren?',
  answer:
   'Innerhalb von 24 Stunden nach der Buchung könnt ihr kostenlos stornieren und bekommt den vollen Betrag zurück. Danach bleibt euer Buchungscode 12 Monate gültig und ist übertragbar. Details stehen in unseren AGB.',
 },
 {
  question: 'Ab welchem Alter ist die Tour geeignet?',
  answer:
   'Die Familien-Tour ist ab 8 Jahren, die Erwachsenen-Tour ab 14 und die Profi-Tour ab 16 Jahren. Jüngere Kinder können natürlich mitlaufen und mitraten.',
 },
 {
  question: 'Was passiert, wenn wir bei einem Rätsel nicht weiterkommen?',
  answer:
   'Zu jedem Rätsel gibt es bis zu drei Hinweise, die nach und nach konkreter werden. Sie kosten Punkte, aber ihr kommt immer weiter. Ihr bleibt an keiner Station stecken.',
 },
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
  <div className="px-5 py-4">
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
   <section className="relative overflow-hidden">
    {/* The photo carries the place; the scrims exist only so the text stays
        legible on top of it — they are not decoration. */}
    <div className="absolute inset-0" aria-hidden="true">
     <Image
      src="/images/stations/01_leuchtturm.webp"
      alt=""
      fill
      priority
      sizes="100vw"
      className="object-cover"
     />
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
    </div>

    <div className="container-custom relative py-20 md:py-28">
     <div className="max-w-3xl">
      <span className="font-mono text-xs tabular-nums text-neon-400/80">
       54.1766° N · 12.0837° E · Warnemünde
      </span>

      <h1 className="mt-5 font-display text-5xl leading-[1.03] text-white md:text-7xl">
       Zwölf Rätsel,
       <span className="mt-1 block text-white/60">ein Ostseebad</span>
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
       Eine Rätseltour durch Warnemünde — vom Leuchtturm über die Westmole bis
       zum Alten Strom. Ihr bekommt ein iPad, eine Geschichte und zwölf
       Stationen. Den Rest macht ihr selbst.
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
       <Link href={BOOKING_HREF} className="btn btn-primary btn-lg">
        Termin buchen
       </Link>
       <Link href="#ablauf" className="btn btn-secondary btn-lg">
        So läuft&apos;s ab
       </Link>
      </div>

      <div className="mt-12 grid max-w-xl grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-dark-950/60 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
     {INCLUDED.map((item) => (
      <div key={item.title} className="border-t border-white/15 pt-5">
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
      </div>
     ))}
    </div>
   </section>

   {/* How it works */}
   <section id="ablauf" className="scroll-mt-20 border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <h2 className="max-w-2xl font-display text-4xl text-white md:text-5xl">
      Vom Buchen bis zum Rückweg
     </h2>

     <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step) => (
       <div key={step.n} className="border-t border-white/15 pt-5">
        <div className="font-mono text-sm tabular-nums text-neon-400">{step.n}</div>
        <h3 className="mt-3 text-lg font-bold text-white">{step.title}</h3>
        <p className="mt-2 text-base leading-relaxed text-white/60">{step.text}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* Variants and prices */}
   <section id="preise" className="scroll-mt-20 border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <div className="max-w-2xl">
      <h2 className="font-display text-4xl text-white md:text-5xl">
       Drei Varianten, eine Route
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-white/65">
       Gleiche Stationen, unterschiedlich harte Rätsel. Preis pro Person, iPad
       inklusive.
      </p>
     </div>

     <div className="mt-12 grid gap-6 lg:grid-cols-3">
      {TOUR_VARIANTS.map((variant) => (
       <div
        key={variant.id}
        className={cn(
         'card relative flex flex-col',
         variant.recommended && 'ring-1 ring-neon-400/40'
        )}
       >
        {/* Absolute so the badge cannot reflow the heading and knock the three
            cards out of alignment. */}
        {variant.recommended && (
         <span className="absolute -top-3 left-6 whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-xs font-bold text-dark-950">
          Am meisten gebucht
         </span>
        )}

        <div>
         <h3 className="text-2xl font-bold text-white">{variant.name}</h3>
         <p className="mt-1 text-sm font-semibold text-white/50">{variant.ageLabel}</p>
        </div>

        <div className="mt-6 flex items-baseline gap-2">
         <span className="font-display text-4xl text-white">
          {formatPrice(variant.priceCents)}&nbsp;€
         </span>
         <span className="text-sm font-semibold text-white/50">pro Person</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-4">
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
       </div>
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
     <div className="max-w-2xl">
      <h2 className="font-display text-4xl text-white md:text-5xl">
       Der Rundweg
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-white/65">
       Start und Ziel am Leuchtturm. Dazwischen Teepott, Westmole, Kurhaus,
       Strand, Kirchplatz, Heimatmuseum, Vogtei, Edvard-Munch-Haus, Alter Strom,
       Fischmarkt und Bahnhof.
      </p>
     </div>

     <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ROUTE_PREVIEW.map((station) => (
       <figure
        key={station.n}
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
       >
        <Image
         src={station.image}
         alt={`Station ${station.n}: ${station.name} in Warnemünde`}
         fill
         sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
         className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-dark-950/85 px-4 py-3">
         <figcaption className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs tabular-nums text-neon-400">{station.n}</span>
          <span className="text-base font-bold text-white">{station.name}</span>
         </figcaption>
        </div>
       </figure>
      ))}
     </div>
    </div>
   </section>

   {/* Who it is for */}
   <section className="border-t border-white/[0.06] py-20 md:py-28">
    <div className="container-custom">
     <h2 className="max-w-2xl font-display text-4xl text-white md:text-5xl">
      Für wen sich das lohnt
     </h2>

     <div className="mt-12 grid gap-6 sm:grid-cols-2">
      {AUDIENCES.map((audience) => (
       <div key={audience.title} className="card">
        <h3 className="text-xl font-bold text-white">{audience.title}</h3>
        <p className="mt-3 text-base leading-relaxed text-white/65">{audience.text}</p>
       </div>
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
     <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
       <h2 className="font-display text-4xl text-white md:text-5xl">
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
     </div>
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
