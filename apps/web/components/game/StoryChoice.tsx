'use client'

import { motion } from 'framer-motion'

export interface StoryBranch {
  readonly id: string
  readonly labelDe: string
  readonly labelEn: string
  readonly resultTextDe: string
  readonly resultTextEn: string
}

interface StoryChoiceProps {
  readonly promptDe: string
  readonly promptEn: string
  readonly branches: readonly StoryBranch[]
  readonly language: 'de' | 'en'
  readonly onChoose: (branch: StoryBranch) => void
}

export function StoryChoice({ promptDe, promptEn, branches, language, onChoose }: StoryChoiceProps) {
  const prompt = language === 'de' ? promptDe : promptEn

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <p className="text-base font-semibold text-white/70 text-center leading-relaxed">
        {prompt}
      </p>

      <div className="space-y-2">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onChoose(branch)}
            className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-white transition-all duration-150 hover:bg-white/[0.06]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {language === 'de' ? branch.labelDe : branch.labelEn}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/**
 * Story choice data for specific stations.
 * Only stations with choices are included.
 */
export const STORY_CHOICES: ReadonlyMap<number, {
  readonly promptDe: string
  readonly promptEn: string
  readonly branches: readonly StoryBranch[]
}> = new Map([
  // Station 3 (Westmole): Which direction did Scheel go?
  [2, {
    promptDe: 'Am Ende der Mole angekommen — in welche Richtung schaut ihr?',
    promptEn: 'At the end of the pier — which direction do you look?',
    branches: [
      {
        id: 'sea',
        labelDe: 'Aufs offene Meer hinaus — dort wo Scheel hinwollte',
        labelEn: 'Out to the open sea — where Scheel wanted to go',
        resultTextDe: 'Ihr blickt auf die endlose Ostsee. Der Wind peitscht. Scheel stand genau hier und starrte in die Dunkelheit. Was hat er dort draußen gesehen?',
        resultTextEn: 'You gaze at the endless Baltic. The wind lashes. Scheel stood right here, staring into the darkness.',
      },
      {
        id: 'land',
        labelDe: 'Zurück zum Festland — wo seine Geheimnisse liegen',
        labelEn: 'Back to land — where his secrets lie',
        resultTextDe: 'Ihr dreht euch um. Die Lichter von Warnemünde glitzern. Irgendwo dort hat Scheel seine Botschaften versteckt — in Steinen, Siegeln und vergessenen Inventaren.',
        resultTextEn: 'You turn around. The lights of Warnemünde glitter. Somewhere there, Scheel hid his messages.',
      },
    ],
  }],

  // Station 6 (Kirchplatz): How to approach the church?
  [5, {
    promptDe: 'Ihr steht vor der Kirche. Wie wollt ihr vorgehen?',
    promptEn: 'You stand before the church. How do you proceed?',
    branches: [
      {
        id: 'door',
        labelDe: 'Direkt zur Kirchentür — das Symbol suchen',
        labelEn: 'Straight to the church door — look for the symbol',
        resultTextDe: 'Ihr geht entschlossen zur schweren Eichentür. Eure Finger streichen über das kalte Metall. Dort, eingelassen in das Holz, findet ihr es...',
        resultTextEn: 'You walk determinedly to the heavy oak door. Your fingers trace the cold metal. There, set into the wood, you find it...',
      },
      {
        id: 'around',
        labelDe: 'Erst die Kirche umrunden — nach weiteren Hinweisen suchen',
        labelEn: 'Walk around the church first — look for more clues',
        resultTextDe: 'Ihr umrundet die Kirche. An der Nordseite, fast verborgen hinter Efeu, entdeckt ihr eine verwitterte Inschrift: "Für die, die suchen." Dann erst geht ihr zur Tür.',
        resultTextEn: 'You walk around the church. On the north side, hidden behind ivy, you discover a weathered inscription: "For those who seek."',
      },
    ],
  }],

  // Station 9 (Munch-Haus): What catches your attention?
  [8, {
    promptDe: 'Im Munch-Haus angekommen — was zieht euren Blick an?',
    promptEn: 'Arrived at the Munch house — what catches your eye?',
    branches: [
      {
        id: 'plaque',
        labelDe: 'Die Gedenktafel an der Hauswand lesen',
        labelEn: 'Read the memorial plaque on the wall',
        resultTextDe: 'Die Tafel erzählt von Munchs Zeit hier, seinen Spaziergängen am Strom, dem besonderen Licht, das ihn nach Warnemünde zog. Ein Satz springt euch ins Auge...',
        resultTextEn: 'The plaque tells of Munch\'s time here, his walks along the Strom, the special light that drew him to Warnemünde.',
      },
      {
        id: 'window',
        labelDe: 'Durch die Fenster ins ehemalige Atelier schauen',
        labelEn: 'Look through the windows into the former studio',
        resultTextDe: 'Durch das Glas seht ihr den Raum, in dem Munch malte. Das Licht fällt schräg herein — genau das Licht, das er einfangen wollte. An der Wand hängt eine alte Uhr...',
        resultTextEn: 'Through the glass you see the room where Munch painted. Light falls at an angle — the very light he wanted to capture.',
      },
    ],
  }],

  // Station 11 (Bahnhof/Finale): How to enter the code?
  [11, {
    promptDe: 'Der Geisterzug wartet. Seid ihr bereit für das letzte Rätsel?',
    promptEn: 'The ghost train awaits. Are you ready for the final puzzle?',
    branches: [
      {
        id: 'confident',
        labelDe: 'Wir haben alles — los geht\'s!',
        labelEn: 'We have everything — let\'s go!',
        resultTextDe: 'Mit festem Blick tretet ihr an den alten Fahrplan-Kasten. Die Zeiger der Bahnhofsuhr stehen still. Es ist Zeit, Scheels Code einzugeben.',
        resultTextEn: 'With steady eyes you approach the old timetable case. The station clock has stopped. It\'s time to enter Scheel\'s code.',
      },
      {
        id: 'review',
        labelDe: 'Kurz die bisherigen Hinweise durchgehen',
        labelEn: 'Quickly review the clues so far',
        resultTextDe: 'Ihr haltet inne. Die Vogtei — 13. Jahrhundert. Scheels Ernennung — 1903. Das Munch-Haus — Nummer 53. Alles fügt sich zusammen wie die Zahnräder einer Uhr.',
        resultTextEn: 'You pause. The Vogtei — 13th century. Scheel\'s appointment — 1903. The Munch house — number 53. Everything fits together like clockwork.',
      },
    ],
  }],
])
