/**
 * Occasion landing pages.
 *
 * The start page names these groups in a section that only people who already
 * found us ever read. Someone searching "Firmenevent Rostock" or
 * "Junggesellenabschied Warnemünde" landed nowhere. Each occasion now gets a
 * page that answers the question that group actually has — group size, price
 * for a group, how the day is organised.
 *
 * Every claim here has to hold: prices come from the tour config, the group
 * discount from the checkout, the meeting point from the site config.
 */

import type { TourVariantId } from './tours'

export interface OccasionReason {
  readonly title: string
  readonly text: string
}

export interface Occasion {
  /** URL segment under /fuer/ — ASCII only, no umlauts. */
  readonly slug: string
  /** Short label for links and breadcrumbs. */
  readonly navLabel: string
  readonly metaTitle: string
  readonly metaDescription: string
  /** Page headline — different for every occasion so they do not compete. */
  readonly headline: string
  readonly intro: string
  /** Which tour we would put this group on, and why. */
  readonly recommendedVariant: TourVariantId
  readonly recommendationReason: string
  readonly reasons: readonly [OccasionReason, OccasionReason, OccasionReason]
  /** Practical facts this group asks about before anything else. */
  readonly facts: ReadonlyArray<{ readonly label: string; readonly value: string }>
  /** Pre-fills the subject line of the group enquiry. */
  readonly enquirySubject: string
}

