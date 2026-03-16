'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, BookOpen, Sparkles, Anchor, HelpCircle } from 'lucide-react'
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
      <div className="btn-icon-lg flex items-center justify-center text-white">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-dark-900 to-dark-800">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-white/[0.04] bg-dark-900/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white tracking-tight">{stationName}</h1>
            <p className="text-xs text-dark-500 font-medium">
              Station {station.orderIndex + 1} · {puzzles.length} {language === 'de' ? 'Rätsel' : 'Puzzles'}
            </p>
          </div>
          <Timer sessionId={sessionId} />
        </div>
      </header>

      {/* Content Area */}
      <main className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-center px-6 pt-20 pb-24">
        <AnimatePresence mode="wait">
          {currentState === 'intro' && (
            <motion.div
              key="intro"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-5 py-6"
            >
              {station.headerImageUrl && (
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={station.headerImageUrl}
                    alt={stationName}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <div className="card p-8">
                <h2 className="mb-4 text-3xl font-display font-bold text-white tracking-tight">
                  {language === 'de' ? 'Willkommen' : 'Welcome'}
                </h2>
                <p className="whitespace-pre-line text-lg leading-relaxed text-dark-200">{introText}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleIntroComplete}
                  className="btn btn-primary flex-1 py-4 text-base"
                >
                  {language === 'de' ? 'Weiter' : 'Continue'}
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
                {isDemo && (
                  <button
                    onClick={() => setCurrentState('puzzle')}
                    className="btn btn-secondary px-5 text-sm"
                  >
                    {language === 'de' ? 'Zum Rätsel' : 'To Puzzle'}
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
              className="space-y-5 py-6"
            >
              <div className="card p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <BookOpen className="h-5 w-5 text-dark-400" strokeWidth={1.5} />
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                    {language === 'de' ? 'Die Geschichte' : 'The Story'}
                  </h2>
                </div>
                <p className="whitespace-pre-line text-lg text-dark-200 leading-relaxed">{storyText}</p>
              </div>
              <button
                onClick={handleStoryComplete}
                className="btn btn-primary w-full py-4 text-base"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                {language === 'de' ? 'Rätsel starten' : 'Start Puzzle'}
              </button>
              {isDemo && (
                <p className="text-center text-xs text-dark-600">
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
              className="space-y-5 py-6"
            >
              <div className="rounded-2xl p-8 text-center" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025))',
                border: '1px solid rgba(255, 255, 255, 0.075)',
                boxShadow: '0 0 40px rgba(255, 255, 255, 0.04)',
              }}>
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-white" strokeWidth={1.5} />
                <h2 className="mb-2 text-2xl font-display font-bold text-white tracking-tight">
                  {language === 'de' ? 'Geschafft!' : 'Success!'}
                </h2>
                <p className="text-base text-dark-300">{completionText}</p>
              </div>
              <button
                onClick={handleStationComplete}
                className="btn btn-primary w-full py-4 text-base"
              >
                {language === 'de' ? 'Weiter zur nächsten Station' : 'Continue to Next Station'}
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
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
                <Anchor className="mx-auto mb-4 h-8 w-8 animate-pulse text-white" strokeWidth={1.5} />
                <p className="text-sm text-dark-500">{language === 'de' ? 'Wird geladen...' : 'Loading...'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer with Hint Button */}
      {currentState === 'puzzle' && currentPuzzle && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.04] bg-dark-900/90 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <button
              onClick={() => setShowHints(true)}
              className="btn btn-secondary w-full py-3"
            >
              <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
              {language === 'de' ? 'Hinweis anzeigen' : 'Show Hint'}
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
