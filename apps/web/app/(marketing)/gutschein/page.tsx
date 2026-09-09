import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { VoucherForm } from './voucher-form'
import { SITE, telHref } from '@/lib/config/site'
import { VOUCHER_VALIDITY_MONTHS } from '@/lib/vouchers/voucher'

export const metadata: Metadata = {
  title: 'Gutschein verschenken – Escape Tour Warnemünde',
  description:
    'Verschenkt eine Rätseltour durch Warnemünde: zwölf Stationen, iPad inklusive. Der Termin wird später gewählt, der Gutschein gilt zwölf Monate.',
  alternates: { canonical: '/gutschein' },
  openGraph: {
    title: 'Gutschein verschenken – Escape Tour Warnemünde',
    description:
      'Eine Rätseltour als Geschenk. Termin wählt die beschenkte Person selbst, zwölf Monate gültig.',
    url: 'https://myescapetour.com/gutschein',
  },
}

const REASONS = [
  {
    title: 'Kein Termin nötig',
    text: 'Ihr müsst nicht wissen, wann die beschenkte Person Zeit hat. Sie sucht sich den Tag selbst aus.',
  },
  {
    title: `${VOUCHER_VALIDITY_MONTHS} Monate gültig`,
    text: 'Genug Zeit, um auf gutes Wetter zu warten oder die passende Gelegenheit abzupassen.',
  },
  {
    title: 'Sofort da',
    text: 'Der Gutschein kommt direkt nach der Zahlung per E-Mail — zum Ausdrucken oder Weiterleiten.',
  },
] as const

export default function VoucherPage() {
  return (
    <div className="w-full">
      <section className="container-custom py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] text-coast-ink md:text-6xl">
              Verschenkt einen Nachmittag,
              <span className="mt-1 block text-coast-muted">nicht noch einen Gegenstand</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-coast-ink/75">
              Zwölf Rätselstationen durch Warnemünde, vom Leuchtturm über die Westmole bis zum Alten
              Strom. Das iPad bekommen sie von uns — mitzubringen sind nur Schuhe, in denen sich ein
              paar Kilometer laufen lässt.
            </p>

            <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-3">
              {REASONS.map((reason) => (
                <div key={reason.title} className="border-t border-white/15 pt-4">
                  <h2 className="text-base font-bold text-coast-ink">{reason.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-coast-muted">{reason.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 border-t border-white/[0.06] pt-8">
              <h2 className="text-lg font-bold text-coast-ink">So läuft es ab</h2>
              <ol className="mt-4 space-y-3 text-base leading-relaxed text-coast-ink/65">
                <li className="flex gap-3">
                  <span className="font-mono text-sm text-coast-sea">01</span>
                  Tour und Personenzahl wählen, bezahlen.
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-sm text-coast-sea">02</span>
                  Ihr bekommt den Gutschein per E-Mail und gebt ihn weiter.
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-sm text-coast-sea">03</span>
                  Die beschenkte Person löst den Code auf{' '}
                  <Link
                    href="/buchen"
                    className="text-coast-sea underline-offset-4 hover:underline"
                  >
                    der Buchungsseite
                  </Link>{' '}
                  ein und wählt ihren Termin.
                </li>
              </ol>
            </div>

            <p className="mt-8 text-sm text-coast-muted">
              Fragen zum Gutschein?{' '}
              <a
                href={telHref(SITE.phone.display)}
                className="font-mono tabular-nums text-coast-muted hover:text-coast-sea"
              >
                {SITE.phone.display}
              </a>{' '}
              ({SITE.phone.hours})
            </p>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Suspense fallback={<div className="card h-96" />}>
              <VoucherForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