export const OCCASIONS: ReadonlyArray<Occasion> = [
  {
    slug: 'firmenevent',
    navLabel: 'Firmenevents',
    metaTitle: 'Firmenevent in Warnemünde — Teambuilding als Rätseltour',
    metaDescription:
      'Teamevent in Warnemünde: zwölf Rätselstationen, iPads gestellt, mehrere Teams starten parallel. Ab 6 Personen 10 % Rabatt, ab 10 Personen 15 %.',
    headline: 'Ein Teamevent, bei dem alle mitreden',
    intro:
      'Zwölf Stationen durch Warnemünde, gelöst in Teams von zwei bis fünf Personen. Wer sonst im Meeting still bleibt, hat hier oft die entscheidende Idee — weil Zählen, Kombinieren und Chiffren unterschiedliche Köpfe brauchen.',
    recommendedVariant: 'adult',
    recommendationReason:
      'Anspruchsvoll genug, dass ein Team sich anstrengen muss, und mit drei bis vier Stunden noch in einen Nachmittag zu bekommen.',
    reasons: [
      {
        title: 'Mehrere Teams gleichzeitig',
        text: 'Ihr startet parallel auf derselben Route. Jedes Team spielt sein eigenes Tempo, am Ende habt ihr Punktzahlen, die sich vergleichen lassen — ohne dass jemand aufeinander warten muss.',
      },
      {
        title: 'Kein Vorbereitungsaufwand',
        text: 'Wir stellen die iPads mit Karte, Rätseln und Story. Niemand muss etwas installieren, niemand braucht sein Diensthandy, und es gibt nichts, was jemand vergessen kann.',
      },
      {
        title: 'Draußen statt im Seminarraum',
        text: 'Drei bis fünf Kilometer an der Ostsee, vom Leuchtturm über die Westmole bis zum Alten Strom. Die Pausen legt ihr selbst — der Alte Strom liegt direkt an der Route.',
      },
    ],
    facts: [
      { label: 'Teamgröße', value: '2–5 pro iPad' },
      { label: 'Ab 6 Personen', value: '10 % Rabatt' },
      { label: 'Ab 10 Personen', value: '15 % Rabatt' },
      { label: 'Dauer', value: '3–4 Stunden' },
    ],
    enquirySubject: 'Anfrage Firmenevent',
  },
  {
    slug: 'kreuzfahrt-gaeste',
    navLabel: 'Kreuzfahrt-Gäste',
    metaTitle: 'Landausflug Warnemünde auf eigene Faust — Rätseltour ab Terminal',
    metaDescription:
      'Landgang in Warnemünde ohne Bustour: Rätseltour zu Fuß ab Leuchtturm, 2–3 Stunden, iPad inklusive. Terminal und Bahnhof liegen direkt an der Route.',
    headline: 'Landgang, der nicht nach Bustour aussieht',
    intro:
      'Das Kreuzfahrtterminal liegt wenige Minuten vom Leuchtturm entfernt, unser Treffpunkt ebenfalls. Statt einer geführten Gruppe lauft ihr selbst los — und seid zurück, bevor das Schiff ablegt.',
    recommendedVariant: 'family',
    recommendationReason:
      'Mit zwei bis drei Stunden und drei Kilometern passt sie sicher in ein Landgang-Zeitfenster, auch wenn ihr unterwegs Kaffee trinkt.',
    reasons: [
      {
        title: 'Alles zu Fuß, alles in Terminalnähe',
        text: 'Treffpunkt Shoes Please am Leuchtturm, Rundweg zurück zum Ausgangspunkt. Der Bahnhof liegt als Station elf ohnehin auf der Strecke — ihr entfernt euch nie weit vom Schiff.',
      },
      {
        title: 'Ihr bestimmt das Tempo',
        text: 'Kein Reiseleiter, keine feste Gruppe. Wenn ihr an der Mole länger stehen bleibt oder am Alten Strom Fischbrötchen esst, wartet niemand ungeduldig.',
      },
      {
        title: 'Nichts mitbringen außer Schuhen',
        text: 'Das iPad bekommt ihr von uns, inklusive Internet. Kein Roaming, kein Datenvolumen, kein leerer Handyakku am Ende des Tages.',
      },
    ],
    facts: [
      { label: 'Dauer', value: '2–3 Stunden' },
      { label: 'Weg', value: '3 km, flach' },
      { label: 'Vom Terminal', value: 'zu Fuß erreichbar' },
      { label: 'Vor Ort sein', value: '20 Min vor Start' },
    ],
    enquirySubject: 'Anfrage Landausflug',
  },
  {
    slug: 'junggesellenabschied',
    navLabel: 'Junggesellenabschied',
    metaTitle: 'Junggesellenabschied Warnemünde — Rätseltour statt Kneipentour',
    metaDescription:
      'JGA in Warnemünde: zwölf Rätselstationen an der Ostsee, iPads gestellt, ab 6 Personen 10 % Rabatt. Etwas, an das sich am nächsten Tag noch alle erinnern.',
    headline: 'Etwas, woran sich am nächsten Tag noch alle erinnern',
    intro:
      'Ein Nachmittag, an dem die Gruppe etwas zusammen schafft, bevor der Abend beginnt. Die Profi-Tour verzichtet auf Hinweise in den Fragen und rechnet mit Chiffren — genug Widerstand, dass der Erfolg zählt.',
    recommendedVariant: 'pro',
    recommendationReason:
      'Die schwerste Variante. Wer sie löst, hat am Abend etwas zu erzählen; wer sie nicht löst, erst recht.',
    reasons: [
      {
        title: 'Gegeneinander statt nebeneinander',
        text: 'Teilt euch in zwei Teams auf, startet gleichzeitig und vergleicht am Ende die Punkte. Wer verliert, übernimmt die erste Runde — das regelt sich meist von selbst.',
      },
      {
        title: 'Vor dem Abend, nicht statt dessen',
        text: 'Vier bis fünf Stunden am Nachmittag, Ende wieder am Leuchtturm. Von dort seid ihr in wenigen Minuten am Alten Strom, wo der Abend ohnehin weitergeht.',
      },
      {
        title: 'Funktioniert auch mit Restalkohol',
        text: 'Die Rätsel brauchen Aufmerksamkeit, keine Höchstleistung. Und wenn eine Gruppe feststeckt, gibt es zu jedem Rätsel drei Hinweise — ihr bleibt nirgends hängen.',
      },
    ],
    facts: [
      { label: 'Empfohlen', value: 'Profi-Tour' },
      { label: 'Ab 6 Personen', value: '10 % Rabatt' },
      { label: 'Dauer', value: '4–5 Stunden' },
      { label: 'Alter', value: 'ab 16 Jahren' },
    ],
    enquirySubject: 'Anfrage Junggesellenabschied',
  },
  {
    slug: 'schulklassen',
    navLabel: 'Schulklassen',
    metaTitle: 'Klassenfahrt Warnemünde — Stadtrallye mit Rätseln für Schulklassen',
    metaDescription:
      'Programmpunkt für die Klassenfahrt nach Warnemünde: Rätseltour in Kleingruppen, iPads gestellt, ab 10 Personen 15 % Rabatt. Ab 8 Jahren geeignet.',
    headline: 'Ein Programmpunkt, der die Klasse beschäftigt',
    intro:
      'Die Klasse teilt sich in Kleingruppen, jede bekommt ein iPad und läuft dieselbe Route in eigenem Tempo. Sie beschäftigen sich mit dem Ort, ohne dass jemand vorne stehen und erzählen muss.',
    recommendedVariant: 'family',
    recommendationReason:
      'Ab acht Jahren, kürzerer Weg und Rätsel, die eine Gruppe gemeinsam lösen kann statt nur der oder die Schnellste.',
    reasons: [
      {
        title: 'Kleingruppen laufen selbstständig',
        text: 'Zwei bis fünf Schülerinnen und Schüler pro iPad, feste Route, fester Endpunkt. Begleitpersonen können mitlaufen oder am Treffpunkt warten — verlaufen kann sich niemand, die Karte führt zu jeder Station.',
      },
      {
        title: 'Ortsgeschichte, die hängen bleibt',
        text: 'Leuchtturm, Heimatmuseum, Edvard-Munch-Haus, Fischmarkt: Die Rätsel entstehen aus dem, was dort tatsächlich zu sehen ist. Wer die Lösung findet, hat vorher hingeschaut.',
      },
      {
        title: 'Planbar für die Aufsicht',
        text: 'Feste Dauer, fester Rundweg, fester Rückgabepunkt. Ihr wisst vorher, wann die Klasse wieder vollständig am Leuchtturm steht.',
      },
    ],
    facts: [
      { label: 'Ab', value: '8 Jahren' },
      { label: 'Gruppengröße', value: '2–5 pro iPad' },
      { label: 'Ab 10 Personen', value: '15 % Rabatt' },
      { label: 'Dauer', value: '2–3 Stunden' },
    ],
    enquirySubject: 'Anfrage Klassenfahrt',
  },
] as const

/** Lookup by URL segment. Returns null so the route can render notFound(). */
export function getOccasion(slug: string): Occasion | null {
  return OCCASIONS.find((occasion) => occasion.slug === slug) ?? null
}

/**
 * Pre-fills the contact form for a group enquiry.
 *
 * Groups rarely pay by card for twenty people — they want to ask first. Rather
 * than a second form, the occasion pages hand the existing contact form a
 * subject the API and the notification mail already understand, plus a message
 * that asks for the two things every enquiry otherwise costs a round trip:
 * how many people, and when.
 */
export interface EnquiryPrefill {
  /** Matches SUBJECT_OPTIONS in the contact form. */
  readonly subject: 'group'
  readonly message: string
}

export function getEnquiryPrefill(slug: string | null): EnquiryPrefill | null {
  if (!slug) {
    return null
  }

  const occasion = getOccasion(slug)
  if (!occasion) {
    return null
  }

  return {
    subject: 'group',
    message: [
      `Wir interessieren uns für die Escape Tour als ${occasion.navLabel}.`,
      '',
      'Anzahl Personen: ',
      'Wunschtermin: ',
      'Uhrzeit: ',
      '',
      'Fragen dazu: ',
    ].join('\n'),
  }
}
