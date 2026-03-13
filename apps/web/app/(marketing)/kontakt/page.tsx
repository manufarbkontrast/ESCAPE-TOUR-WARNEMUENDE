import type { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Kontakt | Escape Tour Warnemünde',
  description:
    'Kontaktiert uns für Fragen, Buchungsanfragen oder Feedback zu unserer GPS-Escape-Tour durch Warnemünde.',
};

/**
 * Contact info item data type
 */
interface ContactInfoItem {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}

/**
 * Contact information entries
 */
const CONTACT_INFO: ReadonlyArray<ContactInfoItem> = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
    label: 'E-Mail',
    value: 'info@escape-tour-warnemuende.de',
    href: 'mailto:info@escape-tour-warnemuende.de',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    label: 'Adresse',
    value: 'Am Leuchtturm 1, 18119 Warnemünde',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
        />
      </svg>
    ),
    label: 'Telefon',
    value: '+49 381 123 4567',
    href: 'tel:+493811234567',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    label: 'Öffnungszeiten',
    value: 'Täglich 9-18 Uhr (Saison April-Oktober)',
  },
];

/**
 * Single contact info card
 */
function ContactInfoCard({ item }: { readonly item: ContactInfoItem }) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white">
        {item.icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-sand-400">{item.label}</h3>
        <p className="mt-1 text-sand-200">{item.value}</p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className="card-hover block hover:text-white transition-colors"
      >
        {content}
      </a>
    );
  }

  return <div className="card-hover">{content}</div>;
}

/**
 * Contact page
 * Two-column layout with contact form and contact information cards
 */
export default function KontaktPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-950 pattern-anchor">
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent" />
        <div className="container-custom relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-sand-200">Kontakt</span>
            </h1>
            <p className="text-lg md:text-xl text-sand-200 max-w-2xl mx-auto">
              Habt ihr Fragen zu unseren Touren, wollt eine Gruppenanfrage stellen
              oder uns einfach Feedback geben? Wir freuen uns auf eure Nachricht.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-navy-950 pattern-waves" />
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-navy-950">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left: Contact Form */}
            <div>
              <h2 className="font-display text-2xl font-bold text-sand-50 mb-6">
                Schreibt uns
              </h2>
              <ContactForm />
            </div>

            {/* Right: Contact Info Cards */}
            <div>
              <h2 className="font-display text-2xl font-bold text-sand-50 mb-6">
                So erreicht ihr uns
              </h2>
              <div className="space-y-4">
                {CONTACT_INFO.map((item) => (
                  <ContactInfoCard key={item.label} item={item} />
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 card-hover overflow-hidden">
                <div className="aspect-video bg-navy-800 flex items-center justify-center rounded-lg">
                  <div className="text-center space-y-3">
                    <svg
                      className="h-12 w-12 mx-auto text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                      />
                    </svg>
                    <p className="text-sand-400 text-sm">
                      Am Leuchtturm 1, 18119 Warnemünde
                    </p>
                    <a
                      href="https://maps.google.com/?q=Am+Leuchtturm+1,+18119+Warnem%C3%BCnde"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary text-sm px-4 py-2"
                    >
                      In Google Maps öffnen
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
