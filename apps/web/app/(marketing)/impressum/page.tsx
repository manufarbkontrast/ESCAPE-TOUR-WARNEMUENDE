import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export const metadata: Metadata = {
 title: 'Impressum | Escape Tour Warnemünde',
};

/**
 * Impressum page
 * Legal disclosure required by German law (Telemediengesetz)
 */
export default function ImpressumPage() {
 return (
  <LegalPageLayout title="Impressum" lastUpdated="01. Februar 2026">
   <div>
    <h2>Angaben gemäß 5 TMG</h2>
    <p>
     Escape Tour Warnemünde GmbH
     <br />
     Am Leuchtturm 1
     <br />
     18119 Rostock-Warnemünde
    </p>
   </div>

   <div>
    <h2>Vertreten durch</h2>
    <p>Max Mustermann (Geschäftsführer)</p>
   </div>

   <div>
    <h2>Kontakt</h2>
    <p>
     Telefon: +49 381 123 4567
     <br />
     E-Mail:{' '}
     <a href="mailto:info@escape-tour-warnemuende.de">
      info@escape-tour-warnemuende.de
     </a>
    </p>
   </div>

   <div>
    <h2>Registereintrag</h2>
    <p>
     Eintragung im Handelsregister
     <br />
     Registergericht: Amtsgericht Rostock
     <br />
     Registernummer: HRB 12345
    </p>
   </div>

   <div>
    <h2>Umsatzsteuer-Identifikationsnummer</h2>
    <p>
     Umsatzsteuer-Identifikationsnummer gemäß 27a
     Umsatzsteuergesetz: DE123456789
    </p>
   </div>

   <div>
    <h2>Verantwortlich für den Inhalt nach 55 Abs. 2 RStV</h2>
    <p>
     Max Mustermann
     <br />
     Am Leuchtturm 1
     <br />
     18119 Rostock-Warnemünde
    </p>
   </div>

   <div>
    <h2>Haftungsausschluss</h2>

    <h3>Haftung für Inhalte</h3>
    <p>
     Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
     die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können
     wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir
     gemäß 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
     allgemeinen Gesetzen verantwortlich. Nach 8 bis 10 TMG sind wir als
     Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
     gespeicherte fremde Informationen zu überwachen oder nach Umständen
     zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
     Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
     Informationen nach den allgemeinen Gesetzen bleiben hiervon
     unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
     Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
     Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
     Inhalte umgehend entfernen.
    </p>

    <h3>Haftung für Links</h3>
    <p>
     Unser Angebot enthält Links zu externen Websites Dritter, auf deren
     Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
     fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
     verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
     Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
     Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
     Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine
     permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
     konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
     Bekanntwerden von Rechtsverletzungen werden wir derartige Links
     umgehend entfernen.
    </p>

    <h3>Urheberrecht</h3>
    <p>
     Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
     Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
     Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
     Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
     jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
     sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
     Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
     wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden
     Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf
     eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
     entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
     werden wir derartige Inhalte umgehend entfernen.
    </p>
   </div>
  </LegalPageLayout>
 );
}
