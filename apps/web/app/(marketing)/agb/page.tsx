import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export const metadata: Metadata = {
  title: 'AGB | Escape Tour Warnemuende',
};

/**
 * AGB (Terms and Conditions) page
 * General Terms and Conditions for the Escape Tour service
 */
export default function AGBPage() {
  return (
    <LegalPageLayout
      title="Allgemeine Geschaeftsbedingungen (AGB)"
      lastUpdated="01. Februar 2026"
    >
      {/* Scope */}
      <div>
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschaeftsbedingungen (AGB) gelten fuer alle
          Buchungen und die Durchfuehrung von Escape Touren, die ueber die
          Website escape-tour-warnemuende.de angeboten werden. Anbieter ist die
          Escape Tour Warnemuende GmbH, Am Leuchtturm 1, 18119
          Rostock-Warnemuende (im Folgenden &quot;Anbieter&quot;).
        </p>
        <p>
          Mit der Buchung einer Tour erkennt der Kunde diese AGB an.
          Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei
          denn, der Anbieter stimmt ihrer Geltung ausdruecklich schriftlich zu.
        </p>
      </div>

      {/* Contract and Booking */}
      <div>
        <h2>2. Vertragsschluss und Buchung</h2>
        <p>
          Die Darstellung der Touren auf der Website stellt kein rechtlich
          bindendes Angebot dar, sondern eine Aufforderung zur Buchung
          (invitatio ad offerendum).
        </p>
        <p>
          Der Buchungsvorgang laeuft wie folgt ab:
        </p>
        <ul>
          <li>
            Der Kunde waehlt eine Tour-Variante und die Anzahl der Teilnehmer
            aus.
          </li>
          <li>
            Durch Absenden der Buchung gibt der Kunde ein verbindliches Angebot
            ab.
          </li>
          <li>
            Der Vertrag kommt durch die Buchungsbestaetigungs-E-Mail des
            Anbieters zustande.
          </li>
          <li>
            Der Kunde erhaelt einen Buchungscode, mit dem die Tour gestartet
            werden kann.
          </li>
        </ul>
        <p>
          Die Tour kann innerhalb von 12 Monaten nach Buchung gestartet werden.
          Der Buchungscode ist uebertragbar.
        </p>
      </div>

      {/* Prices and Payment */}
      <div>
        <h2>3. Preise und Zahlung</h2>
        <p>
          Alle angegebenen Preise sind Endpreise und verstehen sich inklusive
          der gesetzlichen Mehrwertsteuer. Es fallen keine zusaetzlichen
          Gebuehren an.
        </p>
        <p>
          Die Zahlung erfolgt bei der Buchung ueber einen der angebotenen
          Zahlungswege (Kreditkarte, PayPal, Sofortueberweisung). Der
          Rechnungsbetrag wird unmittelbar nach der Buchung eingezogen.
        </p>
      </div>

      {/* Cancellation */}
      <div>
        <h2>4. Stornierung und Ruecktritt</h2>
        <p>
          Fuer Stornierungen gelten folgende Regelungen:
        </p>
        <ul>
          <li>
            <strong>Kostenlose Stornierung:</strong> Innerhalb von 24 Stunden
            nach der Buchung kann die Tour kostenlos storniert werden. Der
            vollstaendige Buchungsbetrag wird erstattet.
          </li>
          <li>
            <strong>Stornierung nach 24 Stunden:</strong> Nach Ablauf der
            24-Stunden-Frist ist eine Stornierung nicht mehr moeglich. Der
            Buchungscode bleibt 12 Monate gueltig und kann auf andere Personen
            uebertragen werden.
          </li>
          <li>
            <strong>Widerrufsrecht:</strong> Als Verbraucher steht Ihnen ein
            gesetzliches Widerrufsrecht von 14 Tagen zu, sofern die Tour noch
            nicht gestartet wurde.
          </li>
        </ul>
        <p>
          Stornierungen koennen per E-Mail an{' '}
          <a href="mailto:info@escape-tour-warnemuende.de">
            info@escape-tour-warnemuende.de
          </a>{' '}
          unter Angabe des Buchungscodes vorgenommen werden.
        </p>
      </div>

      {/* Tour Execution */}
      <div>
        <h2>5. Durchfuehrung der Tour</h2>

        <h3>Technische Voraussetzungen</h3>
        <p>
          Fuer die Durchfuehrung der Tour wird ein GPS-faehiges Smartphone mit
          aktiver Internetverbindung und aktivierter Standortfreigabe im Browser
          benoetigt. Der Anbieter uebernimmt keine Haftung fuer technische
          Einschraenkungen aufgrund des verwendeten Endgeraets oder der
          Netzabdeckung.
        </p>

        <h3>Mindestalter</h3>
        <p>
          Die Familien-Tour ist fuer Teilnehmer ab 8 Jahren geeignet
          (Begleitung durch Erziehungsberechtigte erforderlich). Die
          Erwachsenen-Tour richtet sich an Teilnehmer ab 14 Jahren.
        </p>

        <h3>Eigenverantwortung</h3>
        <p>
          Die Teilnehmer nehmen auf eigene Gefahr an der Tour teil. Der
          Anbieter weist ausdruecklich darauf hin, dass die Tour im oeffentlichen
          Raum stattfindet. Die Teilnehmer sind verpflichtet, die
          Strassenverkehrsordnung und andere geltende Vorschriften zu beachten.
          Die Teilnehmer sind fuer ihre eigene Sicherheit verantwortlich.
        </p>

        <h3>Witterung</h3>
        <p>
          Die Tour findet bei jeder Witterung statt. Wir empfehlen
          wetterfeste Kleidung und geeignetes Schuhwerk. Bei extremen
          Wetterbedingungen (z.B. Unwetterwarnung) empfehlen wir, die Tour zu
          verschieben. Der Buchungscode bleibt in diesem Fall unveraendert
          gueltig.
        </p>
      </div>

      {/* Liability */}
      <div>
        <h2>6. Haftung</h2>
        <p>
          Der Anbieter haftet unbeschraenkt fuer Schaeden aus der Verletzung des
          Lebens, des Koerpers oder der Gesundheit sowie fuer Schaeden, die auf
          Vorsatz oder grober Fahrlaessigkeit beruhen.
        </p>
        <p>
          Fuer Schaeden aus der Verletzung wesentlicher Vertragspflichten
          (Kardinalpflichten) haftet der Anbieter bei leichter Fahrlaessigkeit
          der Hoehe nach begrenzt auf den vorhersehbaren, vertragstypischen
          Schaden.
        </p>
        <p>
          Der Anbieter haftet nicht fuer:
        </p>
        <ul>
          <li>
            Schaeden, die durch hohere Gewalt, Witterungseinfluss oder
            Handlungen Dritter entstehen.
          </li>
          <li>
            Verlust oder Beschaedigung persoenlicher Gegenstaende waehrend der
            Tour.
          </li>
          <li>
            Technische Stoerungen, die ausserhalb des Einflussbereichs des
            Anbieters liegen (z.B. GPS-Ausfaelle, Mobilfunkstoerungen).
          </li>
          <li>
            Schaeden, die durch Missachtung der Strassenverkehrsordnung oder
            anderer Vorschriften durch die Teilnehmer entstehen.
          </li>
        </ul>
      </div>

      {/* Data Protection Reference */}
      <div>
        <h2>7. Datenschutz</h2>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in
          unserer{' '}
          <Link
            href="/datenschutz"
            className="text-white underline underline-offset-2 hover:text-sand-100 transition-colors"
          >
            Datenschutzerklaerung
          </Link>
          . Insbesondere weisen wir darauf hin, dass fuer die Durchfuehrung der
          Tour GPS-Standortdaten erhoben werden. Naeheres hierzu erfahren Sie in
          der Datenschutzerklaerung unter dem Abschnitt &quot;GPS-Daten und
          Standorterfassung&quot;.
        </p>
      </div>

      {/* Final Provisions */}
      <div>
        <h2>8. Schlussbestimmungen</h2>

        <h3>Anwendbares Recht</h3>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit,
          als nicht der durch zwingende Bestimmungen des Rechts des Staates des
          gewoehnlichen Aufenthalts des Verbrauchers gewaehrte Schutz entzogen
          wird.
        </p>

        <h3>Gerichtsstand</h3>
        <p>
          Gerichtsstand fuer alle Streitigkeiten ist Rostock, sofern der Kunde
          Kaufmann, juristische Person des oeffentlichen Rechts oder
          oeffentlich-rechtliches Sondervermogen ist.
        </p>

        <h3>Online-Streitbeilegung</h3>
        <p>
          Die Europaeische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit. Unsere E-Mail-Adresse finden Sie
          oben im Impressum. Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>

        <h3>Salvatorische Klausel</h3>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden,
          bleibt die Wirksamkeit der uebrigen Bestimmungen unberuehrt. An die
          Stelle der unwirksamen Bestimmung tritt eine wirksame Bestimmung, die
          dem wirtschaftlichen Zweck der unwirksamen Bestimmung am naechsten
          kommt.
        </p>
      </div>
    </LegalPageLayout>
  );
}
