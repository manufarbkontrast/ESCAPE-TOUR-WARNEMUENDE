import type { Metadata } from 'next';
import Link from 'next/link';
import { RedeemForm } from './redeem-form';
import { SITE, telHref } from '@/lib/config/site';

export const metadata: Metadata = {
 title: 'Gutschein einlösen – Escape Tour Warnemünde',
 description:
  'Gutscheincode eingeben, Termin wählen, fertig. Die Tour ist bereits bezahlt — ihr braucht nur noch einen Tag.',
 alternates: { canonical: '/gutschein/einloesen' },
};

export default function RedeemPage() {
 return (
  <div className="w-full">
   <section className="container-custom py-16 md:py-24">
    <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
     <div>
      <h1 className="font-display text-4xl leading-[1.05] text-white md:text-5xl">
       Gutschein einlösen
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
       Code eingeben, Tag aussuchen, fertig. Die Tour ist bereits bezahlt —
       es geht nur noch darum, wann ihr loslaufen wollt.
      </p>

      <div className="mt-10 border-t border-white/[0.06] pt-8">
       <h2 className="text-lg font-bold text-white">Was danach passiert</h2>
       <p className="mt-3 max-w-xl text-base leading-relaxed text-white/65">
        Ihr bekommt einen Startcode per E-Mail. Damit kommt ihr{' '}
        {SITE.meetingPoint.minutesBefore} Minuten vor eurem Termin zu{' '}
        {SITE.meetingPoint.name} {SITE.meetingPoint.detail}, bekommt das iPad
        und eine kurze Einweisung. Dann läuft die Zeit.
       </p>
      </div>

      <p className="mt-8 text-sm text-white/50">
       Code verlegt oder abgelaufen?{' '}
       <a
        href={telHref(SITE.phone.display)}
        className="font-mono tabular-nums text-white/70 hover:text-neon-300"
       >
        {SITE.phone.display}
       </a>{' '}
       — wir finden den Kauf und helfen weiter.
      </p>

      <p className="mt-4 text-sm text-white/50">
       Noch keinen Gutschein?{' '}
       <Link href="/gutschein" className="text-neon-300 underline-offset-4 hover:underline">
        Hier verschenken
       </Link>
       .
      </p>
     </div>

     <div className="lg:sticky lg:top-24 lg:self-start">
      <RedeemForm />
     </div>
    </div>
   </section>
  </div>
 );
}
