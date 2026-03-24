/**
 * Demo mode mock data for testing the full game flow without Supabase.
 * Use booking code "DEMO01" to activate demo mode.
 *
 * Route C (Komplett, 120 Min): Shoes Please am Leuchtturm → Uhrzeigersinn → zurück
 *   1. Leuchtturm  2. Teepott  3. Westmole  4. Kurhaus  5. Strand
 *   6. Kirchplatz  7. Heimatmuseum  8. Vogtei  9. Edvard-Munch-Haus
 *  10. Alter Strom 11. Fischmarkt  12. Bahnhof  → Rückweg Leuchtturm
 */

import type { GameSession, Station, Puzzle, Certificate } from '@escape-tour/shared'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEMO_SESSION_ID = 'demo-session-001' as const
export const DEMO_BOOKING_CODE = 'DEMO01' as const
export const DEMO_TOUR_ID = 'demo-tour-001' as const

const NOW = new Date().toISOString()

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export const DEMO_SESSION: GameSession = {
  id: DEMO_SESSION_ID,
  bookingId: 'demo-booking-001',
  tourId: DEMO_TOUR_ID,
  status: 'active',
  teamName: 'Demo Team',
  startedAt: NOW,
  pausedAt: null,
  completedAt: null,
  totalPauseSeconds: 0,
  currentStationIndex: 0,
  totalPoints: 0,
  hintsUsed: 0,
  puzzlesSkipped: 0,
  deviceInfo: null,
  lastKnownLocation: null,
  lastActivityAt: NOW,
  offlineData: null,
  needsSync: false,
  createdAt: NOW,
  updatedAt: NOW,
}

// ---------------------------------------------------------------------------
// Stations — Route C (12 Stationen, Rundlauf ab Leuchtturm)
// ---------------------------------------------------------------------------

