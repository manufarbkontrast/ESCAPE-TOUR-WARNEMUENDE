import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = {
 title: 'Touren | Escape Tour Warnemünde',
 description:
  'Entdeckt unsere GPS-Escape-Touren durch Warnemünde. Familien-Tour und Erwachsenen-Tour mit interaktiven Rätseln und Live-GPS-Navigation.',
};

/**
 * Route highlight data type
 */
interface RouteHighlight {
 readonly name: string;
 readonly description: string;
}

/**
 * Tour detail data type
 */
interface TourDetail {
 readonly id: string;
 readonly name: string;
 readonly tagline: string;
 readonly description: string;
 readonly duration: string;
 readonly difficulty: string;
 readonly distance: string;
 readonly minAge: string;
 readonly highlights: ReadonlyArray<RouteHighlight>;
 readonly expectations: ReadonlyArray<string>;
}

/**
 * Tour details configuration
 */
const TOUR_DETAILS: ReadonlyArray<TourDetail> = [
 {
  id: 'family',
  name: 'Familien-Tour',
  tagline: 'Das Vermächtnis des Lotsenkapitäns - Familienedition',
  description:
   'Begebt euch als Familie auf die Spuren des legendären Lotsenkapitäns Friedrich von Warnemünde. Diese Tour wurde speziell für Familien mit Kindern ab 8 Jahren entwickelt. Die Rätsel sind altersgerecht gestaltet und verbinden spielerisches Lernen mit spannender Unterhaltung. Auf einer kürzeren Route durch die schönsten Ecken Warnemündes erlebt ihr gemeinsam ein unvergessliches Abenteuer, das Neugier weckt und Teamwork fördert.',
  duration: '2-3 Stunden',
  difficulty: 'Leicht',
  distance: '3 km',
  minAge: 'Ab 8 Jahren',
  highlights: [
   {
    name: 'Leuchtturm',
    description:
     'Euer Abenteuer beginnt am Wahrzeichen Warnemündes. Hier erhaltet ihr die erste Botschaft des Lotsenkapitäns.',
   },
   {
    name: 'Alter Strom',
    description:
     'Schlendert entlang des historischen Hafenkanals und entschlüsselt maritime Rätsel an den bunten Fischerhäusern.',
   },
   {
    name: 'Kirchplatz',
    description:
     'Am Platz der alten Kirche wartet ein kniffliges Rätsel, das eure Kombinationsgabe auf die Probe stellt.',
   },
   {
    name: 'Strand',
    description:
     'Das große Finale erwartet euch am Ostseestrand. Löst das letzte Rätsel und lüftet das Geheimnis des Kapitäns.',
   },
  ],
  expectations: [
   'Kinderfreundliche Rätsel, die Spaß machen und zum Mitmachen einladen',
   'Kurze Laufwege mit vielen Möglichkeiten für Pausen',
   'Spannende Geschichten rund um die maritime Geschichte Warnemündes',
   'Ein Erlebnis, das die ganze Familie zusammenbringt',
   'Flexibles Tempo - pausiert und startet wann ihr wollt',
  ],
 },
 {
  id: 'adult',
  name: 'Erwachsenen-Tour',
  tagline: 'Das Vermächtnis des Lotsenkapitäns - Die volle Herausforderung',
  description:
   'Taucht ein in die fesselnde Geschichte des Lotsenkapitäns Friedrich von Warnemünde und folgt seinen verschlüsselten Hinweisen durch das Ostseebad. Diese Tour richtet sich an Erwachsene und Jugendliche ab 14 Jahren, die eine echte Herausforderung suchen. Auf einer erweiterten Route entdeckt ihr verborgene Orte, löst anspruchsvolle Rätsel und erfahrt faszinierende historische Details, die selbst Einheimischen unbekannt sind. Jede Station bringt euch dem Geheimnis des Kapitäns einen Schritt näher.',
  duration: '3-4 Stunden',
  difficulty: 'Mittel',
  distance: '5 km',
  minAge: 'Ab 14 Jahren',
  highlights: [
   {
    name: 'Leuchtturm',
    description:
     'Am Leuchtturm beginnt eure Mission. Der erste verschlüsselte Hinweis des Kapitäns stellt euch vor eine knifflige Aufgabe.',
   },
   {
    name: 'Hafenviertel',
    description:
     'Im historischen Hafenviertel folgt ihr den Spuren alter Handelsrouten und dechiffriert maritime Codes.',
   },
   {
    name: 'Lotsenturm',
    description:
     'Am ehemaligen Lotsenturm erwartet euch ein mehrstufiges Rätsel, das Geschick und Wissen vereint.',
   },
   {
    name: 'Geheime Passage',
    description:
     'Eine versteckte Passage führt euch zum dramatischen Finale. Hier enthüllt ihr das letzte Geheimnis des Kapitäns.',
   },
  ],
  expectations: [
   'Anspruchsvolle Rätsel, die logisches Denken und Kreativität erfordern',
   'Tiefe historische Einblicke in die maritime Geschichte Warnemündes',
   'Versteckte Orte, die nicht im Reiseführer stehen',
   'Mehrstufige Rätsel mit steigendem Schwierigkeitsgrad',
   'Ein gestuftes Hinweissystem, wenn ihr mal nicht weiterkommt',
  ],
 },
];

