import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TOUR_VARIANTS, LOWEST_PRICE_CENTS, formatPrice } from '@/lib/config/tours'
import { FAQ_ITEMS } from '@/lib/config/faq'
import { SITE, telHref } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Escape Tour Warnemünde – Euer Rätselabenteuer an der Ostsee',
  description: `Entdeckt Warnemünde als Team: zwölf Rätselstationen, ein iPad und persönliche Einweisung am Leuchtturm. Ab ${formatPrice(LOWEST_PRICE_CENTS)} € pro Person.`,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Escape Tour Warnemünde – Euer Rätselabenteuer an der Ostsee',
    description:
      'Zwölf Rätsel, euer Team und ein iPad. Entdeckt Warnemünde auf den Spuren des Lotsenkapitäns.',
    url: '/',
  },
}
const TOUR_COPY = {
  family: {
    tag: 'Zusammen staunen',
    description: 'Für kleine Spürnasen und große Entdecker. Hier rätseln alle mit.',
  },
  adult: {
    tag: 'Gemeinsam kombinieren',
    description: 'Für Freunde, Paare und alle, die gern eine Spur weiterdenken.',
  },
  pro: {
    tag: 'Eine Spur kniffliger',
    description: 'Für erfahrene Rätselteams, die sich gern so richtig festbeißen.',
  },
}
export default function HomePage() {
  return (
    <div className="et-home">
      <section className="et-wrap et-hero">
        <div className="et-hero-copy">
          <div className="et-eyebrow">Euer Outdoor-Abenteuer an der Ostsee</div>
          <h1>
            Frische Seeluft.
            <br />
            Knifflige Rätsel.
            <br />
            <em>Eure Geschichte.</em>
          </h1>
          <p className="et-intro">
            Entdeckt Warnemünde auf den Spuren des Lotsenkapitäns. Zwölf Rätsel, euer Team und ein
            iPad – den Rest findet ihr gemeinsam heraus.
          </p>
          <div className="et-actions">
            <Link href="#preise" className="et-btn">
              Findet eure Tour{' '}
              <span className="et-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
            <Link href="#ablauf" className="et-textlink">
              So funktioniert’s ↓
            </Link>
          </div>
          <div className="et-facts">
            <span>
              <b>Ab {formatPrice(LOWEST_PRICE_CENTS)} €</b> / Person
            </span>
            <span>
              <b>2–5 Stunden</b>
            </span>
            <span>
              <b>iPad inklusive</b>
            </span>
          </div>
        </div>
        <div className="et-hero-visual">
          <Image
            src="/images/stations/01_leuchtturm.webp"
            alt="Leuchtturm und Strandkörbe am Strand von Warnemünde"
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
            width={1248}
            height={832}
          />
          <span className="et-photo-label">54°10′ N &nbsp; 12°05′ E</span>
          <div className="et-compass" aria-hidden="true">
            N<span>✧</span>
          </div>
          <div className="et-photo-note">
            <span className="et-number">12</span>
            <div>
              <strong>Stationen. Ein gemeinsames Abenteuer.</strong>
              <small>Start & Ziel: am Leuchtturm in Warnemünde</small>
            </div>
          </div>
        </div>
      </section>
      <div className="et-wrap et-benefits">
        <div className="et-benefit">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <rect x="6" y="2" width="16" height="24" rx="2" />
            <path d="M12 22h4" />
          </svg>
          <div>
            <strong>Alles startklar</strong>
            <small>Vorbereitetes iPad inklusive</small>
          </div>
        </div>
        <div className="et-benefit">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <path d="M14 26s9-10 9-16a9 9 0 0 0-18 0c0 6 9 16 9 16z" />
            <circle cx="14" cy="10" r="3" />
          </svg>
          <div>
            <strong>Persönlich vor Ort</strong>
            <small>Einweisung am Leuchtturm</small>
          </div>
        </div>
        <div className="et-benefit">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="14" cy="14" r="11" />
            <path d="M14 6v8l5 3" />
          </svg>
          <div>
            <strong>Euer eigenes Tempo</strong>
            <small>Mit Zeit für eine Pause</small>
          </div>
        </div>
        <div className="et-benefit">
          <svg viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="10" cy="8" r="4" />
            <path d="M2 25v-4a8 8 0 0 1 16 0v4M20 4a4 4 0 0 1 0 8M21 16a6 6 0 0 1 5 6v3" />
          </svg>
          <div>
            <strong>Zusammen unterwegs</strong>
            <small>Für Familien & Rätselteams</small>
          </div>
        </div>
      </div>
      <section id="ablauf" className="et-wrap et-section">
        <div className="et-section-head">
          <div>
            <div className="et-eyebrow">Weniger planen. Mehr erleben.</div>
            <h2>
              Einfach ankommen.
              <br />
              Gemeinsam loslegen.
            </h2>
          </div>
          <p>
            Eine Stadt voller Geschichten. Und ihr mittendrin. Für eure Tour braucht ihr weder eine
            eigene App noch Rätselerfahrung.
          </p>
        </div>
        <div className="et-steps">
          <article className="et-step">
            <span className="et-n">01</span>
            <h3>Eure Tour aussuchen</h3>
            <p>Wählt den Schwierigkeitsgrad, der zu euch passt, und euren Wunschtermin.</p>
          </article>
          <article className="et-step">
            <span className="et-n">02</span>
            <h3>Am Leuchtturm starten</h3>
            <p>
              Kommt 20 Minuten vorher zu Shoes Please. Ihr bekommt euer iPad und eine persönliche
              Einweisung.
            </p>
          </article>
          <article className="et-step">
            <span className="et-n">03</span>
            <h3>Warnemünde entschlüsseln</h3>
            <p>Folgt den Hinweisen, kombiniert als Team und entdeckt den Ort mit neuen Augen.</p>
          </article>
        </div>
      </section>
      <section id="preise" className="et-tours">
        <div className="et-wrap et-section">
          <div className="et-section-head">
            <div>
              <div className="et-eyebrow">Für kleine und große Entdecker</div>
              <h2>Euer Team. Eure Herausforderung.</h2>
            </div>
            <p>
              Von neugierig bis rätselerprobt: Findet die passende Tour. Das iPad ist immer dabei.
            </p>
          </div>
          <div className="et-cards">
            {TOUR_VARIANTS.map((tour) => (
              <article className={`et-card${tour.recommended ? ' et-featured' : ''}`} key={tour.id}>
                <span className="et-tag">
                  {TOUR_COPY[tour.id].tag} · {tour.ageLabel}
                </span>
                <h3>{tour.name}</h3>
                <p>{TOUR_COPY[tour.id].description}</p>
                <div className="et-price">
                  <strong>{formatPrice(tour.priceCents)} €</strong>
                  <small>pro Person</small>
                </div>
                <div className="et-spec">
                  <span>{tour.duration}</span>
                  <span>{tour.distance}</span>
                  <span>{tour.difficulty}</span>
                </div>
                <ul>
                  {tour.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link
                  className={`et-btn ${tour.recommended ? 'et-light' : 'et-outline'}`}
                  href={`/buchen?location=warnemuende&variant=${tour.id}`}
                >
                  {tour.name} wählen <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
          <p className="et-group-note">
            Ihr kommt mit einer größeren Gruppe? Ab 6 Personen spart ihr 10 %, ab 10 Personen 15 %.
          </p>
        </div>
      </section>
      <section className="et-wrap et-section et-route">
        <div className="et-route-img">
          <Image
            src="/images/stations/10_alter_strom.webp"
            alt="Fischerboote und Häuser am Alten Strom in Warnemünde"
            sizes="(max-width: 760px) 100vw, 50vw"
            width={1280}
            height={560}
          />
          <div className="et-caption">
            <span>Unterwegs am Alten Strom</span>
            <span>Warnemünde · Ostsee</span>
          </div>
        </div>
        <div>
          <div className="et-eyebrow">Vertraute Orte. Neue Geheimnisse.</div>
          <h2>
            Hinter jeder Ecke
            <br />
            wartet eine Geschichte.
          </h2>
          <p>
            Vom Leuchtturm zum Teepott, durch kleine Gassen bis zum Alten Strom: Eure Route
            verbindet Warnemündes besondere Orte mit dem rätselhaften Vermächtnis des
            Lotsenkapitäns.
          </p>
          <p style={{ marginTop: 14 }}>
            Schaut genauer hin, entdeckt versteckte Hinweise und nehmt euch zwischendurch Zeit für
            den Blick aufs Wasser.
          </p>
          <div className="et-stops">
            <span>Leuchtturm</span>
            <span className="et-dot"></span>
            <span>Teepott</span>
            <span className="et-dot"></span>
            <span>Alter Strom</span>
          </div>
        </div>
      </section>
      <section id="fragen" className="et-wrap et-section et-faq">
        <div>
          <div className="et-eyebrow">Gut zu wissen</div>
          <h2>
            Noch eine Frage
            <br />
            im Gepäck?
          </h2>
          <p>
            Wir helfen euch gerne persönlich weiter.
            <br />
            <Link href={telHref(SITE.phone.display)}>{SITE.phone.display} ↗</Link>
          </p>
        </div>
        <div className="et-accordion">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="et-closing">
        <div className="et-eyebrow">Der nächste Hinweis wartet schon</div>
        <h2>
          Raus an die Luft.
          <br />
          Rein ins Abenteuer.
        </h2>
        <p>Euer gemeinsamer Tag in Warnemünde beginnt hier.</p>
        <Link className="et-btn et-light" href="#preise">
          Eure Tour entdecken{' '}
          <span className="et-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </section>
    </div>
  )
}
