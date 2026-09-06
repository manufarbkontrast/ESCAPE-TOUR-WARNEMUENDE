/**
 * The questions guests actually ask, in one place.
 *
 * They used to be copied into the landing page and the Warnemünde page, which
 * meant the answer about the iPad was wrong on one of them for a while. Now
 * the landing page, the tour page and /faq all read from here.
 */

export interface FaqItem {
  readonly question: string
  readonly answer: string
}

export const FAQ_ITEMS: ReadonlyArray<FaqItem> = [
 {
  question: 'Brauchen wir ein eigenes Handy oder eine App?',
  answer:
   'Nein. Ihr bekommt beim Briefing ein vorbereitetes iPad mit Karte, Rätseln und Story — inklusive Internetverbindung. Es gibt nichts zu installieren und kein Konto anzulegen. Euer eigenes Handy braucht ihr nur, wenn ihr Fotos machen wollt.',
 },
 {
  question: 'Wo und wann treffen wir uns?',
  answer:
   'Treffpunkt ist Shoes Please direkt am Leuchtturm in Warnemünde. Kommt 20 Minuten vor eurem gebuchten Slot — in dieser Zeit bekommt ihr das iPad und eine kurze Einweisung. Die Spielzeit läuft erst danach.',
 },
 {
  question: 'Wie lange dauert die Tour?',
  answer:
   'Je nach Variante 2 bis 5 Stunden. Ihr spielt in eurem eigenen Tempo, könnt jederzeit pausieren und unterwegs Kaffee trinken oder essen gehen — die Zeit lässt sich anhalten.',
 },
 {
  question: 'Wie groß darf unser Team sein?',
  answer:
   'Gebucht wird pro Person. Ein Team teilt sich ein iPad, sinnvoll sind 2 bis 5 Personen pro Gerät. Größere Gruppen teilen wir in mehrere Teams auf, die parallel starten. Ab 6 Personen gibt es 10 % Rabatt, ab 10 Personen 15 %.',
 },
 {
  question: 'Was ist bei schlechtem Wetter?',
  answer:
   'Die Tour findet bei jedem Wetter statt, die Route führt an überdachten Stellen vorbei. Zieht euch wetterfest an. Wenn euch das Wetter zu ungemütlich ist: euer Buchungscode ist 12 Monate gültig und auf andere Personen übertragbar.',
 },
 {
  question: 'Können wir stornieren?',
  answer:
   'Innerhalb von 24 Stunden nach der Buchung könnt ihr kostenlos stornieren und bekommt den vollen Betrag zurück. Danach bleibt euer Buchungscode 12 Monate gültig und ist übertragbar. Details stehen in unseren AGB.',
 },
 {
  question: 'Ab welchem Alter ist die Tour geeignet?',
  answer:
   'Die Familien-Tour ist ab 8 Jahren, die Erwachsenen-Tour ab 14 und die Profi-Tour ab 16 Jahren. Jüngere Kinder können natürlich mitlaufen und mitraten.',
 },
 {
  question: 'Was passiert, wenn wir bei einem Rätsel nicht weiterkommen?',
  answer:
   'Zu jedem Rätsel gibt es bis zu drei Hinweise, die nach und nach konkreter werden. Sie kosten Punkte, aber ihr kommt immer weiter. Ihr bleibt an keiner Station stecken.',
 },
] as const;
