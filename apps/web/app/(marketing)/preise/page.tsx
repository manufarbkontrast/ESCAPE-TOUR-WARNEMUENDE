import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = {
  title: 'Preise | Escape Tour Warnemünde',
  description:
    'Preise und Buchungsoptionen für die GPS-Escape-Tour durch Warnemünde. Familien-Tour ab 24,90 EUR, Erwachsenen-Tour ab 29,90 EUR pro Person.',
};

/**
 * Tour pricing card data type
 */
interface TourPricing {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly duration: string;
  readonly difficulty: string;
  readonly distance: string;
  readonly popular?: boolean;
  readonly features: ReadonlyArray<string>;
}

/**
 * Tour pricing configuration
 */
const TOUR_PRICING: ReadonlyArray<TourPricing> = [
  {
    id: 'family',
    name: 'Familien-Tour',
    price: '24,90',
    duration: '2-3 Stunden',
    difficulty: 'Leicht',
    distance: '3 km',
    features: [
      'Kinderfreundliche Rätsel ab 8 Jahren',
      'Kürzere, familienfreundliche Route',
      'Flexible Pausen möglich',
      'GPS-Navigation auf eurem Smartphone',
      'Alle Rätsel und Hinweise inklusive',
      'Teilnahmezertifikat für die Familie',
    ],
  },
  {
    id: 'adult',
    name: 'Erwachsenen-Tour',
    price: '29,90',
    duration: '3-4 Stunden',
    difficulty: 'Mittel',
    distance: '5 km',
    popular: true,
    features: [
      'Anspruchsvolle Rätsel für Erwachsene',
      'Erweiterte Route mit Bonus-Stationen',
      'Historische Hintergrundinformationen',
      'GPS-Navigation auf eurem Smartphone',
      'Alle Rätsel und Hinweise inklusive',
      'Exklusive Bonus-Inhalte und Extras',
    ],
  },
];

/**
 * Included item data type
 */
interface IncludedItem {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
}

/**
 * What is included in every tour
 */
const INCLUDED_ITEMS: ReadonlyArray<IncludedItem> = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
    title: 'GPS-Navigation',
    description:
      'Euer Smartphone wird zum Navigator. Folgt der Route direkt auf der interaktiven Karte.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
    ),
    title: 'Alle Rätsel & Hinweise',
    description:
      'Über 10 einzigartige Rätseltypen und ein gestuftes Hinweissystem, damit ihr nie festsitzt.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
    title: 'Teilnahmezertifikat',
    description:
      'Nach erfolgreicher Tour erhaltet ihr ein digitales Zertifikat als Erinnerung.',
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: 'Kostenlose Stornierung (24h)',
    description:
      'Ihr könnt eure Buchung bis 24 Stunden vor Tourstart kostenlos stornieren.',
  },
];

/**
 * Pricing card component for a tour variant
 */
function PricingCard({ tour }: { readonly tour: TourPricing }) {
  return (
    <div
      className={cn(
        'card-hover relative flex flex-col',
        tour.popular && 'ring-2 ring-white/30'
      )}
    >
      {tour.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-dark-950">
            Beliebteste Wahl
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 space-y-6">
        {/* Tour Name */}
        <div>
          <h3 className="text-2xl font-bold text-white">
            {tour.name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold text-white">
            {tour.price}€
          </span>
          <span className="text-dark-300">pro Person</span>
        </div>

        {/* Tour Details Grid */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-dark-800">
          <div>
            <div className="text-xs text-dark-300 uppercase tracking-wide">
              Dauer
            </div>
            <div className="mt-1 text-sm font-semibold text-dark-100">
              {tour.duration}
            </div>
          </div>
          <div>
            <div className="text-xs text-dark-300 uppercase tracking-wide">
              Schwierigkeit
            </div>
            <div className="mt-1 text-sm font-semibold text-dark-100">
              {tour.difficulty}
            </div>
          </div>
          <div>
            <div className="text-xs text-dark-300 uppercase tracking-wide">
              Distanz
            </div>
            <div className="mt-1 text-sm font-semibold text-dark-100">
              {tour.distance}
            </div>
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-3 flex-1">
          {tour.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <svg
                className="h-5 w-5 text-white flex-shrink-0 mt-0.5"
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

        {/* CTA Button */}
        <Link
          href={`/buchen?variant=${tour.id}`}
          className={cn(
            'btn w-full mt-auto',
            tour.popular ? 'btn-primary' : 'btn-secondary'
          )}
        >
          Tour buchen
        </Link>
      </div>
    </div>
  );
}

/**
 * Included item card component
 */
function IncludedCard({ item }: { readonly item: IncludedItem }) {
  return (
    <div className="card-hover text-center space-y-4">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
          {item.icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">
        {item.title}
      </h3>
      <p className="text-sm text-dark-200 font-medium">{item.description}</p>
    </div>
  );
}

/**
 * Pricing page
 * Displays tour prices, group discounts, and what is included
 */
export default function PreisePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark-900 to-dark-950 pattern-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent" />
        <div className="container-custom relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold">
              Unsere <span className="text-neon-300">Preise</span>
            </h1>
            <p className="text-lg md:text-xl text-dark-100 max-w-2xl mx-auto">
              Transparent und fair. Wählt die Tour, die am besten zu euch passt,
              und startet euer Abenteuer in Warnemünde.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-dark-950 pattern-waves" />
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24 bg-dark-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {TOUR_PRICING.map((tour) => (
              <PricingCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* Group Discount Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-dark-950 to-dark-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="card-hover text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-white/5 border-2 border-white/20 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-neon-300">Gruppenrabatt</span>
              </h2>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-dark-800/50 border border-dark-700 p-6">
                    <div className="font-display text-3xl font-bold text-white">
                      10%
                    </div>
                    <p className="text-dark-200 font-medium mt-2">ab 6 Personen</p>
                  </div>
                  <div className="rounded-xl bg-dark-800/50 border border-dark-700 p-6">
                    <div className="font-display text-3xl font-bold text-white">
                      15%
                    </div>
                    <p className="text-dark-200 font-medium mt-2">ab 10 Personen</p>
                  </div>
                </div>

                <p className="text-dark-100">
                  Kontaktiert uns für individuelle Gruppenangebote bei
                  Firmenevents, Teambuilding oder Geburtstagsfeiern.
                </p>

                <Link href="/kontakt" className="btn btn-primary inline-flex">
                  Gruppenanfrage stellen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 md:py-24 bg-dark-900">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Das ist <span className="text-neon-300">inklusive</span>
            </h2>
            <p className="text-lg text-dark-200 font-medium max-w-2xl mx-auto">
              Bei jeder Tour sind diese Leistungen bereits im Preis enthalten.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {INCLUDED_ITEMS.map((item) => (
              <IncludedCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
