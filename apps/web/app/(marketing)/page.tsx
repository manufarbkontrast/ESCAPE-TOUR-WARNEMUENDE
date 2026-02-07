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

/**
 * Landing page component
 * Main entry point for the marketing site
 */
export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950 pattern-anchor">
        <div className="absolute inset-0 bg-gradient-to-br from-brass-500/5 to-transparent" />

        <div className="container-custom relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brass-500/30 bg-brass-500/10 px-4 py-2 text-sm backdrop-blur">
              <span className="text-brass-400">⚓</span>
              <span className="text-brass-300">Das Vermächtnis des Lotsenkapitäns</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white text-shadow-lg">
              Entdeckt Warnemünde
              <span className="block text-gradient">auf eine ganz neue Art</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-sand-200 max-w-2xl mx-auto">
              Begebt euch auf eine spannende Escape-Tour durch Warnemünde.
              Löst Rätsel, entdeckt versteckte Orte und erlebt die maritime
              Geschichte des Ostseebades hautnah.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="#touren" className="btn btn-primary text-lg px-8 py-4">
                Tour buchen
              </Link>
              <Link href="#ablauf" className="btn btn-ghost text-lg px-8 py-4">
                Mehr erfahren
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-brass-400">
                  2-4h
                </div>
                <div className="text-sm text-sand-300 mt-1">Spielzeit</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-brass-400">
                  10+
                </div>
                <div className="text-sm text-sand-300 mt-1">Stationen</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-brass-400">
                  3-5km
                </div>
                <div className="text-sm text-sand-300 mt-1">Route</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-navy-950 pattern-waves" />
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
