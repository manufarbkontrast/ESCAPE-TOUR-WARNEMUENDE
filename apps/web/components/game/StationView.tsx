'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Station, Puzzle } from '@escape-tour/shared'
import { PuzzleRenderer } from './PuzzleRenderer'
import { Timer } from './Timer'
import { HintSystem } from './HintSystem'
import { isDemoSession } from '@/lib/demo/helpers'

type StationState = 'intro' | 'story' | 'puzzle' | 'success' | 'transition'

interface StationViewProps {
  readonly station: Station
  readonly puzzles: readonly Puzzle[]
  readonly sessionId: string
  readonly onComplete: () => void
  readonly language: 'de' | 'en'
}

const fadeVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const AudioPlayer = ({ url }: { readonly url: string | null }) => {
  if (!url) return null
  return (
    <div className="fixed bottom-20 right-4 z-10">
      <div className="rounded-full bg-navy-800/80 p-3 shadow-lg backdrop-blur-sm">
        <svg className="h-6 w-6 text-brass-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
      </div>
    </div>
  )
}

export function StationView({
  station,
  puzzles,
  sessionId,
  onComplete,
  language,
}: StationViewProps) {
  const [currentState, setCurrentState] = useState<StationState>('intro')
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [showHints, setShowHints] = useState(false)
  const [completedPuzzles, setCompletedPuzzles] = useState<readonly string[]>([])

  const isDemo = isDemoSession(sessionId)
  const currentPuzzle = puzzles[currentPuzzleIndex]
  const allPuzzlesCompleted = completedPuzzles.length === puzzles.length

  useEffect(() => {
    if (allPuzzlesCompleted && currentState === 'puzzle') {
      setCurrentState('success')
    }
  }, [allPuzzlesCompleted, currentState])

  const handleIntroComplete = () => {
    setCurrentState('story')
  }

  const handleStoryComplete = () => {
    setCurrentState('puzzle')
  }

  const handlePuzzleComplete = (puzzleId: string) => {
    setCompletedPuzzles((prev) => [...prev, puzzleId])

    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex((prev) => prev + 1)
    } else {
      setCurrentState('success')
    }
  }

  const handleStationComplete = () => {
    setCurrentState('transition')
    setTimeout(() => {
      onComplete()
    }, isDemo ? 500 : 2000)
  }

  const stationName = language === 'de' ? station.nameDe : (station.nameEn ?? station.nameDe)
  const introText = language === 'de' ? station.introTextDe : (station.introTextEn ?? station.introTextDe)
  const storyText = language === 'de' ? station.storyTextDe : (station.storyTextEn ?? station.storyTextDe)
  const completionText = language === 'de' ? station.completionTextDe : (station.completionTextEn ?? station.completionTextDe)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-navy-900 to-navy-800">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-navy-700/50 bg-navy-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-sand-50">{stationName}</h1>
            <p className="text-xs text-sand-300">
              Station {station.orderIndex + 1} • {puzzles.length} {language === 'de' ? 'Rätsel' : 'Puzzles'}
            </p>
          </div>
          <Timer sessionId={sessionId} />
        </div>
      </header>

      {/* Content Area */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-20 pb-24">
        <AnimatePresence mode="wait">
          {currentState === 'intro' && (
            <motion.div
              key="intro"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6 py-6"
            >
              {station.headerImageUrl && (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={station.headerImageUrl}
                    alt={stationName}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <div className="rounded-lg bg-navy-800/50 p-6 shadow-xl backdrop-blur-sm">
                <h2 className="mb-4 text-2xl font-display font-bold text-brass-400">
                  {language === 'de' ? 'Willkommen' : 'Welcome'}
                </h2>
                <p className="whitespace-pre-line text-sand-100">{introText}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleIntroComplete}
                  className="flex-1 rounded-lg bg-brass-500 px-6 py-3 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95"
                >
                  {language === 'de' ? 'Weiter' : 'Continue'}
                </button>
                {isDemo && (
                  <button
                    onClick={() => setCurrentState('puzzle')}
                    className="rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500/20 active:scale-95"
                  >
                    {language === 'de' ? 'Zum Rätsel' : 'To Puzzle'} &raquo;
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {currentState === 'story' && (
            <motion.div
              key="story"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6 py-6"
            >
              <div className="rounded-lg bg-navy-800/50 p-6 shadow-xl backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-display font-bold text-brass-400">
                  {language === 'de' ? 'Die Geschichte' : 'The Story'}
                </h2>
                <p className="whitespace-pre-line text-sand-100 leading-relaxed">{storyText}</p>
              </div>
              <button
                onClick={handleStoryComplete}
                className="w-full rounded-lg bg-brass-500 px-6 py-3 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95"
              >
                {language === 'de' ? 'Rätsel starten' : 'Start Puzzle'}
              </button>
              {isDemo && (
                <p className="text-center text-xs text-yellow-400/70">
                  Demo: {language === 'de' ? 'Geschichte kann übersprungen werden' : 'Story can be skipped'}
                </p>
              )}
            </motion.div>
          )}

          {currentState === 'puzzle' && currentPuzzle && (
            <motion.div
              key={`puzzle-${currentPuzzle.id}`}
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="py-6"
            >
              <PuzzleRenderer
                puzzle={currentPuzzle}
                sessionId={sessionId}
                language={language}
                onComplete={() => handlePuzzleComplete(currentPuzzle.id)}
              />
            </motion.div>
          )}

          {currentState === 'success' && (
            <motion.div
              key="success"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-6 py-6"
            >
              <div className="rounded-lg bg-gradient-to-br from-brass-500 to-brass-600 p-8 text-center shadow-xl">
                <div className="mb-4 text-6xl">🎉</div>
                <h2 className="mb-2 text-2xl font-display font-bold text-navy-900">
                  {language === 'de' ? 'Geschafft!' : 'Success!'}
                </h2>
                <p className="text-navy-800">{completionText}</p>
              </div>
              <button
                onClick={handleStationComplete}
                className="w-full rounded-lg bg-brass-500 px-6 py-3 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95"
              >
                {language === 'de' ? 'Weiter zur nächsten Station' : 'Continue to Next Station'}
              </button>
            </motion.div>
          )}

          {currentState === 'transition' && (
            <motion.div
              key="transition"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="flex min-h-[50vh] items-center justify-center"
            >
              <div className="text-center">
                <div className="mb-4 animate-pulse text-4xl text-brass-400">⚓</div>
                <p className="text-sand-200">{language === 'de' ? 'Wird geladen...' : 'Loading...'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with Hint Button */}
      {currentState === 'puzzle' && currentPuzzle && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-navy-700/50 bg-navy-900/95 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <button
              onClick={() => setShowHints(true)}
              className="w-full rounded-lg border-2 border-brass-500 px-4 py-2 font-medium text-brass-400 transition-all hover:bg-brass-500/10 active:scale-95"
            >
              💡 {language === 'de' ? 'Hinweis anzeigen' : 'Show Hint'}
            </button>
          </div>
        </footer>
      )}

      {/* Ambient Audio */}
      <AudioPlayer url={station.backgroundAudioUrl} />

      {/* Hint System Modal */}
      {showHints && currentPuzzle && (
        <HintSystem
          puzzleId={currentPuzzle.id}
          sessionId={sessionId}
          language={language}
          onClose={() => setShowHints(false)}
        />
      )}
    </div>
  )
}