/**
 * Feature card data type
 */
interface FeatureCard {
 readonly icon: React.ReactNode;
 readonly title: string;
 readonly description: string;
}

/**
 * Unique selling points
 */
const FEATURE_CARDS: ReadonlyArray<FeatureCard> = [
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
  title: 'Live GPS-Navigation',
  description:
   'Euer Smartphone führt euch in Echtzeit von Station zu Station. Die interaktive Karte zeigt euch den Weg, sodass ihr euch voll auf die Rätsel konzentrieren könnt. Kein Verirren, kein Suchen nach dem nächsten Standort.',
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
  title: '10 einzigartige Rätseltypen',
  description:
   'Von klassischen Logikrätseln über Bilderrätsel bis hin zu Augmented-Reality-Challenges. Jedes Rätsel ist einzigartig gestaltet und nutzt die Besonderheiten des jeweiligen Standorts. Langeweile? Ausgeschlossen.',
 },
 {
  icon: (
   <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
     strokeLinecap="round"
     strokeLinejoin="round"
     strokeWidth={1.5}
     d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
   </svg>
  ),
  title: 'Offline-fähig',
  description:
   'Einmal gestartet, funktioniert die Tour auch ohne Internetverbindung. Alle Rätsel, Hinweise und Karteninhalte werden vorab geladen. Perfekt für Gebiete mit schwachem Empfang direkt an der Küste.',
 },
];

/**
 * Tour detail section component
 */
function TourSection({ tour, isReversed }: { readonly tour: TourDetail; readonly isReversed: boolean }) {
 return (
  <div className="space-y-12">
   {/* Tour Header */}
   <div className={cn('max-w-3xl', isReversed ? 'ml-auto text-right' : '')}>
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur mb-4">
     <span className="text-white">
      {tour.difficulty} &middot; {tour.distance} &middot; {tour.duration}
     </span>
    </div>
    <h2 className="text-3xl md:text-4xl font-bold text-white">
     {tour.name}
    </h2>
    <p className="text-white font-semibold mt-2">{tour.tagline}</p>
    <p className="text-white/80 mt-4 leading-relaxed">{tour.description}</p>
   </div>

   {/* Routen-Highlights */}
   <div>
    <h3 className="text-xl font-semibold text-white mb-6">
     Routen-Highlights
    </h3>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
     {tour.highlights.map((highlight, index) => (
      <div key={highlight.name} className="card-hover space-y-3">
       <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-dark-950 font-bold text-sm">
         {index + 1}
        </div>
        <h4 className="text-lg font-semibold text-white">
         {highlight.name}
        </h4>
       </div>
       <p className="text-sm text-white/70 font-semibold">{highlight.description}</p>
      </div>
     ))}
    </div>
   </div>

   {/* What to Expect */}
   <div className="card-hover">
    <h3 className="text-xl font-semibold text-white mb-4">
     Was euch erwartet
    </h3>
    <ul className="space-y-3">
     {tour.expectations.map((item) => (
      <li key={item} className="flex items-start gap-3">
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
       <span className="text-white/80">{item}</span>
      </li>
     ))}
    </ul>

    <div className="mt-8 flex flex-col sm:flex-row gap-4">
     <Link
      href={`/buchen?variant=${tour.id}`}
      className="btn btn-primary"
     >
      {tour.name} buchen - ab {tour.id === 'family' ? '24,90' : '29,90'}€
     </Link>
     <Link href="/preise" className="btn btn-ghost">
      Alle Preise ansehen
     </Link>
    </div>
   </div>
  </div>
 );
}

