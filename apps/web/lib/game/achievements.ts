export interface Achievement {
  readonly id: string
  readonly titleDe: string
  readonly titleEn: string
  readonly descriptionDe: string
  readonly descriptionEn: string
  readonly icon: string
}

interface GameStats {
  readonly totalPoints: number
  readonly totalTimeMinutes: number
  readonly hintsUsed: number
  readonly puzzlesSkipped: number
  readonly stationsCompleted: number
}

const ALL_ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'no_hints',
    titleDe: 'Meisterdetektiv',
    titleEn: 'Master Detective',
    descriptionDe: 'Alle Rätsel ohne Hinweise gelöst',
    descriptionEn: 'Solved all puzzles without hints',
    icon: 'search',
  },
  {
    id: 'speed_run',
    titleDe: 'Blitz-Ermittler',
    titleEn: 'Speed Runner',
    descriptionDe: 'Tour in unter 90 Minuten abgeschlossen',
    descriptionEn: 'Completed tour in under 90 minutes',
    icon: 'zap',
  },
  {
    id: 'perfect_score',
    titleDe: 'Perfektionist',
    titleEn: 'Perfectionist',
    descriptionDe: 'Über 80% der maximalen Punkte erreicht',
    descriptionEn: 'Earned over 80% of maximum points',
    icon: 'star',
  },
  {
    id: 'no_skips',
    titleDe: 'Durchhalter',
    titleEn: 'Persistent',
    descriptionDe: 'Kein einziges Rätsel übersprungen',
    descriptionEn: 'Didn\'t skip a single puzzle',
    icon: 'anchor',
  },
  {
    id: 'all_stations',
    titleDe: 'Entdecker',
    titleEn: 'Explorer',
    descriptionDe: 'Alle 12 Stationen besucht',
    descriptionEn: 'Visited all 12 stations',
    icon: 'compass',
  },
  {
    id: 'under_60',
    titleDe: 'Zeitreisender',
    titleEn: 'Time Traveler',
    descriptionDe: 'Tour in unter 60 Minuten abgeschlossen',
    descriptionEn: 'Completed tour in under 60 minutes',
    icon: 'clock',
  },
  {
    id: 'first_try',
    titleDe: 'Scharfsinn',
    titleEn: 'Sharp Mind',
    descriptionDe: 'Keine Hinweise und keine Fehlversuche',
    descriptionEn: 'No hints and no wrong answers',
    icon: 'target',
  },
]

export function calculateAchievements(
  stats: GameStats,
  maxPoints: number,
): readonly Achievement[] {
  const earned: Achievement[] = []

  if (stats.hintsUsed === 0) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'no_hints')!)
  }

  if (stats.totalTimeMinutes < 90) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'speed_run')!)
  }

  if (stats.totalTimeMinutes < 60) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'under_60')!)
  }

  if (maxPoints > 0 && stats.totalPoints >= maxPoints * 0.8) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'perfect_score')!)
  }

  if (stats.puzzlesSkipped === 0) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'no_skips')!)
  }

  if (stats.stationsCompleted >= 12) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'all_stations')!)
  }

  if (stats.hintsUsed === 0 && stats.puzzlesSkipped === 0) {
    earned.push(ALL_ACHIEVEMENTS.find((a) => a.id === 'first_try')!)
  }

  return earned
}