export const DEMO_STATIONS: readonly Station[] = [
  // ── 1. Leuchtturm (Start) ────────────────────────────────────────────
  {
    id: 'demo-station-001',
    tourId: DEMO_TOUR_ID,
    orderIndex: 0,
    nameDe: 'Der Leuchtturm',
    nameEn: 'The Lighthouse',
    subtitleDe: 'Wo alles beginnt',
    subtitleEn: 'Where it all begins',
    location: { lat: 54.1814, lng: 12.0858 },
    locationName: 'Leuchtturm Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Willkommen am Leuchtturm von Warnemuende! Seit 1898 weist er Schiffen den Weg in den Hafen. Hier beginnt eure Reise auf den Spuren des Lotsenkapitaens Friedrich Scheel.',
    introTextEn:
      'Welcome to the Warnemuende lighthouse! Since 1898 it has guided ships into the harbor. Here begins your journey following the footsteps of pilot captain Friedrich Scheel.',
    storyTextDe:
      'Im Jahr 1923 verschwand Kapitaen Scheel spurlos. Sein letzter Eintrag im Logbuch lautete: "Die Wahrheit liegt in den Stufen." Was meinte er damit? Schaut euch den Leuchtturm genau an...',
    storyTextEn:
      'In 1923, Captain Scheel vanished without a trace. His last logbook entry read: "The truth lies in the steps." What did he mean? Take a closer look at the lighthouse...',
    completionTextDe:
      'Ausgezeichnet! Ihr habt das erste Raetsel geloest. Kapitaen Scheel hinterliess weitere Hinweise — direkt nebenan, im Teepott.',
    completionTextEn:
      'Excellent! You solved the first puzzle. Captain Scheel left more clues — right next door, at the Teepott.',
    transitionTextDe:
      'Scheel verliess den Leuchtturm bei Einbruch der Daemmerung. Sein naechstes Ziel lag nur wenige Schritte entfernt — das Gebaeude mit dem unverwechselbaren Wellendach. Er nannte es "den Schluessel zur Verschluesselung".',
    transitionTextEn:
      'Scheel left the lighthouse at dusk. His next destination was just a few steps away — the building with the unmistakable wave roof. He called it "the key to encryption".',
    walkingHintDe: 'Schaut nach links — das geschwungene Dach ist nicht zu uebersehen.',
    walkingHintEn: 'Look to your left — the curved roof is impossible to miss.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'waves',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 2. Teepott ───────────────────────────────────────────────────────
  {
    id: 'demo-station-002',
    tourId: DEMO_TOUR_ID,
    orderIndex: 1,
    nameDe: 'Der Teepott',
    nameEn: 'The Teepott',
    subtitleDe: 'Wellen aus Beton',
    subtitleEn: 'Waves of concrete',
    location: { lat: 54.1815, lng: 12.0848 },
    locationName: 'Teepott Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Der Teepott — Warnemuendes ikonischstes Bauwerk. 1968 errichtet, ist sein hyperbolisches Schalendach weltweit einzigartig. Die Wellenform inspirierte nicht nur Architekten...',
    introTextEn:
      'The Teepott — Warnemuende\'s most iconic building. Built in 1968, its hyperbolic shell roof is unique worldwide. The wave form inspired not just architects...',
    storyTextDe:
      'Was kaum jemand weiss: Kapitaen Scheel war fasziniert von Wellenmustern. In seinem Logbuch finden sich Skizzen, die dem spaeteren Teepott-Dach verblüffend aehneln. Er nutzte Wellenformen als Verschluesselungsmuster fuer seine geheimen Nachrichten. Die Anzahl der Wellenberge war sein Code.',
    storyTextEn:
      'What few people know: Captain Scheel was fascinated by wave patterns. His logbook contains sketches that bear a striking resemblance to the later Teepott roof. He used wave forms as encryption patterns for his secret messages. The number of wave crests was his code.',
    completionTextDe:
      'Sehr gut! Scheels Wellenmuster hat euch den naechsten Hinweis verraten. Jetzt geht es raus aufs Meer — zur Westmole!',
    completionTextEn:
      'Very good! Scheel\'s wave pattern revealed the next clue. Now head out to sea — to the West Pier!',
    transitionTextDe:
      'Scheel ging oft bei Sturm zur Westmole. "Nur dort", schrieb er, "wo das Meer am lautesten ist, kann man ungestoert denken." Folgt der Promenade nach Nordwesten — der lange Steg fuehrt weit hinaus.',
    transitionTextEn:
      'Scheel often walked to the West Pier during storms. "Only there," he wrote, "where the sea is loudest, can one think undisturbed." Follow the promenade northwest — the long jetty stretches far out.',
    walkingHintDe: 'Folgt der Seepromenade Richtung Westen. Der Steg wird sichtbar.',
    walkingHintEn: 'Follow the seafront promenade westward. The jetty will come into view.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'waves',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 3. Westmole ──────────────────────────────────────────────────────
  {
    id: 'demo-station-003',
    tourId: DEMO_TOUR_ID,
    orderIndex: 2,
    nameDe: 'Die Westmole',
    nameEn: 'The West Pier',
    subtitleDe: 'Wo das Meer beginnt',
    subtitleEn: 'Where the sea begins',
    location: { lat: 54.1868, lng: 12.0873 },
    locationName: 'Westmole Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Die Westmole — der lange Steg, der weit hinaus in die Ostsee fuehrt. Am Ende leuchtet das gruene Molenfeuer und weist den Schiffen den Weg in den Hafen.',
    introTextEn:
      'The West Pier — the long jetty that stretches far out into the Baltic Sea. At its end, the green pier light guides ships into the harbor.',
    storyTextDe:
      'Am Abend seines Verschwindens wurde Scheel zuletzt auf der Westmole gesehen. Fischer berichten, er habe am gruenen Leuchtfeuer etwas in den Stein geritzt — eine Jahreszahl, die ihm alles bedeutete. Findet ihr sie?',
    storyTextEn:
      'On the evening of his disappearance, Scheel was last seen on the West Pier. Fishermen report he carved something into the stone at the green pier light — a year that meant everything to him.',
    completionTextDe:
      'Gut gemacht! Die Jahreszahl war der Schluessel. Scheels Spuren fuehren nun zurueck an Land — zum eleganten Kurhaus.',
    completionTextEn:
      'Well done! The year was the key. Scheel\'s trail now leads back to land — to the elegant Kurhaus.',
    transitionTextDe:
      'Scheel kehrte von der Mole zurueck und bog nach Sueden ab. Im Kurhaus fand in jener Nacht ein grosser Ball statt — sein letzter oeffentlicher Auftritt. Die Ornamente im Ballsaal verbargen mehr als nur Dekoration.',
    transitionTextEn:
      'Scheel returned from the pier and turned south. A grand ball was held at the Kurhaus that night — his last public appearance. The ornaments in the ballroom concealed more than mere decoration.',
    walkingHintDe: 'Geht die Mole zurueck und haltet euch links Richtung Seestrasse.',
    walkingHintEn: 'Walk back along the pier and keep left toward Seestrasse.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'waves',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 4. Kurhaus ────────────────────────────────────────────────────────
  {
    id: 'demo-station-004',
    tourId: DEMO_TOUR_ID,
    orderIndex: 3,
    nameDe: 'Das Kurhaus',
    nameEn: 'The Kurhaus',
    subtitleDe: 'Eleganz der Zwanziger',
    subtitleEn: 'Elegance of the Twenties',
    location: { lat: 54.1805, lng: 12.0820 },
    locationName: 'Kurhaus Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Das Kurhaus — 1928 im Art-Deco-Stil erbaut, war es das kulturelle Zentrum des Ostseebades. Hinter der eleganten Fassade verbirgt sich eine Geschichte aus Scheels letzter Nacht.',
    introTextEn:
      'The Kurhaus — built in Art Deco style in 1928, it was the cultural center of the seaside resort. Behind its elegant facade lies a story from Scheel\'s last night.',
    storyTextDe:
      'Im Ballsaal des Kurhauses fand Scheels letzter oeffentlicher Auftritt statt. Augenzeugen berichten, er habe die Deckenornamente studiert und dabei gemurmelt: "Eine Seekarte, verborgen in der Schoenheit." Die Ornamente sind keine Dekoration — sie sind ein Raster. Wie viele Rauten zaehlt ihr im zentralen Muster?',
    storyTextEn:
      'The ballroom of the Kurhaus was the setting for Scheel\'s last public appearance. Eyewitnesses report he studied the ceiling ornaments, murmuring: "A nautical chart, hidden in beauty." The ornaments are not decoration — they are a grid.',
    completionTextDe:
      'Perfekt! Die Rauten waren Scheels Koordinatenpunkte. Der naechste Hinweis liegt am Strand — zwischen Sand und Meer.',
    completionTextEn:
      'Perfect! The diamonds were Scheel\'s coordinate points. The next clue lies at the beach — between sand and sea.',
    transitionTextDe:
      'Scheel verliess den Ball durch den Seiteneingang. Er wurde gesehen, wie er ueber die Duenen zum Strand ging — hastig, als haette er nicht viel Zeit. Dort soll er etwas vergraben haben.',
    transitionTextEn:
      'Scheel left the ball through the side entrance. He was seen walking over the dunes to the beach — hurriedly, as if running out of time. He is said to have buried something there.',
    walkingHintDe: 'Geht Richtung Strand — ihr seht die Duenen bereits.',
    walkingHintEn: 'Head toward the beach — you can already see the dunes.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'wind',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 5. Strand ─────────────────────────────────────────────────────────
  {
    id: 'demo-station-005',
    tourId: DEMO_TOUR_ID,
    orderIndex: 4,
    nameDe: 'Am Strand',
    nameEn: 'At the Beach',
    subtitleDe: 'Spuren im Sand',
    subtitleEn: 'Traces in the sand',
    location: { lat: 54.1797, lng: 12.0792 },
    locationName: 'Strand Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Der breite Sandstrand von Warnemuende ist einer der schoensten an der Ostsee. Doch unter dem Sand verbirgt sich mehr als nur Muscheln...',
    introTextEn:
      'The wide sandy beach of Warnemuende is one of the most beautiful on the Baltic Sea. But beneath the sand lies more than just shells...',
    storyTextDe:
      'Fischer berichten von einer alten Truhe, die bei Sturmfluten manchmal freigespuelt wird. Auf dem Deckel ist ein Zahlenschloss mit vier Ziffern. Die Kombination ist das Gruendungsjahr des Leuchtturms — ein Schluessel zur Vergangenheit.',
    storyTextEn:
      'Fishermen report an old chest that sometimes gets washed out during storm tides. On the lid is a combination lock with four digits. The combination is the founding year of the lighthouse — a key to the past.',
    completionTextDe:
      'Die Truhe oeffnet sich! Darin liegt eine alte Seekarte mit einem markierten Ort — der Kirchplatz. Eilt dorthin!',
    completionTextEn:
      'The chest opens! Inside lies an old nautical chart with a marked location — the church square. Hurry there!',
    transitionTextDe:
      'In der Truhe lag neben der Seekarte ein vergilbter Zettel: "Die Kirche bewahrt, was die See vergessen hat." Scheel hatte dort etwas hinterlegt — im aeltesten Gebaeude des Ortes. Geht landeinwaerts zum Kirchplatz.',
    transitionTextEn:
      'Besides the nautical chart, a yellowed note lay in the chest: "The church preserves what the sea has forgotten." Scheel had deposited something there — in the oldest building in town.',
    walkingHintDe: 'Verlasst den Strand landeinwaerts und folgt der Kirchenstrasse.',
    walkingHintEn: 'Leave the beach heading inland and follow Kirchenstrasse.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'waves',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 6. Kirchplatz ─────────────────────────────────────────────────────
  {
    id: 'demo-station-006',
    tourId: DEMO_TOUR_ID,
    orderIndex: 5,
    nameDe: 'Der Kirchplatz',
    nameEn: 'The Church Square',
    subtitleDe: 'Glauben und Geheimnisse',
    subtitleEn: 'Faith and secrets',
    location: { lat: 54.1768, lng: 12.0850 },
    locationName: 'Kirchplatz Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Die Warnemuender Kirche steht seit dem 15. Jahrhundert im Zentrum des Ortes. An ihrem Portal findet sich ein uraltes Symbol, das auch Kapitaen Scheel in seinem Testament erwaehnte.',
    introTextEn:
      'The Warnemuende church has stood in the center of town since the 15th century. On its portal you will find an ancient symbol that Captain Scheel also mentioned in his testament.',
    storyTextDe:
      'Scheels Testament endet mit den Worten: "Sucht das Zeichen an der Kirchentuer. Es ist das Symbol der Seefahrer — es hat mich mein Leben lang begleitet. Wer es benennt, enthuellt mein letztes Geheimnis."',
    storyTextEn:
      'Scheel\'s testament ends with the words: "Seek the sign on the church door. It is the symbol of seafarers — it accompanied me all my life. Whoever names it reveals my final secret."',
    completionTextDe:
      'Richtig — der Anker! Scheels Symbol. Doch sein Vermaechtnis ist noch nicht vollstaendig enthuellt. Im Heimatmuseum nebenan liegen weitere Stuecke des Puzzles.',
    completionTextEn:
      'Correct — the anchor! Scheel\'s symbol. But his legacy is not yet fully revealed. In the local museum nearby lie more pieces of the puzzle.',
    transitionTextDe:
      'Hinter dem Kirchplatz, in der Alexandrinenstrasse, steht das aelteste Fischerhaus des Ortes — heute das Heimatmuseum. Scheel soll dort ein Inventarverzeichnis hinterlassen haben, in dem eine Nachricht verborgen ist.',
    transitionTextEn:
      'Behind the church square, on Alexandrinenstrasse, stands the oldest fisherman\'s house in town — now the local museum. Scheel is said to have left an inventory there with a hidden message.',
    walkingHintDe: 'Das Museum ist gleich um die Ecke in der Alexandrinenstrasse.',
    walkingHintEn: 'The museum is just around the corner on Alexandrinenstrasse.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'church_bells',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 7. Heimatmuseum ───────────────────────────────────────────────────
  {
    id: 'demo-station-007',
    tourId: DEMO_TOUR_ID,
    orderIndex: 6,
    nameDe: 'Das Heimatmuseum',
    nameEn: 'The Local Museum',
    subtitleDe: 'Erinnerungen aus 1767',
    subtitleEn: 'Memories from 1767',
    location: { lat: 54.1768, lng: 12.0852 },
    locationName: 'Heimatmuseum Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Das Heimatmuseum — untergebracht im aeltesten Fischerhaus von 1767. Niedrige Decken, knarrende Dielen und der Geruch von Geschichte. Hier hat Scheel etwas versteckt.',
    introTextEn:
      'The local museum — housed in the oldest fisherman\'s house from 1767. Low ceilings, creaking floorboards, and the smell of history. Scheel hid something here.',
    storyTextDe:
      'In einem vergessenen Inventarverzeichnis des Museums finden sich seltsame Eintraege: "Anker, Netz, Kompass, Eimer, Ruder." Die Anfangsbuchstaben ergeben ein Wort. Doch welches Verzeichnis ist das richtige? Scheel markierte es mit seinem Geburtsjahr.',
    storyTextEn:
      'In a forgotten inventory list of the museum, strange entries can be found: "Anchor, Net, Compass, Edge, Rudder." The initial letters form a word. But which list is the right one? Scheel marked it with his birth year.',
    completionTextDe:
      'ANKER — wieder sein Zeichen! Das Inventar enthaelt einen weiteren Hinweis: eine Adresse in der Alexandrinenstrasse. Die Vogtei — Warnemuendes aeltestes Gebaeude.',
    completionTextEn:
      'ANCHOR — his sign again! The inventory contains another clue: an address on Alexandrinenstrasse. The Vogtei — Warnemuende\'s oldest building.',
    transitionTextDe:
      'Die Vogtei liegt nur wenige Schritte entfernt. Seit dem 13. Jahrhundert stand hier die Zollstation des Ortes. Scheel kannte einen geheimen Mechanismus in den alten Mauern — einen Ort, an dem Nachrichten Jahrhunderte ueberdauern konnten.',
    transitionTextEn:
      'The Vogtei is just a few steps away. Since the 13th century, the town\'s customs station stood here. Scheel knew of a secret mechanism in the old walls — a place where messages could survive centuries.',
    walkingHintDe: 'Nur wenige Meter weiter die Alexandrinenstrasse hinunter.',
    walkingHintEn: 'Just a few meters further down Alexandrinenstrasse.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'wind',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 8. Vogtei ─────────────────────────────────────────────────────────
  {
    id: 'demo-station-008',
    tourId: DEMO_TOUR_ID,
    orderIndex: 7,
    nameDe: 'Die Vogtei',
    nameEn: 'The Vogtei',
    subtitleDe: '700 Jahre Schmuggelgeschichte',
    subtitleEn: '700 years of smuggling history',
    location: { lat: 54.1774, lng: 12.0855 },
    locationName: 'Vogtei Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Die Vogtei — das aelteste Gebaeude Warnemuendes, erbaut um 1300. Einst Zollstation, dann Amtsgericht, heute ein Zeuge vergangener Jahrhunderte. An der Fassade finden sich uralte Siegel.',
    introTextEn:
      'The Vogtei — Warnemuende\'s oldest building, built around 1300. Once a customs station, then a magistrate\'s court, today a witness to centuries past.',
    storyTextDe:
      'Scheel schmuggelte Nachrichten durch die Zollstation — versteckt in den Siegelabdruecken. An der Fassade sind fuenf Siegel zu sehen. Jedes steht fuer eine Zahl. Bringt sie in die richtige Reihenfolge: Anker=1, Kreuz=2, Stern=3, Welle=4, Krone=5. Die Reihenfolge von links nach rechts ergibt den Code.',
    storyTextEn:
      'Scheel smuggled messages through the customs station — hidden in the seal imprints. Five seals can be seen on the facade. Each represents a number. Put them in the right order: Anchor=1, Cross=2, Star=3, Wave=4, Crown=5.',
    completionTextDe:
      'Der Code stimmt! Hinter den Siegeln lag eine weitere Botschaft: "Frag den Maler — er hat alles gesehen." Scheel meinte seinen Freund Edvard Munch.',
    completionTextEn:
      'The code is correct! Behind the seals lay another message: "Ask the painter — he saw everything." Scheel meant his friend Edvard Munch.',
    transitionTextDe:
      'Edvard Munch — der beruehmte norwegische Maler — lebte 1907 bis 1908 in Warnemuende. Sein Haus steht nur wenige Schritte entfernt Am Strom. Munch und Scheel waren Freunde. In einem Gemaelde versteckte Munch Koordinaten — ein Gefallen fuer den Kapitaen.',
    transitionTextEn:
      'Edvard Munch — the famous Norwegian painter — lived in Warnemuende from 1907 to 1908. His house stands just a few steps away on Am Strom. Munch and Scheel were friends.',
    walkingHintDe: 'Geht hinunter zum Strom — das Munch-Haus erkennt ihr an der Gedenktafel.',
    walkingHintEn: 'Walk down to the Strom — you\'ll recognize the Munch house by the memorial plaque.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'wind',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 9. Edvard-Munch-Haus ──────────────────────────────────────────────
  {
    id: 'demo-station-009',
    tourId: DEMO_TOUR_ID,
    orderIndex: 8,
    nameDe: 'Das Munch-Haus',
    nameEn: 'The Munch House',
    subtitleDe: 'Kunst und Verschwoerung',
    subtitleEn: 'Art and conspiracy',
    location: { lat: 54.1773, lng: 12.0850 },
    locationName: 'Edvard-Munch-Haus, Am Strom 53',
    radiusMeters: 50,
    introTextDe:
      'Am Strom 53 — hier lebte der norwegische Maler Edvard Munch von 1907 bis 1908. Was wenige wissen: Munch und Kapitaen Scheel kannten sich gut.',
    introTextEn:
      'Am Strom 53 — the Norwegian painter Edvard Munch lived here from 1907 to 1908. What few know: Munch and Captain Scheel knew each other well.',
    storyTextDe:
      'In einem Gemaelde aus dieser Zeit versteckte Munch Zahlen fuer seinen Freund Scheel. Das Bild zeigt den Alten Strom bei Daemmerung. Im Wasser spiegeln sich Ziffern — kaum sichtbar, aber sie sind da. Es sind Koordinaten, aufgeteilt in vier Zifferngruppen. Die erste Gruppe ist die Hausnummer dieses Hauses.',
    storyTextEn:
      'In a painting from this period, Munch hid numbers for his friend Scheel. The picture shows the Alter Strom at dusk. Digits are reflected in the water — barely visible, but they are there.',
    completionTextDe:
      'Die Zahl stimmt! Munchs Gemaelde war mehr als Kunst — es war eine Schatzkarte. Die Koordinaten fuehren zum Alten Strom selbst.',
    completionTextEn:
      'The number is correct! Munch\'s painting was more than art — it was a treasure map. The coordinates lead to the Alter Strom itself.',
    transitionTextDe:
      'Vom Munch-Haus sind es nur wenige Meter bis zum Alten Strom — dem historischen Wasserweg, an dem bunte Fischkutter liegen. Hier hat Scheel in einem alten Fischerhaus einen verschluesselten Brief hinterlegt.',
    transitionTextEn:
      'From the Munch house it\'s only a few meters to the Alter Strom — the historic waterway lined with colorful fishing boats. Here Scheel deposited an encrypted letter in an old fisherman\'s house.',
    walkingHintDe: 'Geht einfach Am Strom entlang Richtung Norden.',
    walkingHintEn: 'Simply walk along Am Strom heading north.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'harbor',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 10. Alter Strom ───────────────────────────────────────────────────
  {
    id: 'demo-station-010',
    tourId: DEMO_TOUR_ID,
    orderIndex: 9,
    nameDe: 'Der Alte Strom',
    nameEn: 'The Old Channel',
    subtitleDe: 'Wo Fischer ihre Geheimnisse hueten',
    subtitleEn: 'Where fishermen keep their secrets',
    location: { lat: 54.1780, lng: 12.0870 },
    locationName: 'Alter Strom',
    radiusMeters: 50,
    introTextDe:
      'Der Alte Strom ist das Herz von Warnemuende. Hier liegen bunte Fischkutter und die Luft riecht nach Raeucherfisch. Doch hinter der malerischen Fassade verbirgt sich ein Raetsel...',
    introTextEn:
      'The Old Channel is the heart of Warnemuende. Colorful fishing boats line the banks and the air smells of smoked fish.',
    storyTextDe:
      'In einem alten Fischerhaus fand man einen verschluesselten Brief des Kapitaens. Er erwaehnt drei Symbole, die zusammen einen Code ergeben. Nur wer die Geschichte Warnemuendes kennt, kann sie entschluesseln.',
    storyTextEn:
      'In an old fisherman\'s house, an encrypted letter from the captain was found. It mentions three symbols that together form a code.',
    completionTextDe:
      'Fantastisch! Der Brief enthaelt noch einen Zusatz: "Am Fischmarkt liegt mein letzter Bote — fragt die Fischer nach dem Knoten."',
    completionTextEn:
      'Fantastic! The letter contains an addition: "At the fish market lies my last messenger — ask the fishermen about the knot."',
    transitionTextDe:
      'Der Fischmarkt liegt am suedlichen Ende des Alten Stroms. Dort, wo die Fischer seit Jahrhunderten ihren Fang verkaufen, hatte Scheel einen Vertrauten — einen alten Fischer, der Botschaften in Seemannsknoten codierte.',
    transitionTextEn:
      'The fish market lies at the southern end of the Alter Strom. There, where fishermen have sold their catch for centuries, Scheel had a confidant — an old fisherman who encoded messages in sailor\'s knots.',
    walkingHintDe: 'Folgt dem Alten Strom nach Sueden — der Fischmarkt liegt am Ende.',
    walkingHintEn: 'Follow the Alter Strom south — the fish market is at the end.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'harbor',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 11. Fischmarkt ────────────────────────────────────────────────────
  {
    id: 'demo-station-011',
    tourId: DEMO_TOUR_ID,
    orderIndex: 10,
    nameDe: 'Der Fischmarkt',
    nameEn: 'The Fish Market',
    subtitleDe: 'Knoten und Botschaften',
    subtitleEn: 'Knots and messages',
    location: { lat: 54.1769, lng: 12.0887 },
    locationName: 'Fischmarkt am Alten Strom',
    radiusMeters: 50,
    introTextDe:
      'Der Fischmarkt — seit Jahrhunderten das Handelszentrum der Fischer. Hier werden nicht nur Fische verkauft, sondern auch Geschichten erzaehlt. Und manchmal Geheimnisse bewahrt.',
    introTextEn:
      'The fish market — the fishermen\'s trading center for centuries. Here, not just fish are sold, but stories are told. And sometimes secrets are kept.',
    storyTextDe:
      'Die Fischer am Hafen kannten Scheel. Ihre Knoten-Sprache — jeder Knoten eine Botschaft — war sein letztes Kommunikationsmittel. Vier Knoten haengen am alten Poller: Palstek=P, Kreuzknoten=K, Achtknoten=A, Schotstek=S. In welcher Reihenfolge hat Scheel sie angebracht?',
    storyTextEn:
      'The fishermen at the harbor knew Scheel. Their knot language — each knot a message — was his last means of communication.',
    completionTextDe:
      'Die Knoten sprechen! Scheels Botschaft ist fast vollstaendig. Der letzte Hinweis fuehrt zum Bahnhof — dort, wo seine Spur endgueltig verschwand.',
    completionTextEn:
      'The knots speak! Scheel\'s message is almost complete. The last clue leads to the train station — where his trail finally vanished.',
    transitionTextDe:
      'Scheels letzte dokumentierte Sichtung war am Bahnhof von Warnemuende. Der Fahrplan von 1923 enthaelt eine Anomalie — einen Zug, der nie existierte. Die Abfahrtszeiten ergeben eine Zahlenkombination. Geht zum Bahnhof — es ist sein letztes Raetsel.',
    transitionTextEn:
      'Scheel\'s last documented sighting was at the Warnemuende train station. The 1923 timetable contains an anomaly — a train that never existed.',
    walkingHintDe: 'Der Bahnhof liegt oestlich vom Fischmarkt — folgt der Strasse Am Strom.',
    walkingHintEn: 'The station is east of the fish market — follow Am Strom street.',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'harbor',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // ── 12. Bahnhof (Finale) ─────────────────────────────────────────────
  {
    id: 'demo-station-012',
    tourId: DEMO_TOUR_ID,
    orderIndex: 11,
    nameDe: 'Der Alte Bahnhof',
    nameEn: 'The Old Station',
    subtitleDe: 'Das letzte Vermaechtnis',
    subtitleEn: 'The final legacy',
    location: { lat: 54.1774, lng: 12.0904 },
    locationName: 'Bahnhof Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Der Bahnhof von Warnemuende — Endstation der Strecke aus Rostock und Tor zur Ostsee. Hier beginnen und enden Reisen. Fuer Kapitaen Scheel endete hier alles.',
    introTextEn:
      'The Warnemuende train station — the terminus of the line from Rostock and gateway to the Baltic Sea. Here journeys begin and end. For Captain Scheel, everything ended here.',
    storyTextDe:
      'Der Fahrplan von 1923 zeigt einen raetselhaften Eintrag: Zug 1923, Abfahrt 19:23, Gleis 0. Einen solchen Zug gab es nie. Scheel hatte die Nummer als Code hinterlassen. Welche Uhrzeit steht auf dem alten Fahrplan als Ankunftszeit dieses Geisterzuges?',
    storyTextEn:
      'The 1923 timetable shows a mysterious entry: Train 1923, departure 19:23, Platform 0. Such a train never existed. Scheel left the number as a code.',
    completionTextDe:
      'Glueckwunsch! Ihr habt das vollstaendige Vermaechtnis des Lotsenkapitaens entschluesselt!\n\nScheels letzte Botschaft lautet: "Warnemuende lebt in denen weiter, die es mit offenen Augen erkunden. Ich bin nicht verschwunden — ich bin ueberall hier."\n\nGeht zurueck zum Leuchtturm, wo alles begann. Eure Tour endet dort, wo sie angefangen hat — bei Shoes Please.',
    completionTextEn:
      'Congratulations! You have fully deciphered the pilot captain\'s legacy!\n\nScheel\'s final message reads: "Warnemuende lives on in those who explore it with open eyes. I did not disappear — I am everywhere here."\n\nReturn to the lighthouse where it all began.',
    transitionTextDe: null,
    transitionTextEn: null,
    walkingHintDe: null,
    walkingHintEn: null,
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'train',
    estimatedDurationMinutes: 10,
    createdAt: NOW,
    updatedAt: NOW,
  },
]

// ---------------------------------------------------------------------------
// Puzzles (1 per station)
// ---------------------------------------------------------------------------

export const DEMO_PUZZLES: readonly Puzzle[] = [
  // 1. Leuchtturm — Zählen
  {
    id: 'demo-puzzle-001',
    stationId: 'demo-station-001',
    orderIndex: 0,
    puzzleType: 'count',
    difficulty: 'easy',
    questionDe: 'Wie viele Stufen hat der Leuchtturm von Warnemuende?',
    questionEn: 'How many steps does the Warnemuende lighthouse have?',
    instructionDe: 'Tipp: Es sind mehr als 100 aber weniger als 140. Gebt die Zahl ein.',
    instructionEn: 'Hint: It is more than 100 but less than 140. Enter the number.',
    answerType: 'number',
    correctAnswer: { value: 135 },
    answerValidationMode: 'range',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 100,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 120,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 2. Teepott — Muster-Erkennung
  {
    id: 'demo-puzzle-002',
    stationId: 'demo-station-002',
    orderIndex: 0,
    puzzleType: 'count',
    difficulty: 'medium',
    questionDe: 'Wie viele Wellenberge hat das Dach des Teepotts? Zaehlt die grossen Boegen der Dachkonstruktion.',
    questionEn: 'How many wave crests does the Teepott roof have? Count the large arches of the roof construction.',
    instructionDe: 'Schaut euch das Dach von vorne an und zaehlt die nach oben gewoelbten Boegen.',
    instructionEn: 'Look at the roof from the front and count the upward-curved arches.',
    answerType: 'number',
    correctAnswer: { value: 3 },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 100,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 90,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 3. Westmole — Kombination
  {
    id: 'demo-puzzle-003',
    stationId: 'demo-station-003',
    orderIndex: 0,
    puzzleType: 'combination',
    difficulty: 'hard',
    questionDe: 'Am gruenen Leuchtfeuer hat Kapitaen Scheel eine Jahreszahl eingeritzt — das Jahr, in dem er Lotsenkapitaen wurde. Gebt den 4-stelligen Code ein.',
    questionEn: 'At the green pier light, Captain Scheel carved a year — the year he became pilot captain. Enter the 4-digit code.',
    instructionDe: 'Tipp: Es war kurz nach der Jahrhundertwende.',
    instructionEn: 'Hint: It was shortly after the turn of the century.',
    answerType: 'text',
    correctAnswer: { value: '1903' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 200,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 120,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 4. Kurhaus — Visuelles Puzzle
  {
    id: 'demo-puzzle-004',
    stationId: 'demo-station-004',
    orderIndex: 0,
    puzzleType: 'count',
    difficulty: 'medium',
    questionDe: 'Wie viele Rauten zaehlt ihr im zentralen Ornament-Muster an der Kurhaus-Fassade?',
    questionEn: 'How many diamonds can you count in the central ornament pattern on the Kurhaus facade?',
    instructionDe: 'Schaut euch die Fassade genau an. Zaehlt nur die vollstaendigen Rauten im zentralen Bereich.',
    instructionEn: 'Look carefully at the facade. Count only the complete diamonds in the central area.',
    answerType: 'number',
    correctAnswer: { value: 8 },
    answerValidationMode: 'range',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 150,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 120,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 5. Strand — Kombination
  {
    id: 'demo-puzzle-005',
    stationId: 'demo-station-005',
    orderIndex: 0,
    puzzleType: 'combination',
    difficulty: 'medium',
    questionDe: 'Gebt den 4-stelligen Code ein, um die Truhe zu oeffnen. Die Kombination ist das Gruendungsjahr des Warnemuender Leuchtturms.',
    questionEn: 'Enter the 4-digit code to open the chest. The combination is the founding year of the Warnemuende lighthouse.',
    instructionDe: 'Tipp: Der Leuchtturm wurde Ende des 19. Jahrhunderts gebaut.',
    instructionEn: 'Hint: The lighthouse was built at the end of the 19th century.',
    answerType: 'text',
    correctAnswer: { value: '1897' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 150,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 120,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 6. Kirchplatz — Symbol-Suche
  {
    id: 'demo-puzzle-006',
    stationId: 'demo-station-006',
    orderIndex: 0,
    puzzleType: 'symbol_find',
    difficulty: 'medium',
    questionDe: 'Welches Symbol der Seefahrer findet sich an der Kirchentuer? Gebt den Namen des Symbols ein.',
    questionEn: 'Which seafarer symbol can be found on the church door? Enter the name of the symbol.',
    instructionDe: 'Es ist ein schweres Eisengeraet, das Schiffe am Meeresgrund haelt.',
    instructionEn: 'It is a heavy iron device that holds ships to the seabed.',
    answerType: 'text',
    correctAnswer: { value: 'ANKER' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 150,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 90,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 7. Heimatmuseum — Wort-Rätsel
  {
    id: 'demo-puzzle-007',
    stationId: 'demo-station-007',
    orderIndex: 0,
    puzzleType: 'text_analysis',
    difficulty: 'medium',
    questionDe: 'Im Inventarverzeichnis stehen fuenf Gegenstaende: Anker, Netz, Kompass, Eimer, Ruder. Welches Wort ergeben die Anfangsbuchstaben?',
    questionEn: 'The inventory lists five items: Anchor, Net, Compass, Edge, Rudder. What word do the initial letters spell?',
    instructionDe: 'Nehmt den ersten Buchstaben jedes Gegenstands und setzt sie zusammen.',
    instructionEn: 'Take the first letter of each item and put them together.',
    answerType: 'text',
    correctAnswer: { value: 'ANKER' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 100,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 60,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 8. Vogtei — Reihenfolge-Rätsel
  {
    id: 'demo-puzzle-008',
    stationId: 'demo-station-008',
    orderIndex: 0,
    puzzleType: 'combination',
    difficulty: 'hard',
    questionDe: 'Die fuenf Siegel an der Fassade stehen fuer Zahlen: Anker=1, Kreuz=2, Stern=3, Welle=4, Krone=5. Von links nach rechts seht ihr: Stern, Anker, Krone, Welle, Kreuz. Gebt den 5-stelligen Code ein.',
    questionEn: 'The five seals represent numbers: Anchor=1, Cross=2, Star=3, Wave=4, Crown=5. From left to right: Star, Anchor, Crown, Wave, Cross. Enter the 5-digit code.',
    instructionDe: 'Uebersetzt die Symbole in Zahlen, von links nach rechts.',
    instructionEn: 'Translate the symbols to numbers, from left to right.',
    answerType: 'text',
    correctAnswer: { value: '31542' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 200,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 120,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 9. Edvard-Munch-Haus — Bild-Analyse
  {
    id: 'demo-puzzle-009',
    stationId: 'demo-station-009',
    orderIndex: 0,
    puzzleType: 'combination',
    difficulty: 'medium',
    questionDe: 'Die erste Zifferngruppe in Munchs Gemaelde ist die Hausnummer des Munch-Hauses Am Strom. Welche Nummer ist es?',
    questionEn: 'The first digit group in Munch\'s painting is the house number of the Munch house on Am Strom. What number is it?',
    instructionDe: 'Schaut auf die Hausnummer am Gebaeude.',
    instructionEn: 'Look at the house number on the building.',
    answerType: 'text',
    correctAnswer: { value: '53' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 100,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 90,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 10. Alter Strom — Logik
  {
    id: 'demo-puzzle-010',
    stationId: 'demo-station-010',
    orderIndex: 0,
    puzzleType: 'logic',
    difficulty: 'medium',
    questionDe: 'Was wurde traditionell am Alten Strom gehandelt, bevor es ein Touristenziel wurde?',
    questionEn: 'What was traditionally traded at the Alter Strom before it became a tourist destination?',
    instructionDe: 'Waehlt die richtige Antwort.',
    instructionEn: 'Choose the correct answer.',
    answerType: 'multiple_choice',
    correctAnswer: { value: 'b' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: [
      { id: 'a', textDe: 'Bernstein und Schmuck', textEn: 'Amber and jewelry' },
      { id: 'b', textDe: 'Fisch und Meeresfrüchte', textEn: 'Fish and seafood' },
      { id: 'c', textDe: 'Schiffsbauholz', textEn: 'Shipbuilding timber' },
      { id: 'd', textDe: 'Salz und Gewuerze', textEn: 'Salt and spices' },
    ],
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 150,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 90,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 11. Fischmarkt — Knoten-Code
  {
    id: 'demo-puzzle-011',
    stationId: 'demo-station-011',
    orderIndex: 0,
    puzzleType: 'logic',
    difficulty: 'hard',
    questionDe: 'Vier Knoten haengen am Poller: Palstek (P), Kreuzknoten (K), Achtknoten (A), Schotstek (S). Scheels Botschaft beginnt immer mit seinem Lieblingsknoten — dem Palstek — und endet mit dem Achtknoten. Welche Reihenfolge ergibt sein Name PKAS?',
    questionEn: 'Four knots hang from the bollard. Scheel\'s message always starts with his favorite knot — the bowline — and ends with the figure eight.',
    instructionDe: 'Waehlt die richtige Reihenfolge der vier Buchstaben.',
    instructionEn: 'Choose the correct order of the four letters.',
    answerType: 'multiple_choice',
    correctAnswer: { value: 'c' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: [
      { id: 'a', textDe: 'KPSA', textEn: 'KPSA' },
      { id: 'b', textDe: 'PASK', textEn: 'PASK' },
      { id: 'c', textDe: 'PKSA', textEn: 'PKSA' },
      { id: 'd', textDe: 'SPKA', textEn: 'SPKA' },
    ],
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 200,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 120,
    createdAt: NOW,
    updatedAt: NOW,
  },

  // 12. Bahnhof — Finale
  {
    id: 'demo-puzzle-012',
    stationId: 'demo-station-012',
    orderIndex: 0,
    puzzleType: 'combination',
    difficulty: 'finale',
    questionDe: 'Der Geisterzug 1923 faehrt um 19:23 ab Gleis 0. Die Ankunftszeit ist Scheels Geburtsjahr rueckwaerts gelesen. Er wurde 1867 geboren. Was ist die Ankunftszeit als 4-stellige Zahl?',
    questionEn: 'Ghost train 1923 departs at 19:23 from Platform 0. The arrival time is Scheel\'s birth year read backwards. He was born in 1867. What is the arrival time as a 4-digit number?',
    instructionDe: 'Lest die Jahreszahl 1867 rueckwaerts.',
    instructionEn: 'Read the year 1867 backwards.',
    answerType: 'text',
    correctAnswer: { value: '7681' },
    answerValidationMode: 'exact',
    caseSensitive: false,
    options: null,
    arMarkerUrl: null,
    arContent: null,
    targetLocation: null,
    targetRadiusMeters: null,
    imageUrl: null,
    audioUrl: null,
    basePoints: 250,
    timeBonusEnabled: true,
    timeBonusMaxSeconds: 150,
    createdAt: NOW,
    updatedAt: NOW,
  },
]

// ---------------------------------------------------------------------------
// Hints (2 per puzzle)
// ---------------------------------------------------------------------------

export interface DemoHint {
  readonly id: string
  readonly puzzle_id: string
  readonly hint_level: number
  readonly text_de: string
  readonly text_en: string
  readonly point_penalty: number
  readonly time_bonus_penalty_percent: number
  readonly marks_as_skipped: boolean
  readonly available_after_seconds: number
}

export const DEMO_HINTS: ReadonlyMap<string, readonly DemoHint[]> = new Map([
  [
    'demo-puzzle-001',
    [
      { id: 'hint-001-1', puzzle_id: 'demo-puzzle-001', hint_level: 1, text_de: 'Der Leuchtturm ist 31 Meter hoch. Die Stufen sind relativ eng.', text_en: 'The lighthouse is 31 meters tall. The steps are relatively narrow.', point_penalty: 20, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-001-2', puzzle_id: 'demo-puzzle-001', hint_level: 2, text_de: 'Die Antwort liegt zwischen 130 und 140.', text_en: 'The answer is between 130 and 140.', point_penalty: 40, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-002',
    [
      { id: 'hint-002-1', puzzle_id: 'demo-puzzle-002', hint_level: 1, text_de: 'Das Dach hat eine hyperbolische Paraboloid-Form. Zaehlt die grossen Boegen.', text_en: 'The roof has a hyperbolic paraboloid shape. Count the large arches.', point_penalty: 20, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-002-2', puzzle_id: 'demo-puzzle-002', hint_level: 2, text_de: 'Es sind weniger als 5 Wellenberge.', text_en: 'There are fewer than 5 wave crests.', point_penalty: 40, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-003',
    [
      { id: 'hint-003-1', puzzle_id: 'demo-puzzle-003', hint_level: 1, text_de: 'Scheel wurde zu Beginn des 20. Jahrhunderts ernannt. Die Jahreszahl beginnt mit 19...', text_en: 'Scheel was appointed at the beginning of the 20th century.', point_penalty: 40, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-003-2', puzzle_id: 'demo-puzzle-003', hint_level: 2, text_de: 'Die Jahreszahl hat vier Ziffern und endet mit 03.', text_en: 'The year has four digits and ends with 03.', point_penalty: 80, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-004',
    [
      { id: 'hint-004-1', puzzle_id: 'demo-puzzle-004', hint_level: 1, text_de: 'Schaut auf die obere Fassade — die Rauten sind symmetrisch angeordnet.', text_en: 'Look at the upper facade — the diamonds are arranged symmetrically.', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-004-2', puzzle_id: 'demo-puzzle-004', hint_level: 2, text_de: 'Es sind zwischen 6 und 10 Rauten.', text_en: 'There are between 6 and 10 diamonds.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-005',
    [
      { id: 'hint-005-1', puzzle_id: 'demo-puzzle-005', hint_level: 1, text_de: 'Es ist ein Jahr im 19. Jahrhundert. Denkt an die erste Station.', text_en: 'It is a year in the 19th century. Think about the first station.', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-005-2', puzzle_id: 'demo-puzzle-005', hint_level: 2, text_de: 'Das Jahr beginnt mit 18 und endet mit 97.', text_en: 'The year starts with 18 and ends with 97.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-006',
    [
      { id: 'hint-006-1', puzzle_id: 'demo-puzzle-006', hint_level: 1, text_de: 'Jedes Schiff hat eines, um nicht abzutreiben.', text_en: 'Every ship has one to keep from drifting away.', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 20 },
      { id: 'hint-006-2', puzzle_id: 'demo-puzzle-006', hint_level: 2, text_de: 'Es ist schwer, aus Eisen, und haelt am Meeresgrund. 5 Buchstaben.', text_en: 'It is heavy, made of iron, and holds to the seabed. 6 letters.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 45 },
    ],
  ],
  [
    'demo-puzzle-007',
    [
      { id: 'hint-007-1', puzzle_id: 'demo-puzzle-007', hint_level: 1, text_de: 'Nehmt nur den allerersten Buchstaben jedes Wortes.', text_en: 'Take only the very first letter of each word.', point_penalty: 20, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 20 },
      { id: 'hint-007-2', puzzle_id: 'demo-puzzle-007', hint_level: 2, text_de: 'A-N-K-E-R. Das Wort hat 5 Buchstaben und haelt Schiffe fest.', text_en: 'A-N-C-E-R. The word has 5 letters and holds ships in place.', point_penalty: 40, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 45 },
    ],
  ],
  [
    'demo-puzzle-008',
    [
      { id: 'hint-008-1', puzzle_id: 'demo-puzzle-008', hint_level: 1, text_de: 'Stern=3, also beginnt der Code mit 3. Anker=1, also ist die zweite Ziffer 1.', text_en: 'Star=3, so the code starts with 3. Anchor=1, so the second digit is 1.', point_penalty: 40, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-008-2', puzzle_id: 'demo-puzzle-008', hint_level: 2, text_de: 'Der Code lautet 3-1-5-4-2.', text_en: 'The code is 3-1-5-4-2.', point_penalty: 80, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-009',
    [
      { id: 'hint-009-1', puzzle_id: 'demo-puzzle-009', hint_level: 1, text_de: 'Die Hausnummer steht direkt am Eingang des Gebaeudes.', text_en: 'The house number is right at the entrance of the building.', point_penalty: 20, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 20 },
      { id: 'hint-009-2', puzzle_id: 'demo-puzzle-009', hint_level: 2, text_de: 'Am Strom Nummer fuenfzig-drei.', text_en: 'Am Strom number fifty-three.', point_penalty: 40, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 45 },
    ],
  ],
  [
    'demo-puzzle-010',
    [
      { id: 'hint-010-1', puzzle_id: 'demo-puzzle-010', hint_level: 1, text_de: 'Denkt an den Namen: "Alter Strom" — ein Wasserweg fuer...?', text_en: 'Think about the name: "Alter Strom" — a waterway for...?', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 20 },
      { id: 'hint-010-2', puzzle_id: 'demo-puzzle-010', hint_level: 2, text_de: 'Die bunten Kutter am Ufer sind ein starker Hinweis.', text_en: 'The colorful cutters on the shore are a strong hint.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 45 },
    ],
  ],
  [
    'demo-puzzle-011',
    [
      { id: 'hint-011-1', puzzle_id: 'demo-puzzle-011', hint_level: 1, text_de: 'Scheels Lieblingsknoten ist der Palstek (P) — damit beginnt die Reihenfolge.', text_en: 'Scheel\'s favorite knot is the bowline (P) — the sequence starts with it.', point_penalty: 40, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-011-2', puzzle_id: 'demo-puzzle-011', hint_level: 2, text_de: 'Es endet mit dem Achtknoten (A). Also: P-?-?-A. Die Mitte ist K-S.', text_en: 'It ends with the figure eight (A). So: P-?-?-A. The middle is K-S.', point_penalty: 80, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-012',
    [
      { id: 'hint-012-1', puzzle_id: 'demo-puzzle-012', hint_level: 1, text_de: 'Rueckwaerts lesen: 1-8-6-7 wird zu 7-6-8-1.', text_en: 'Read backwards: 1-8-6-7 becomes 7-6-8-1.', point_penalty: 50, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-012-2', puzzle_id: 'demo-puzzle-012', hint_level: 2, text_de: 'Die Antwort ist 7681.', text_en: 'The answer is 7681.', point_penalty: 100, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
])

// ---------------------------------------------------------------------------
// Certificate (returned when demo session completes)
// ---------------------------------------------------------------------------

export const DEMO_CERTIFICATE: Certificate = {
  id: 'demo-cert-001',
  sessionId: DEMO_SESSION_ID,
  teamName: 'Demo Team',
  tourName: 'Das Vermaechtnis des Lotsenkapitaens',
  variant: 'adult',
  date: NOW,
  stats: {
    totalPoints: 1850,
    totalTimeMinutes: 110,
    hintsUsed: 0,
    puzzlesSkipped: 0,
    stationsCompleted: 12,
  },
  badge: 'gold',
  verificationCode: 'DEMO-2026-GOLD',
}
