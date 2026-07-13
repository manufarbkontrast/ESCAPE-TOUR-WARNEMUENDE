import Link from 'next/link';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { LocationSelector } from '@/components/marketing/LocationSelector';

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
 * The location picker is the primary entry point; location-specific content
 * lives on each location's own tour page (e.g. /warnemuende).
 */
export default function HomePage() {
 return (
  <div className="w-full">
   {/* Hero Section */}
   <section id="standort" className="relative overflow-hidden scroll-mt-20">
    <div className="container-custom relative py-24 md:py-40">
     <div className="mx-auto max-w-3xl text-center space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2">
       <svg className="h-4 w-4 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
       </svg>
       <span className="text-base text-white font-semibold">Interaktive GPS-Escape-Touren</span>
      </div>

      {/* Headline */}
      <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white">
       Erlebt eure Stadt
       <span className="block text-white/90">als Escape-Abenteuer</span>
      </h1>

      {/* Description */}
      <p className="text-lg md:text-xl text-white/80 font-semibold max-w-2xl mx-auto leading-relaxed">
       Löst Rätsel an echten Orten, entdeckt versteckte Ecken und erlebt
       Städte per GPS-Escape-Tour auf eine ganz neue Art. Wählt euren
       Standort und legt los.
      </p>

      {/* Location selector + CTA */}
      <div className="pt-4 space-y-4">
       <LocationSelector />
       <div className="flex justify-center">
        <Link href="#ablauf" className="btn btn-ghost text-base px-6 py-3">
         Mehr erfahren
        </Link>
       </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
       <div>
        <div className="font-display text-3xl md:text-4xl font-bold text-white">
         2-4h
        </div>
        <div className="text-base text-white/70 font-semibold mt-1">Spielzeit</div>
       </div>
       <div>
        <div className="font-display text-3xl md:text-4xl font-bold text-white">
         10+
        </div>
        <div className="text-base text-white/70 font-semibold mt-1">Stationen</div>
       </div>
       <div>
        <div className="font-display text-3xl md:text-4xl font-bold text-white">
         3-5km
        </div>
        <div className="text-base text-white/70 font-semibold mt-1">Route</div>
       </div>
      </div>
     </div>
    </div>
   </section>

   {/* Value Proposition Strip */}
   <section className="py-12 md:py-16">
    <div className="container-custom">
     <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {/* Sofort spielbar */}
      <div className="flex flex-col items-center gap-3 text-center">
       <svg className="h-7 w-7 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
       </svg>
       <span className="text-base text-white font-semibold">Sofort spielbar</span>
      </div>

      {/* Jedes Wetter */}
      <div className="flex flex-col items-center gap-3 text-center">
       <svg className="h-7 w-7 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10a4 4 0 0 0-4-4 4.08 4.08 0 0 0-2.16.6A6 6 0 0 0 6 10a4 4 0 0 0 0 8h12a4 4 0 0 0 0-8z" />
       </svg>
       <span className="text-base text-white font-semibold">Jedes Wetter</span>
      </div>

      {/* Keine App nötig */}
      <div className="flex flex-col items-center gap-3 text-center">
       <svg className="h-7 w-7 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
       </svg>
       <span className="text-base text-white font-semibold">Keine App nötig</span>
      </div>

      {/* 2-5 km Route */}
      <div className="flex flex-col items-center gap-3 text-center">
       <svg className="h-7 w-7 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
       </svg>
       <span className="text-base text-white font-semibold">2-5 km Route</span>
      </div>
     </div>
    </div>
   </section>

   {/* How It Works Section */}
   <section id="ablauf" className="py-16 md:py-24 scroll-mt-20">
    <div className="container-custom">
     <div className="text-center space-y-4 mb-12">
      <h2 className="font-sans text-3xl md:text-4xl font-bold text-white">
       So <span className="text-neon-300">funktioniert&apos;s</span>
      </h2>
      <p className="text-lg text-white/70 font-semibold max-w-2xl mx-auto">
       In vier einfachen Schritten zu eurem Abenteuer
      </p>
     </div>

     <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {[
       {
        step: '1',
        title: 'Standort wählen',
        description: 'Wählt eure Stadt und die passende Tour',
        svgPath: 'M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z',
        hasPin: true,
       },
       {
        step: '2',
        title: 'Buchen',
        description: 'Bucht online und erhaltet euren Code',
        svgPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
       },
       {
        step: '3',
        title: 'Rätseln',
        description: 'Löst Rätsel an besonderen Orten',
        svgPath: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
       },
       {
        step: '4',
        title: 'Entdecken',
        description: 'Erlebt eure Stadt aus neuer Perspektive',
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
           ) : item.hasPin ? (
            <svg className="h-10 w-10 text-neon-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
             <path d={item.svgPath} />
             <circle cx="12" cy="10" r="3" />
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
        <h3 className="text-xl font-bold text-white">{item.title}</h3>
        <p className="text-base text-white/70 font-semibold">{item.description}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* FAQ Section */}
   <section id="faq" className="py-16 md:py-24 scroll-mt-20">
    <div className="container-custom">
     <div className="text-center space-y-4 mb-12">
      <h2 className="font-sans text-3xl md:text-4xl font-bold text-white">
       Häufig gestellte <span className="text-neon-300">Fragen</span>
      </h2>
      <p className="text-lg text-white/70 font-semibold max-w-2xl mx-auto">
       Alles was ihr vor eurer Tour wissen müsst
      </p>
     </div>

     <div className="max-w-3xl mx-auto">
      <FaqAccordion items={FAQ_ITEMS} />
     </div>
    </div>
   </section>

   {/* Final CTA Section */}
   <section className="py-20 md:py-32">
    <div className="container-custom text-center space-y-6">
     <h2 className="font-sans text-3xl md:text-4xl font-bold text-white">
      Bereit für euer <span className="text-neon-300">Abenteuer</span>?
     </h2>
     <p className="text-lg text-white/80 font-semibold max-w-xl mx-auto">
      Wählt euren Standort und legt sofort los
     </p>
     <div className="pt-4">
      <Link href="#standort" className="btn btn-primary btn-lg">
       Standort wählen
      </Link>
     </div>
    </div>
   </section>
  </div>
 );
}
