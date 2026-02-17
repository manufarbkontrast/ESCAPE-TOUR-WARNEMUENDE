/**
 * Demo mode mock data for testing the full game flow without Supabase.
 * Use booking code "DEMO01" to activate demo mode.
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
// Stations (3 real Warnemuende locations)
// ---------------------------------------------------------------------------

export const DEMO_STATIONS: readonly Station[] = [
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
      'Ausgezeichnet! Ihr habt das erste Raetsel geloest. Kapitaen Scheel hinterliess weitere Hinweise am Alten Strom. Macht euch auf den Weg!',
    completionTextEn:
      'Excellent! You solved the first puzzle. Captain Scheel left more clues at the Alter Strom. Head there now!',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'waves',
    estimatedDurationMinutes: 15,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'demo-station-002',
    tourId: DEMO_TOUR_ID,
    orderIndex: 1,
    nameDe: 'Der Alte Strom',
    nameEn: 'The Old Channel',
    subtitleDe: 'Wo Fischer ihre Geheimnisse hueten',
    subtitleEn: 'Where fishermen keep their secrets',
    location: { lat: 54.1782, lng: 12.0843 },
    locationName: 'Alter Strom',
    radiusMeters: 50,
    introTextDe:
      'Der Alte Strom ist das Herz von Warnemuende. Hier liegen bunte Fischkutter und die Luft riecht nach Raeucherfisch. Doch hinter der malerischen Fassade verbirgt sich ein Raetsel...',
    introTextEn:
      'The Old Channel is the heart of Warnemuende. Colorful fishing boats line the banks and the air smells of smoked fish. But behind the picturesque facade lies a puzzle...',
    storyTextDe:
      'In einem alten Fischerhaus fand man einen verschluesselten Brief des Kapitaens. Er erwaehnt drei Symbole, die zusammen einen Code ergeben. Nur wer die Geschichte Warnemuendes kennt, kann sie entschluesseln.',
    storyTextEn:
      'In an old fisherman\'s house, an encrypted letter from the captain was found. It mentions three symbols that together form a code. Only those who know the history of Warnemuende can decipher it.',
    completionTextDe:
      'Fantastisch! Der Code fuehrt euch zum letzten Ort — dem Teepott. Dort wartet das finale Raetsel auf euch!',
    completionTextEn:
      'Fantastic! The code leads you to the final location — the Teepott. The ultimate puzzle awaits you there!',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'harbor',
    estimatedDurationMinutes: 20,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'demo-station-003',
    tourId: DEMO_TOUR_ID,
    orderIndex: 2,
    nameDe: 'Der Teepott',
    nameEn: 'The Teepott',
    subtitleDe: 'Das grosse Finale',
    subtitleEn: 'The grand finale',
    location: { lat: 54.1817, lng: 12.0858 },
    locationName: 'Teepott Warnemuende',
    radiusMeters: 50,
    introTextDe:
      'Der Teepott — Warnemuendes beruehmtestes Gebaeude mit seiner muschelfoermigen Dachkonstruktion. Hier endet eure Suche und Kapitaen Scheels Vermaechtnis wird enthuellt.',
    introTextEn:
      'The Teepott — Warnemuende\'s most famous building with its shell-shaped roof. Here your search ends and Captain Scheel\'s legacy will be revealed.',
    storyTextDe:
      'Unter dem Fundament des Teepotts wurde 1998 bei Renovierungsarbeiten eine Metallkassette gefunden. Darin lag ein letzter Brief des Kapitaens mit einer Botschaft an die Nachwelt. Koennt ihr sie entschluesseln?',
    storyTextEn:
      'During renovation work in 1998, a metal box was found under the Teepott\'s foundation. Inside was a final letter from the captain with a message for posterity. Can you decipher it?',
    completionTextDe:
      'Gut gemacht! Die entschluesselte Botschaft fuehrt euch weiter zum Strand. Dort wartet ein neues Geheimnis...',
    completionTextEn:
      'Well done! The deciphered message leads you to the beach. A new mystery awaits there...',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'seagulls',
    estimatedDurationMinutes: 20,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'demo-station-004',
    tourId: DEMO_TOUR_ID,
    orderIndex: 3,
    nameDe: 'Am Strand',
    nameEn: 'At the Beach',
    subtitleDe: 'Spuren im Sand',
    subtitleEn: 'Traces in the sand',
    location: { lat: 54.1805, lng: 12.0845 },
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
      'Die Truhe oeffnet sich! Darin liegt eine alte Seekarte mit einem markierten Ort — der Kirchplatz. Eilt dorthin fuer das letzte Raetsel!',
    completionTextEn:
      'The chest opens! Inside lies an old nautical chart with a marked location — the church square. Hurry there for the final puzzle!',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'waves',
    estimatedDurationMinutes: 15,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'demo-station-005',
    tourId: DEMO_TOUR_ID,
    orderIndex: 4,
    nameDe: 'Der Kirchplatz',
    nameEn: 'The Church Square',
    subtitleDe: 'Das letzte Vermaechtnis',
    subtitleEn: 'The final legacy',
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
      'Glueckwunsch! Ihr habt das Vermaechtnis des Lotsenkapitaens vollstaendig entschluesselt! Die Botschaft lautet: "Warnemuende lebt in denen weiter, die es mit offenen Augen erkunden."',
    completionTextEn:
      'Congratulations! You have fully deciphered the pilot captain\'s legacy! The message reads: "Warnemuende lives on in those who explore it with open eyes."',
    headerImageUrl: null,
    backgroundAudioUrl: null,
    ambientSound: 'church_bells',
    estimatedDurationMinutes: 15,
    createdAt: NOW,
    updatedAt: NOW,
  },
]

// ---------------------------------------------------------------------------
// Puzzles (1 per station, using different puzzle types)
// ---------------------------------------------------------------------------

export const DEMO_PUZZLES: readonly Puzzle[] = [
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
  {
    id: 'demo-puzzle-002',
    stationId: 'demo-station-002',
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
  {
    id: 'demo-puzzle-003',
    stationId: 'demo-station-003',
    orderIndex: 0,
    puzzleType: 'text_analysis',
    difficulty: 'hard',
    questionDe: 'Entschluesselt die Botschaft des Kapitaens! Die Anfangsbuchstaben ergeben das Loesungswort: "Wellen Am Ruder Nehmen Einander Mutig Ueber Ebbe Nacht Dauer Endlos"',
    questionEn: 'Decipher the captain\'s message! The first letters spell the answer: "Waves At Rudder Navigate Each Moment Under Ebb Night Duration Endlessly"',
    instructionDe: 'Lest die Anfangsbuchstaben und gebt das Loesungswort ein.',
    instructionEn: 'Read the first letters and enter the solution word.',
    answerType: 'text',
    correctAnswer: { value: 'WARNEMUENDE' },
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
    timeBonusMaxSeconds: 180,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'demo-puzzle-004',
    stationId: 'demo-station-004',
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
  {
    id: 'demo-puzzle-005',
    stationId: 'demo-station-005',
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
]

// ---------------------------------------------------------------------------
// Hints (2 per puzzle)
// ---------------------------------------------------------------------------

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
      { id: 'hint-002-1', puzzle_id: 'demo-puzzle-002', hint_level: 1, text_de: 'Denkt an den Namen: "Alter Strom" — ein Wasserweg fuer...?', text_en: 'Think about the name: "Alter Strom" — a waterway for...?', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 20 },
      { id: 'hint-002-2', puzzle_id: 'demo-puzzle-002', hint_level: 2, text_de: 'Die bunten Kutter am Ufer sind ein starker Hinweis.', text_en: 'The colorful cutters on the shore are a strong hint.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 45 },
    ],
  ],
  [
    'demo-puzzle-003',
    [
      { id: 'hint-003-1', puzzle_id: 'demo-puzzle-003', hint_level: 1, text_de: 'Nehmt den ersten Buchstaben jedes Wortes in der Botschaft.', text_en: 'Take the first letter of each word in the message.', point_penalty: 40, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-003-2', puzzle_id: 'demo-puzzle-003', hint_level: 2, text_de: 'Das Loesungswort ist der Name des Ortes, an dem ihr euch befindet.', text_en: 'The solution word is the name of the place you are at.', point_penalty: 80, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-004',
    [
      { id: 'hint-004-1', puzzle_id: 'demo-puzzle-004', hint_level: 1, text_de: 'Es ist ein Jahr im 19. Jahrhundert. Denkt an die erste Station.', text_en: 'It is a year in the 19th century. Think about the first station.', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 30 },
      { id: 'hint-004-2', puzzle_id: 'demo-puzzle-004', hint_level: 2, text_de: 'Das Jahr beginnt mit 18 und endet mit 97.', text_en: 'The year starts with 18 and ends with 97.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 60 },
    ],
  ],
  [
    'demo-puzzle-005',
    [
      { id: 'hint-005-1', puzzle_id: 'demo-puzzle-005', hint_level: 1, text_de: 'Jedes Schiff hat eines, um nicht abzutreiben.', text_en: 'Every ship has one to keep from drifting away.', point_penalty: 30, time_bonus_penalty_percent: 25, marks_as_skipped: false, available_after_seconds: 20 },
      { id: 'hint-005-2', puzzle_id: 'demo-puzzle-005', hint_level: 2, text_de: 'Es ist schwer, aus Eisen, und haelt am Meeresgrund. 5 Buchstaben.', text_en: 'It is heavy, made of iron, and holds to the seabed. 6 letters.', point_penalty: 50, time_bonus_penalty_percent: 50, marks_as_skipped: false, available_after_seconds: 45 },
    ],
  ],
])

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
    totalPoints: 750,
    totalTimeMinutes: 55,
    hintsUsed: 0,
    puzzlesSkipped: 0,
    stationsCompleted: 5,
  },
  badge: 'gold',
  verificationCode: 'DEMO-2026-GOLD',
}
