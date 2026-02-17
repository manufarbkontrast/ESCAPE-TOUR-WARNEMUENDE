import type { Puzzle } from '@escape-tour/shared'

/**
 * Creates a mock Puzzle with sensible defaults.
 * All fields are overridable via the `overrides` parameter.
 */
export function createMockPuzzle(overrides: Partial<Puzzle> = {}): Puzzle {
  return {
    id: 'puzzle-1',
    stationId: 'station-1',
    orderIndex: 0,
    puzzleType: 'text_analysis',
    difficulty: 'medium',
    questionDe: 'Was ist die Antwort?',
    questionEn: 'What is the answer?',
    instructionDe: 'Geben Sie die Antwort ein.',
    instructionEn: 'Enter the answer.',
    answerType: 'text',
    correctAnswer: { value: 'test' },
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
    timeBonusMaxSeconds: 300,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}