/**
 * Feature highlight card component
 */
function FeatureHighlightCard({ feature }: { readonly feature: FeatureCard }) {
 return (
  <div className="card-hover space-y-4">
   <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
    {feature.icon}
   </div>
   <h3 className="text-xl font-semibold text-white">
    {feature.title}
   </h3>
   <p className="text-white/70 font-semibold leading-relaxed">{feature.description}</p>
  </div>
 );
}

/**
 * Tours overview page
 * Detailed information about each tour variant and unique selling points
 */
export default function TourenPage() {
 return (
  <div className="w-full">
   {/* Hero Section */}
   <section className="relative overflow-hidden ">
    <div className="container-custom relative py-20 md:py-28">
     <div className="mx-auto max-w-3xl text-center space-y-6">
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold">
       Unsere <span className="text-neon-300">Touren</span>
      </h1>
      <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
       Entdeckt Warnemünde mit einer interaktiven GPS-Escape-Tour.
       Zwei Tourvarianten, ein unvergessliches Erlebnis.
      </p>
     </div>
    </div>
   </section>

   {/* Tour Detail Sections */}
   {TOUR_DETAILS.map((tour, index) => (
    <section
     key={tour.id}
     className={cn(
      'py-16 md:py-24',
      index % 2 === 0
       ? 'bg-dark-950'
       : ''
     )}
    >
     <div className="container-custom">
      <TourSection tour={tour} isReversed={index % 2 !== 0} />
     </div>

     {/* Divider between tours */}
     {index < TOUR_DETAILS.length - 1 && (
      <div className="container-custom mt-20">
       <div className="border-t border-white/10" />
      </div>
     )}
    </section>
   ))}

   {/* What Makes Us Special */}
   <section className="py-16 md:py-24">
    <div className="container-custom">
     <div className="text-center space-y-4 mb-12">
      <h2 className="text-3xl md:text-4xl font-bold">
       Was macht unsere Tour{' '}
       <span className="text-neon-300">besonders?</span>
      </h2>
      <p className="text-lg text-white/70 font-semibold max-w-2xl mx-auto">
       Modernste Technologie trifft auf spannende Geschichten. Das
       unterscheidet uns von einer gewöhnlichen Stadtführung.
      </p>
     </div>

     <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {FEATURE_CARDS.map((feature) => (
       <FeatureHighlightCard key={feature.title} feature={feature} />
      ))}
     </div>
    </div>
   </section>

   {/* Final CTA */}
   <section className="py-16 md:py-24 ">
    <div className="container-custom">
     <div className="max-w-3xl mx-auto text-center space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold">
       Bereit für euer{' '}
       <span className="text-neon-300">Abenteuer?</span>
      </h2>
      <p className="text-lg text-white/80">
       Wählt eure Tour und startet wann immer ihr wollt. Die Rätsel des
       Lotsenkapitäns warten auf euch.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
       <Link href="/buchen?variant=family" className="btn btn-secondary">
        Familien-Tour buchen
       </Link>
       <Link href="/buchen?variant=adult" className="btn btn-primary">
        Erwachsenen-Tour buchen
       </Link>
      </div>
     </div>
    </div>
   </section>
  </div>
 );
}
