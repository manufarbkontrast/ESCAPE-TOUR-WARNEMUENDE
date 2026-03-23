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
          <h3 className="text-2xl font-bold text-white">
            {variant.name}
          </h3>
          <p className="mt-2 text-sm text-dark-200 font-medium">{variant.description}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {variant.price}&euro;
          </span>
          <span className="text-sm text-dark-300 font-medium">pro Person</span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-dark-800">
          <div>
            <div className="text-xs text-dark-300 uppercase tracking-wide font-semibold">Dauer</div>
            <div className="mt-1 text-sm font-semibold">{variant.duration}</div>
          </div>
          <div>
            <div className="text-xs text-dark-300 uppercase tracking-wide font-semibold">Schwierigkeit</div>
            <div className="mt-1 text-sm font-semibold">{variant.difficulty}</div>
          </div>
        </div>

        <ul className="space-y-2">
          {variant.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="h-5 w-5 text-neon-500 flex-shrink-0 mt-0.5"
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
              <span className="text-dark-100">{feature}</span>
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
 * Star icon for testimonial ratings
 */
function StarIcon() {
  return (
    <svg className="h-4 w-4 text-neon-400" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/**
 * Landing page component
 * Main entry point for the marketing site
 */
export default function HomePage() {
  return (
    <div className="w-full bg-gradient-to-b from-dark-900 via-dark-950 via-30% to-dark-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pattern-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent" />
        {/* Atmospheric lighthouse beam effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="container-custom relative py-24 md:py-40">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm backdrop-blur">
              <svg className="h-4 w-4 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="8" x2="12" y2="22" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
              </svg>
              <span className="text-dark-100">Das Vermächtnis des Lotsenkapitäns</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white text-shadow-lg">
              Entdeckt Warnemünde
              <span className="block text-dark-100">auf eine ganz neue Art</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-dark-100 font-medium max-w-2xl mx-auto">
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
                <div className="text-sm text-dark-200 font-medium mt-1">Spielzeit</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  10+
                </div>
                <div className="text-sm text-dark-200 font-medium mt-1">Stationen</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-white">
                  3-5km
                </div>
                <div className="text-sm text-dark-200 font-medium mt-1">Route</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pattern-waves" />
      </section>

      {/* Value Proposition Strip */}
      <section className="py-12 md:py-16">
        <div className="divider-neon" />
        <div className="container-custom pt-12 md:pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* Sofort spielbar */}
            <div className="flex flex-col items-center gap-3 text-center">
              <svg className="h-6 w-6 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-sm text-dark-100 font-semibold">Sofort spielbar</span>
            </div>

            {/* Jedes Wetter */}
            <div className="flex flex-col items-center gap-3 text-center">
              <svg className="h-6 w-6 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10a4 4 0 0 0-4-4 4.08 4.08 0 0 0-2.16.6A6 6 0 0 0 6 10a4 4 0 0 0 0 8h12a4 4 0 0 0 0-8z" />
              </svg>
              <span className="text-sm text-dark-100 font-semibold">Jedes Wetter</span>
            </div>

            {/* Keine App nötig */}
            <div className="flex flex-col items-center gap-3 text-center">
              <svg className="h-6 w-6 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span className="text-sm text-dark-100 font-semibold">Keine App nötig</span>
            </div>

            {/* 2-5 km Route */}
            <div className="flex flex-col items-center gap-3 text-center">
              <svg className="h-6 w-6 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm text-dark-100 font-semibold">2-5 km Route</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Variants Section */}
      <section id="touren" className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-sans text-3xl md:text-4xl font-bold">
              Wählt eure <span className="text-neon-300">perfekte Tour</span>
            </h2>
            <p className="text-lg text-dark-200 font-medium max-w-2xl mx-auto">
              Ob als Familie mit Kindern oder als anspruchsvolle Herausforderung –
              wir haben die richtige Tour für euch.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {TOUR_VARIANTS.map((variant) => (
              <TourCard key={variant.id} variant={variant} />
            ))}
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-dark-300">
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
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-sans text-3xl md:text-4xl font-bold">
              Das sagen unsere <span className="text-neon-300">Teilnehmer</span>
            </h2>
            <p className="text-lg text-dark-200 font-medium max-w-2xl mx-auto">
              Über 500 begeisterte Teilnehmer haben unsere Tour bereits erlebt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="card space-y-4">
                <div className="flex gap-0.5">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <p className="text-dark-100 font-medium text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                  <div className="text-xs text-dark-300">{testimonial.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="ablauf" className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-sans text-3xl md:text-4xl font-bold">
              So <span className="text-neon-300">funktioniert&apos;s</span>
            </h2>
            <p className="text-lg text-dark-200 font-medium max-w-2xl mx-auto">
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
                isCompass: true,
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                      {item.isCompass ? (
                        <svg className="h-10 w-10 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.15" stroke="currentColor" />
                        </svg>
                      ) : (
                        <svg className="h-10 w-10 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={item.svgPath} />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white text-dark-950 font-bold flex items-center justify-center text-sm">
                      {item.step}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-dark-200 font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-sans text-3xl md:text-4xl font-bold">
              Häufig gestellte <span className="text-neon-300">Fragen</span>
            </h2>
            <p className="text-lg text-dark-200 font-medium max-w-2xl mx-auto">
              Alles was ihr vor eurer Tour wissen müsst
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,240,255,0.04) 0%, transparent 50%)',
          }}
        />
        <div className="container-custom relative text-center space-y-6">
          <h2 className="font-sans text-3xl md:text-4xl font-bold">
            Bereit für euer <span className="text-neon-300">Abenteuer</span>?
          </h2>
          <p className="text-lg text-dark-100 font-medium max-w-xl mx-auto">
            Startet jetzt eure Escape Tour durch Warnemünde
          </p>
          <div className="pt-4">
            <Link href="/buchen" className="btn btn-primary btn-lg">
              Tour buchen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
