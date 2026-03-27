import type { Metadata } from 'next';
import { LegalPageLayout } from '@/components/marketing/LegalPageLayout';

export const metadata: Metadata = {
 title: 'Datenschutz | Escape Tour Warnemünde',
};

/**
 * Datenschutz (Privacy Policy) page
 * DSGVO-compliant privacy policy for the Escape Tour application
 */
export default function DatenschutzPage() {
 return (
  <LegalPageLayout
   title="Datenschutzerklärung"
   lastUpdated="01. Februar 2026"
  >
   {/* Overview */}
   <div>
    <h2>Datenschutz auf einen Blick</h2>
    <p>
     Die folgenden Hinweise geben einen einfachen Überblick darüber, was
     mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website
     besuchen und unsere Escape Tour nutzen. Personenbezogene Daten sind
     alle Daten, mit denen Sie persönlich identifiziert werden können.
     Ausführliche Informationen zum Thema Datenschutz entnehmen Sie
     unserer nachfolgend aufgeführten Datenschutzerklärung.
    </p>
   </div>

   {/* General Information */}
   <div>
    <h2>Allgemeine Hinweise und Pflichtinformationen</h2>

    <h3>Verantwortliche Stelle</h3>
    <p>
     Escape Tour Warnemünde GmbH
     <br />
     Am Leuchtturm 1
     <br />
     18119 Rostock-Warnemünde
     <br />
     E-Mail:{' '}
     <a href="mailto:datenschutz@escape-tour-warnemuende.de">
      datenschutz@escape-tour-warnemuende.de
     </a>
    </p>

    <h3>Rechtsgrundlagen</h3>
    <p>
     Wir verarbeiten Ihre personenbezogenen Daten auf Grundlage der
     Datenschutz-Grundverordnung (DSGVO), des Bundesdatenschutzgesetzes
     (BDSG) sowie des Telemediengesetzes (TMG). Die Verarbeitung erfolgt
     auf Basis von Art. 6 Abs. 1 DSGVO, insbesondere:
    </p>
    <ul>
     <li>
      <strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong> Soweit
      Sie uns eine Einwilligung zur Verarbeitung personenbezogener Daten
      erteilt haben.
     </li>
     <li>
      <strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):</strong> Zur
      Durchführung der gebuchten Escape Tour.
     </li>
     <li>
      <strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):</strong>{' '}
      Zur Verbesserung unseres Angebots und zur Gewährleistung der
      IT-Sicherheit.
     </li>
    </ul>
   </div>

   {/* Data Collection on Website */}
   <div>
    <h2>Datenerfassung auf dieser Website</h2>

    <h3>Cookies</h3>
    <p>
     Unsere Webseiten verwenden sogenannte Cookies. Cookies richten auf
     Ihrem Rechner keinen Schaden an und enthalten keine Viren. Cookies
     dienen dazu, unser Angebot nutzerfreundlicher und sicherer zu machen.
     Wir verwenden ausschließlich technisch notwendige Cookies, die für
     den Betrieb der Website und der Escape Tour erforderlich sind.
    </p>
    <p>
     Technisch notwendige Cookies werden verwendet für:
    </p>
    <ul>
     <li>Sitzungsverwaltung (Session-Cookies)</li>
     <li>Spielstandspeicherung während der Tour</li>
     <li>Authentifizierung und Sicherheit</li>
    </ul>

    <h3>Server-Log-Files</h3>
    <p>
     Der Provider der Seiten erhebt und speichert automatisch
     Informationen in sogenannten Server-Log-Files, die Ihr Browser
     automatisch an uns übermittelt. Dies sind:
    </p>
    <ul>
     <li>Browsertyp und Browserversion</li>
     <li>Verwendetes Betriebssystem</li>
     <li>Referrer URL</li>
     <li>Hostname des zugreifenden Rechners</li>
     <li>Uhrzeit der Serveranfrage</li>
     <li>IP-Adresse (anonymisiert)</li>
    </ul>
    <p>
     Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
     vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art.
     6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes
     Interesse an der technisch fehlerfreien Darstellung und der
     Optimierung seiner Website.
    </p>

    <h3>Kontaktformular</h3>
    <p>
     Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre
     Angaben aus dem Anfrageformular inklusive der von Ihnen dort
     angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den
     Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir
     nicht ohne Ihre Einwilligung weiter. Die Verarbeitung erfolgt auf
     Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
    </p>
   </div>

   {/* GPS and Location Data */}
   <div>
    <h2>GPS-Daten und Standorterfassung</h2>
    <p>
     Für die Durchführung der Escape Tour ist die Erfassung Ihres
     Standorts über GPS erforderlich. Die Standortdaten werden
     ausschließlich für folgende Zwecke verwendet:
    </p>
    <ul>
     <li>
      <strong>Navigation zu Stationen:</strong> Um Sie zur nächsten
      Station der Tour zu führen.
     </li>
     <li>
      <strong>Stationsfreischaltung:</strong> Um zu überprüfen, ob Sie
      sich im Bereich einer Station befinden und die entsprechenden
      Rätsel freizuschalten.
     </li>
     <li>
      <strong>Kartenanzeige:</strong> Um Ihnen Ihre Position und die Route
      auf der Karte anzuzeigen.
     </li>
    </ul>
    <p>
     <strong>Wichtige Hinweise zur Standorterfassung:</strong>
    </p>
    <ul>
     <li>
      Die Standorterfassung erfolgt ausschließlich während der aktiven
      Tour und nur nach ausdrücklicher Zustimmung über die
      Browser-Berechtigungsabfrage.
     </li>
     <li>
      Standortdaten werden nicht dauerhaft gespeichert und nicht an Dritte
      weitergegeben.
     </li>
     <li>
      Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6
      Abs. 1 lit. a DSGVO) sowie zur Vertragserfüllung (Art. 6 Abs. 1
      lit. b DSGVO).
     </li>
     <li>
      Sie können die Standortfreigabe jederzeit in Ihren
      Browsereinstellungen widerrufen. Bitte beachten Sie, dass die Tour
      ohne Standortfreigabe nicht durchgeführt werden kann.
     </li>
    </ul>
   </div>

   {/* Supabase */}
   <div>
    <h2>Supabase als Auftragsverarbeiter</h2>
    <p>
     Wir nutzen Supabase (Supabase Inc., 970 Toa Payoh North #07-04,
     Singapore 318992) als Backend-Infrastruktur für unsere Anwendung.
     Supabase verarbeitet in unserem Auftrag folgende Daten:
    </p>
    <ul>
     <li>Buchungsdaten (Name, E-Mail, Buchungscode)</li>
     <li>Spielstanddaten (Fortschritt, Antworten, Hinweise)</li>
     <li>Authentifizierungsdaten (verschlüsselt)</li>
    </ul>
    <p>
     Mit Supabase wurde ein Auftragsverarbeitungsvertrag (AVV) gemäß
     Art. 28 DSGVO geschlossen. Die Daten werden auf Servern innerhalb der
     Europäischen Union gespeichert. Supabase setzt geeignete technische
     und organisatorische Maßnahmen zum Schutz Ihrer Daten ein.
    </p>
   </div>

   {/* Rights */}
   <div>
    <h2>Rechte der betroffenen Person</h2>
    <p>
     Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie
     betreffenden personenbezogenen Daten:
    </p>
    <ul>
     <li>
      <strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie haben das Recht
      auf Auskunft über die bei uns gespeicherten personenbezogenen
      Daten.
     </li>
     <li>
      <strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie haben das
      Recht auf Berichtigung unrichtiger Daten.
     </li>
     <li>
      <strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie haben das
      Recht auf Löschung Ihrer Daten, sofern keine gesetzlichen
      Aufbewahrungspflichten entgegenstehen.
     </li>
     <li>
      <strong>Einschränkung (Art. 18 DSGVO):</strong> Sie haben das Recht
      auf Einschränkung der Verarbeitung.
     </li>
     <li>
      <strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben
      das Recht auf Datenübertragbarkeit.
     </li>
     <li>
      <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das
      Recht, der Verarbeitung zu widersprechen.
     </li>
     <li>
      <strong>Beschwerderecht:</strong> Sie haben das Recht, sich bei
      einer Datenschutzaufsichtsbehörde zu beschweren. Zuständige
      Behörde ist der Landesbeauftragte für Datenschutz und
      Informationsfreiheit Mecklenburg-Vorpommern.
     </li>
    </ul>
    <p>
     Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
     <a href="mailto:datenschutz@escape-tour-warnemuende.de">
      datenschutz@escape-tour-warnemuende.de
     </a>
    </p>
   </div>

   {/* SSL/TLS */}
   <div>
    <h2>SSL- bzw. TLS-Verschlüsselung</h2>
    <p>
     Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der
     Übertragung vertraulicher Inhalte, wie zum Beispiel Buchungen oder
     Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw.
     TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
     daran, dass die Adresszeile des Browsers von &quot;http://&quot; auf
     &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer
     Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist,
     können die Daten, die Sie an uns übermitteln, nicht von Dritten
     mitgelesen werden.
    </p>
   </div>
  </LegalPageLayout>
 );
}
