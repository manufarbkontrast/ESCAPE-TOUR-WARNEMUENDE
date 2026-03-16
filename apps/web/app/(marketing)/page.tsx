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
        variant.popular && 'ring-2 ring-white/30'
      )}
    >
      {variant.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-dark-950">
            Beliebteste Wahl
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">
            {variant.name}
          </h3>
          <p className="mt-2 text-sm text-dark-300">{variant.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-white">
            {variant.price}€
          </span>
          <span className="text-sm text-dark-400">pro Person</span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-dark-800">
          <div>
            <div className="text-xs text-dark-400 uppercase tracking-wide">Dauer</div>
            <div className="mt-1 text-sm font-semibold">{variant.duration}</div>
          </div>
          <div>
            <div className="text-xs text-dark-400 uppercase tracking-wide">Schwierigkeit</div>
            <div className="mt-1 text-sm font-semibold">{variant.difficulty}</div>
          </div>
        </div>

        <ul className="space-y-2">
          {variant.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="h-5 w-5 text-dark-400 flex-shrink-0 mt-0.5"
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
              <span className="text-dark-200">{feature}</span>
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
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-900 to-dark-950 pattern-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent" />

        <div className="container-custom relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm backdrop-blur">
              <svg className="h-4 w-4 text-dark-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="22" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
              </svg>
              <span className="text-dark-200">Das Vermächtnis des Lotsenkapitäns</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white text-shadow-lg">
              Entdeckt Warnemünde
              <span className="block text-dark-200">auf eine ganz neue Art</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-dark-200 max-w-2xl mx-auto">
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
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  2-4h
                </div>
                <div className="text-sm text-dark-300 mt-1">Spielzeit</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  10+
                </div>
                <div className="text-sm text-dark-300 mt-1">Stationen</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  3-5km
                </div>
                <div className="text-sm text-dark-300 mt-1">Route</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-dark-950 pattern-waves" />
      </section>

      {/* Tour Variants Section */}
      <section id="touren" className="py-20 bg-dark-950">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Wählt eure <span className="text-dark-200">perfekte Tour</span>
            </h2>
            <p className="text-lg text-dark-300 max-w-2xl mx-auto">
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
      <section id="ablauf" className="py-20 bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              So <span className="text-dark-200">funktioniert's</span>
            </h2>
            <p className="text-lg text-dark-300 max-w-2xl mx-auto">
              In vier einfachen Schritten zu eurem Abenteuer
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '1',
                title: 'Buchen',
                description: 'Wählt eure Tour und bucht online',
                svgPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
              },
              {
                step: '2',
                title: 'Starten',
                description: 'Startet am Leuchtturm wann ihr wollt',
                svgPath: 'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7',
              },
              {
                step: '3',
                title: 'Rätseln',
                description: 'Löst Rätsel an historischen Orten',
                svgPath: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
              },
              {
                step: '4',
                title: 'Entdecken',
                description: 'Erlebt Warnemünde aus neuer Perspektive',
                svgPath: 'M12 2L12 8M12 8C8 8 5 12 2 12C5 12 8 16 12 22C16 16 19 12 22 12C19 12 16 8 12 8Z',
                isCompass: true,
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                      {item.isCompass ? (
                        <svg className="h-8 w-8 text-dark-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.15" stroke="currentColor" />
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 text-dark-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={item.svgPath} />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white text-dark-950 font-bold flex items-center justify-center text-sm">
                      {item.step}
                    </div>
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-dark-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-dark-950">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Häufig gestellte <span className="text-dark-200">Fragen</span>
            </h2>
            <p className="text-lg text-dark-300 max-w-2xl mx-auto">
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
