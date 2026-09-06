import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OCCASIONS, getOccasion } from '@/lib/config/occasions';
import { getTourVariant, formatPrice } from '@/lib/config/tours';
import { SITE, telHref } from '@/lib/config/site';

interface PageProps {
 readonly params: Promise<{ readonly slug: string }>;
}

/** All four pages are static — the content never changes at runtime. */
export function generateStaticParams() {
 return OCCASIONS.map((occasion) => ({ slug: occasion.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
 const { slug } = await params;
 const occasion = getOccasion(slug);

 if (!occasion) {
  return { title: 'Seite nicht gefunden' };
 }

 const url = `https://myescapetour.com/fuer/${occasion.slug}`;

 return {
  title: occasion.metaTitle,
  description: occasion.metaDescription,
  alternates: { canonical: `/fuer/${occasion.slug}` },
  openGraph: {
   title: occasion.metaTitle,
   description: occasion.metaDescription,
   url,
  },
 };
}

export default async function OccasionPage({ params }: PageProps) {
 const { slug } = await params;
 const occasion = getOccasion(slug);

 if (!occasion) {
  notFound();
 }

 const variant = getTourVariant(occasion.recommendedVariant);
 const bookingHref = `/buchen?location=warnemuende&variant=${occasion.recommendedVariant}`;
 const enquiryHref = `/kontakt?anlass=${occasion.slug}`;

 return (
  <div className="w-full">
   <section className="container-custom py-16 md:py-24">
    <Link
     href="/"
     className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/55 transition-colors hover:text-white"
    >
     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
     </svg>
     Escape Tour Warnemünde
    </Link>

    <div className="mt-8 max-w-3xl">
     <h1 className="font-display text-4xl leading-[1.05] text-white md:text-6xl">
      {occasion.headline}
     </h1>
     <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
      {occasion.intro}
     </p>
    </div>

    {/* The numbers this group asks about before anything else. */}
    <div className="mt-10 grid max-w-3xl grid-cols-2 divide-x divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 sm:grid-cols-4 sm:divide-y-0">
     {occasion.facts.map((fact) => (
      <div key={fact.label} className="px-5 py-4">
       <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">
        {fact.label}
       </div>
       <div className="mt-1.5 font-mono text-base tabular-nums text-white">{fact.value}</div>
      </div>
     ))}
    </div>

    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
     <Link href={bookingHref} className="btn btn-primary btn-lg">
      Termin buchen
     </Link>
     {/* Groups rarely pay by card for twenty people — they want to ask first. */}
     <Link href={enquiryHref} className="btn btn-secondary btn-lg">
      Gruppe anfragen
     </Link>
    </div>
   </section>

   <section className="border-t border-white/[0.06] py-16 md:py-20">
    <div className="container-custom">
     <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
      {occasion.reasons.map((reason) => (
       <div key={reason.title} className="border-t border-white/15 pt-5">
        <h2 className="text-lg font-bold text-white">{reason.title}</h2>
        <p className="mt-2 text-base leading-relaxed text-white/60">{reason.text}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {variant && (
    <section className="border-t border-white/[0.06] py-16 md:py-20">
     <div className="container-custom">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
       <div>
        <h2 className="font-display text-3xl text-white md:text-4xl">
         Unsere Empfehlung für euch
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/65">
         {occasion.recommendationReason}
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
         Alle drei Varianten laufen dieselbe Route mit denselben zwölf
         Stationen — sie unterscheiden sich darin, wie hart die Rätsel sind.
         Wenn eine andere besser passt, sagt Bescheid.
        </p>
       </div>

       <div className="card">
        <h3 className="text-2xl font-bold text-white">{variant.name}</h3>
        <p className="mt-1 text-sm font-semibold text-white/50">{variant.ageLabel}</p>

        <div className="mt-6 flex items-baseline gap-2">
         <span className="font-display text-4xl text-white">
          {formatPrice(variant.priceCents)}&nbsp;€
         </span>
         <span className="text-sm font-semibold text-white/50">pro Person</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-4">
         <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Dauer</div>
          <div className="mt-1 font-mono text-sm tabular-nums text-white">{variant.duration}</div>
         </div>
         <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Weg</div>
          <div className="mt-1 font-mono text-sm tabular-nums text-white">{variant.distance}</div>
         </div>
         <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Rätsel</div>
          <div className="mt-1 font-mono text-sm text-white">{variant.difficulty}</div>
         </div>
        </div>

        <Link href={bookingHref} className="btn btn-primary mt-6 w-full">
         {variant.name} buchen
        </Link>
       </div>
      </div>
     </div>
    </section>
   )}

   <section className="border-t border-white/[0.06] py-16 md:py-24">
    <div className="container-custom">
     <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
       <h2 className="font-display text-3xl text-white md:text-4xl">
        Größere Gruppe? Kurz anrufen.
       </h2>
       <p className="mt-4 text-lg leading-relaxed text-white/65">
        Ab etwa zehn Personen stimmen wir Startzeiten und Geräte lieber
        einmal persönlich ab, als dass ihr im Buchungsformular raten müsst.
        Treffpunkt ist {SITE.meetingPoint.name} {SITE.meetingPoint.detail},
        {' '}{SITE.meetingPoint.minutesBefore} Minuten vor dem Slot.
       </p>
       <a
        href={telHref(SITE.phone.display)}
        className="mt-6 inline-block font-mono text-2xl tabular-nums text-white transition-colors hover:text-neon-300"
       >
        {SITE.phone.display}
       </a>
       <div className="mt-1 text-sm text-white/50">{SITE.phone.hours}</div>
      </div>

      <Link href={enquiryHref} className="btn btn-secondary btn-lg self-start md:self-auto">
       Anfrage schreiben
      </Link>
     </div>
    </div>
   </section>
  </div>
 );
}
