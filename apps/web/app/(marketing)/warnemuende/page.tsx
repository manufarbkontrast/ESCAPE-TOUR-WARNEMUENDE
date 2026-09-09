import type { Metadata } from 'next'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'
import { TOUR_VARIANTS, formatPrice, type TourVariant } from '@/lib/config/tours'
import { FAQ_ITEMS } from '@/lib/config/faq'

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
}

/**
 * Key figures shown as an instrument-panel readout in the hero.
 */
const HERO_STATS = [
  { label: 'Spielzeit', value: '2–4 h' },
  { label: 'Stationen', value: '12' },
  { label: 'Route', value: '3–5 km' },
] as const

/**
 * Product promises — presented as a spec strip.
 */
const PROMISES = [
  {
    label: 'Einweisung vor Ort',
    path: 'M12 22s-8-5.5-8-12a8 8 0 1 1 16 0c0 6.5-8 12-8 12z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  },
  {
    label: 'Jedes Wetter',
    path: 'M18 10a4 4 0 0 0-4-4 4.08 4.08 0 0 0-2.16.6A6 6 0 0 0 6 10a4 4 0 0 0 0 8h12a4 4 0 0 0 0-8z',
  },
  {
    label: 'iPad inklusive',
    path: 'M5 2h14a0 0 0 0 1 0 0v20a0 0 0 0 1 0 0H5a0 0 0 0 1 0 0V2a0 0 0 0 1 0 0zM12 18h.01',
  },
  {
    label: '2–5 km Route',
    path: 'M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11zM12 7v3',
  },
] as const

/**
 * Four steps, shown as a technical numbered sequence.
 */
const STEPS = [
  { n: '01', title: 'Buchen', text: 'Wählt eure Tour und bucht online.' },
  {
    n: '02',
    title: 'Treffen',
    text: '20 Min vor eurem Slot zu Shoes Please am Leuchtturm — kurze Einweisung, dann Start.',
  },
  { n: '03', title: 'Rätseln', text: 'Löst Rätsel an historischen Orten.' },
  { n: '04', title: 'Entdecken', text: 'Erlebt Warnemünde aus neuer Perspektive.' },
] as const

/**
 * Tour variant card — reads prices and facts from the shared tour config so
 * the marketing pages and the checkout can never drift apart.
 */
function TourCard({ variant }: { readonly variant: TourVariant }) {
  return (
    <div className={cn('card-hover relative', variant.recommended && 'ring-1 ring-neon-400/40')}>
      {variant.recommended && (
        <div className="absolute -top-3 left-6">
          <span className="rounded bg-coast-ink px-2.5 py-1 text-xs font-bold text-coast-paper">
            Unsere Empfehlung
          </span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h3 className="text-2xl font-bold text-coast-ink">{variant.name}</h3>
          <p className="mt-2 text-base leading-relaxed text-coast-muted">{variant.ageLabel}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl text-coast-ink">
            {formatPrice(variant.priceCents)}&nbsp;&euro;
          </span>
          <span className="text-sm font-semibold text-coast-muted">pro Person</span>
        </div>

        <div className="grid grid-cols-3 gap-3 border-y border-coast-line py-4">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-coast-muted">
              Dauer
            </div>
            <div className="mt-1.5 font-mono text-sm tabular-nums text-coast-ink">
              {variant.duration}
            </div>
          </div>
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-coast-muted">
              Weg
            </div>
            <div className="mt-1.5 font-mono text-sm tabular-nums text-coast-ink">
              {variant.distance}
            </div>
          </div>
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-coast-muted">
              Rätsel
            </div>
            <div className="mt-1.5 font-mono text-sm text-coast-ink">{variant.difficulty}</div>
          </div>
        </div>

        <ul className="space-y-3">
          {variant.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-coast-sea"
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
              <span className="text-base font-semibold text-coast-ink/85">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/buchen?location=warnemuende&variant=${variant.id}`}
          className={cn('btn w-full', variant.recommended ? 'btn-primary' : 'btn-secondary')}
        >
          {variant.name} buchen
        </Link>
      </div>
    </div>
  )
}

/**
 * Verifiable facts about the booking, shown where testimonials used to sit.
 *
 * There are no published guest reviews yet. Inventing them would be a UWG
 * violation (§ 5b Abs. 3), so this section states things a guest can check
 * against the AGB instead.
 */
const BOOKING_FACTS = [
  {
    title: 'Kostenlose Stornierung',
    text: 'Innerhalb von 24 Stunden nach der Buchung storniert ihr kostenlos und bekommt den vollen Betrag zurück.',
  },
  {
    title: 'Code 12 Monate gültig',
    text: 'Danach verfällt nichts: Euer Buchungscode bleibt ein Jahr gültig und ist auf andere Personen übertragbar.',
  },
  {
    title: 'Gruppenrabatt',
    text: 'Ab 6 Personen 10 %, ab 10 Personen 15 % — wird im Buchungsschritt automatisch abgezogen.',
  },
] as const

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
            {/* Back to the start page */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-coast-ink/55 transition-colors hover:text-coast-ink"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Zur Startseite
            </Link>

            {/* Coordinate signature + eyebrow */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <span className="font-mono text-xs tabular-nums text-coast-sea/80">
                54.1766° N · 12.0837° E
              </span>
              <span className="eyebrow">Das Vermächtnis des Lotsenkapitäns</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 font-display text-5xl leading-[1.02] text-coast-ink md:text-7xl">
              Entdeckt Warnemünde
              <span className="mt-1 block text-coast-ink/55">auf eine ganz neue Art</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-coast-muted">
              Begebt euch auf eine spannende Escape-Tour durch Warnemünde. Löst Rätsel, entdeckt
              versteckte Orte und erlebt die maritime Geschichte des Ostseebades hautnah.
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
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-lg border border-coast-line bg-coast-ink/[0.02]">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="px-4 py-4">
                  <div className="eyebrow text-[0.65rem]">{stat.label}</div>
                  <div className="mt-1.5 font-mono text-xl tabular-nums text-coast-ink">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promises — spec strip */}
      <section className="container-custom pb-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-y divide-white/10 overflow-hidden rounded-xl border border-coast-line md:grid-cols-4 md:divide-y-0">
          {PROMISES.map((promise) => (
            <div key={promise.label} className="flex items-center gap-3 px-5 py-5">
              <svg
                className="h-5 w-5 flex-shrink-0 text-coast-sea"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={promise.path} />
              </svg>
              <span className="text-sm font-semibold text-coast-ink/85">{promise.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tour Variants */}
      <section id="touren" className="container-custom scroll-mt-20 py-20 md:py-28">
        <div className="max-w-2xl">
          <span className="eyebrow">Touren</span>
          <h2 className="mt-4 font-display text-4xl text-coast-ink md:text-5xl">
            Wählt eure perfekte Tour
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-coast-muted">
            Ob als Familie mit Kindern oder als anspruchsvolle Herausforderung – wir haben die
            richtige Tour für euch.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TOUR_VARIANTS.map((variant) => (
            <TourCard key={variant.id} variant={variant} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-coast-ink/55">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Sichere Zahlung
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Sofortige Bestätigung
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Flexibel stornierbar
          </div>
        </div>
      </section>

      {/* Booking conditions — verifiable, unlike testimonials we do not have yet */}
      <section className="border-t border-white/[0.06] py-20 md:py-28">
        <div className="container-custom">
          <h2 className="max-w-2xl font-display text-4xl text-coast-ink md:text-5xl">
            Ohne Risiko buchen
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BOOKING_FACTS.map((fact) => (
              <div key={fact.title} className="card">
                <h3 className="text-xl font-bold text-coast-ink">{fact.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-coast-ink/65">{fact.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-coast-muted">
            Es gelten unsere{' '}
            <Link href="/agb" className="text-coast-sea underline-offset-4 hover:underline">
              AGB
            </Link>
            .
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="ablauf" className="container-custom scroll-mt-20 py-20 md:py-28">
        <div className="max-w-2xl">
          <span className="eyebrow">Ablauf</span>
          <h2 className="mt-4 font-display text-4xl text-coast-ink md:text-5xl">
            In vier Schritten zum Abenteuer
          </h2>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="border-t border-white/15 pt-5">
              <div className="font-mono text-sm tabular-nums text-coast-sea">{step.n}</div>
              <h3 className="mt-3 text-lg font-bold text-coast-ink">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-coast-muted">{step.text}</p>
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
              <h2 className="mt-4 font-display text-4xl text-coast-ink md:text-5xl">
                Gut zu wissen
              </h2>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-coast-muted">
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
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-coast-line bg-coast-ink/[0.02] px-8 py-16 text-center md:py-20">
          <div className="hero-beam" aria-hidden="true" />
          <div className="relative">
            <span className="eyebrow">Los geht&apos;s</span>
            <h2 className="mx-auto mt-4 max-w-xl font-display text-4xl text-coast-ink md:text-5xl">
              Bereit für euer Abenteuer?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-coast-ink/65">
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
  )
}
