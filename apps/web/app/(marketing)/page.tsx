import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';

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

interface ExperiencePillar {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly detail: string;
}

interface RouteHighlight {
  readonly title: string;
  readonly description: string;
  readonly tag: string;
  readonly image: string;
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

const EXPERIENCE_PILLARS: ReadonlyArray<ExperiencePillar> = [
  {
    title: 'Story-getrieben',
    description: 'Eine echte Geschichte führt euch Schritt für Schritt durch Warnemünde.',
    icon: '📜',
    detail: 'Kapitel statt Punktejagd',
  },
  {
    title: 'Aktiv & draußen',
    description: 'Ihr bewegt euch durch Hafen, Strand und Gassen – ohne Zeitdruck.',
    icon: '🌊',
    detail: 'Flexibles Tempo',
  },
  {
    title: 'Gemeinsam lösen',
    description: 'Rätsel, die für Teams gebaut sind – intuitiv, aber clever.',
    icon: '🧩',
    detail: 'Perfekt für Gruppen',
  },
] as const;

const ROUTE_HIGHLIGHTS: ReadonlyArray<RouteHighlight> = [
  {
    title: 'Leuchtturm & Teepott',
    description: 'Der ikonische Startpunkt, an dem das Vermächtnis beginnt.',
    tag: 'Startpunkt',
    image: '/graphics/location-lighthouse.svg',
  },
  {
    title: 'Alter Strom',
    description: 'Zwischen Booten, Brücken und Räucherfisch wartet das nächste Rätsel.',
    tag: 'Maritimes Herz',
    image: '/graphics/location-harbor.svg',
  },
  {
    title: 'Promenade & Strand',
    description: 'Weite Sicht, frische Luft und das Finale der Spurensuche.',
    tag: 'Finale',
    image: '/graphics/location-teapot.svg',
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
        variant.popular && 'ring-2 ring-brass-500'
      )}
    >
      {variant.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-brass-500 px-3 py-1 text-xs font-semibold text-navy-950">
            ⭐ Beliebteste Wahl
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-brass-400">
            {variant.name}
          </h3>
          <p className="mt-2 text-sm text-sand-300">{variant.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-white">
            {variant.price}€
          </span>
          <span className="text-sm text-sand-400">pro Person</span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-navy-800">
          <div>
            <div className="text-xs text-sand-400 uppercase tracking-wide">Dauer</div>
            <div className="mt-1 text-sm font-semibold">{variant.duration}</div>
          </div>
          <div>
            <div className="text-xs text-sand-400 uppercase tracking-wide">Schwierigkeit</div>
            <div className="mt-1 text-sm font-semibold">{variant.difficulty}</div>
          </div>
        </div>

        <ul className="space-y-2">
          {variant.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="h-5 w-5 text-brass-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sand-200">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/buchen?variant=${variant.id}`}
          className={cn(
            'btn w-full mt-6',
            variant.popular ? 'btn-primary' : 'btn-secondary'
          )}
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

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -top-8 -left-6 h-40 w-40 rounded-full bg-brass-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-navy-700/30 blur-3xl" />

      <div className="relative rounded-3xl border border-brass-500/30 bg-navy-900/70 p-6 shadow-2xl backdrop-blur hero-glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brass-300">Live-Ansicht</p>
            <h3 className="font-display text-xl font-semibold text-sand-50">Tour-Interface</h3>
          </div>
          <div className="rounded-full bg-brass-500/15 px-3 py-1 text-xs text-brass-300">
            Kapitel 1/8
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-950/80">
          <Image
            src="/graphics/hero-map.svg"
            alt="Illustration der Route"
            width={880}
            height={520}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Rätsel gelöst', value: '3/10' },
            { label: 'Team-Punkte', value: '480' },
            { label: 'Nächster Halt', value: 'Alter Strom' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-navy-700/60 bg-navy-900/60 px-3 py-3 text-sand-200"
            >
              <p className="text-[10px] uppercase tracking-wide text-sand-400">{item.label}</p>
              <p className="mt-1 font-semibold text-sand-50">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -top-6 right-6 rounded-2xl border border-brass-500/40 bg-navy-950/90 px-4 py-3 text-xs text-sand-200 shadow-lg animate-float-slow">
        <p className="text-[10px] uppercase tracking-wide text-brass-300">Hinweis</p>
        <p className="mt-1 font-semibold">Schaut auf die Stufen</p>
      </div>

      <div className="absolute -bottom-6 left-8 rounded-2xl border border-navy-700 bg-navy-950/90 px-4 py-3 text-xs text-sand-200 shadow-lg animate-float-medium">
        <p className="text-[10px] uppercase tracking-wide text-sand-400">Routen-Status</p>
        <p className="mt-1 font-semibold text-brass-400">3 km bis Finale</p>
      </div>
    </div>
  );
}

/**
 * Landing page component
 * Main entry point for the marketing site
 */
export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 pattern-anchor">
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 bg-gradient-to-br from-brass-500/10 via-transparent to-navy-900/60" />

        <div className="container-custom relative py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-brass-500/30 bg-brass-500/10 px-4 py-2 text-sm backdrop-blur">
                <span className="text-brass-400">⚓</span>
                <span className="text-brass-300">Das Vermächtnis des Lotsenkapitäns</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white text-shadow-lg">
                  Entdeckt Warnemünde
                  <span className="block text-gradient">als interaktives Abenteuer</span>
                </h1>
                <p className="text-lg md:text-xl text-sand-200 max-w-2xl">
                  Eine Escape-Tour voller Rätsel, Story und echter Orte. Ihr spielt draußen,
                  löst Hinweise im Team und erlebt das Ostseebad wie in einem Abenteuerfilm.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href="#touren" className="btn btn-primary text-lg px-8 py-4">
                  Tour buchen
                </Link>
                <Link href="/play" className="btn btn-ghost text-lg px-8 py-4">
                  Demo starten
                </Link>
                <div className="rounded-full border border-brass-500/40 bg-brass-500/10 px-4 py-2 text-xs text-brass-300">
                  Demo-Code: DEMO01
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 max-w-xl">
                {[
                  { value: '2-4h', label: 'Spielzeit' },
                  { value: '10+', label: 'Stationen' },
                  { value: '3-5km', label: 'Route' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-navy-800 bg-navy-900/60 px-4 py-4 text-center">
                    <div className="font-display text-2xl md:text-3xl font-bold text-brass-400">
                      {stat.value}
                    </div>
                    <div className="text-xs text-sand-400 mt-1 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <HeroVisual />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-navy-950 pattern-waves" />
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-navy-950">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
            <div className="space-y-5">
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Das Spielgefühl
                <span className="block text-gradient">zwischen Rätsel & Meer</span>
              </h2>
              <p className="text-lg text-sand-300 max-w-2xl">
                Keine klassische Stadtführung, sondern ein Story-Game, das euch durch
                Warnemünde führt. Ihr entscheidet das Tempo, das Spiel liefert den Flow.
              </p>
              <div className="grid gap-4">
                {EXPERIENCE_PILLARS.map((pillar) => (
                  <div key={pillar.title} className="rounded-2xl border border-navy-800 bg-navy-900/50 p-5 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brass-500/15 text-2xl">
                        {pillar.icon}
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-sand-50">{pillar.title}</h3>
                        <p className="mt-1 text-sm text-sand-300">{pillar.description}</p>
                        <span className="mt-2 inline-flex rounded-full bg-brass-500/15 px-3 py-1 text-xs text-brass-300">
                          {pillar.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-navy-800 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 p-8 shadow-2xl">
              <h3 className="font-display text-2xl font-semibold text-sand-50">Spiel-Highlights</h3>
              <p className="mt-2 text-sm text-sand-300">
                Kombiniert Rätsel, Navigation und Storytelling zu einem Erlebnis, das sich wie
                ein interaktiver Spaziergang anfühlt.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  'Hinweis-System mit fairer Hilfe',
                  'Atmosphärische Sounds & Illustrationen',
                  'Story-Kapitel statt Punktejagd',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-navy-700/60 bg-navy-900/70 px-4 py-3 text-sm text-sand-200">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-500/20 text-brass-300">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Route Highlights */}
      <section className="py-20 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Eure Route durch <span className="text-gradient">Warnemünde</span>
            </h2>
            <p className="text-lg text-sand-300 max-w-2xl mx-auto">
              Drei Highlights, viele Geheimnisse – mit echten Orten, die ihr neu entdeckt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ROUTE_HIGHLIGHTS.map((spot) => (
              <div key={spot.title} className="card-hover flex flex-col overflow-hidden">
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-navy-800 bg-navy-950">
                  <Image
                    src={spot.image}
                    alt={spot.title}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-5 space-y-2">
                  <span className="inline-flex rounded-full bg-brass-500/15 px-3 py-1 text-xs text-brass-300">
                    {spot.tag}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-sand-50">{spot.title}</h3>
                  <p className="text-sm text-sand-300">{spot.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour Variants Section */}
      <section id="touren" className="py-20 bg-navy-950">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Wählt eure <span className="text-gradient">perfekte Tour</span>
            </h2>
            <p className="text-lg text-sand-300 max-w-2xl mx-auto">
              Ob als Familie mit Kindern oder als anspruchsvolle Herausforderung –
              wir haben die richtige Tour für euch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {TOUR_VARIANTS.map((variant) => (
              <TourCard key={variant.id} variant={variant} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="ablauf" className="py-20 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              So <span className="text-gradient">funktioniert's</span>
            </h2>
            <p className="text-lg text-sand-300 max-w-2xl mx-auto">
              In vier einfachen Schritten zu eurem Abenteuer
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '1',
                title: 'Buchen',
                description: 'Wählt eure Tour und bucht online',
                icon: '🎫',
              },
              {
                step: '2',
                title: 'Starten',
                description: 'Startet am Leuchtturm wann ihr wollt',
                icon: '🗺️',
              },
              {
                step: '3',
                title: 'Rätseln',
                description: 'Löst Rätsel an historischen Orten',
                icon: '🔍',
              },
              {
                step: '4',
                title: 'Entdecken',
                description: 'Erlebt Warnemünde aus neuer Perspektive',
                icon: '⚓',
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-brass-500/10 border-2 border-brass-500 flex items-center justify-center text-3xl">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-brass-500 text-navy-950 font-bold flex items-center justify-center text-sm">
                      {item.step}
                    </div>
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-sand-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-950">
        <div className="container-custom">
          <div className="rounded-3xl border border-brass-500/20 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 p-10 md:p-14 text-center shadow-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-sand-50">
              Bereit für euer Abenteuer?
            </h2>
            <p className="mt-4 text-lg text-sand-300 max-w-2xl mx-auto">
              Startet noch heute oder testet die Demo. Ihr braucht nur ein Smartphone,
              Lust auf Rätsel und ein bisschen Seeluft.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/buchen" className="btn btn-primary text-lg px-8 py-4">
                Tour buchen
              </Link>
              <Link href="/play" className="btn btn-secondary text-lg px-8 py-4">
                Demo starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-navy-950">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Häufig gestellte <span className="text-gradient">Fragen</span>
            </h2>
            <p className="text-lg text-sand-300 max-w-2xl mx-auto">
              Alles was ihr vor eurer Tour wissen müsst
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>
    </div>
  );
}
