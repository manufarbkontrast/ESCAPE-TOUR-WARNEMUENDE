'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface StoryIntroProps {
  readonly onComplete: () => void
  readonly teamName?: string | null
}

interface StoryPage {
  readonly textDe: string
  readonly dim?: boolean
}

const STORY_PAGES: readonly StoryPage[] = [
  {
    textDe: 'Warnemünde, 1923.\n\nEin kalter Novemberabend. Der Wind peitscht über die Mole, und das grüne Leuchtfeuer flackert im Sturm.',
  },
  {
    textDe: 'Kapitän Friedrich Scheel — Lotsenkapitän, Geheimnisträger, Legende — verlässt an diesem Abend sein Haus am Strom. Um 19:23 Uhr.\n\nEr wird nie zurückkehren.',
  },
  {
    textDe: 'Sein letzter Eintrag im Logbuch:\n\n"Die Wahrheit liegt in den Stufen. Wer meinen Spuren folgt, wird verstehen, warum ich gehen musste."',
  },
  {
    textDe: 'Sein Vermächtnis — verschlüsselt in 12 Stationen quer durch Warnemünde. Versteckt in Siegeln, Knoten, Uhren und vergessenen Inventaren.\n\nBis heute hat niemand alle Rätsel gelöst.',
  },
  {
    textDe: 'Bis jetzt.',
  },
]

const pageVariants: Variants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

export function StoryIntro({ onComplete, teamName }: StoryIntroProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const isLastPage = currentPage === STORY_PAGES.length - 1
  const page = STORY_PAGES[currentPage]

  const handleNext = useCallback(() => {
    if (isLastPage) {
      onComplete()
      return
    }
    setCurrentPage((prev) => prev + 1)
  }, [isLastPage, onComplete])

  const handleSkip = useCallback(() => {
    onComplete()
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6"
      style={{ background: '#050505' }}
    >
      {/* Skip */}
      {!isLastPage && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-xs font-semibold text-white/30 hover:text-white/50 transition-colors duration-150"
        >
          Überspringen
        </button>
      )}

      {/* Team Name */}
      {teamName && currentPage === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="absolute top-6 left-6 text-xs font-semibold text-white/20 tracking-widest uppercase"
        >
          {teamName}
        </motion.p>
      )}

      {/* Story Text */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center"
          >
            <p className="font-display text-xl leading-relaxed text-white/80 whitespace-pre-line">
              {page.textDe}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-12 left-6 right-6 flex flex-col items-center gap-6">
        {/* Page indicators */}
        <div className="flex items-center gap-1.5">
          {STORY_PAGES.map((_, index) => (
            <div
              key={index}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: index === currentPage ? '20px' : '4px',
                background: index === currentPage
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
        </div>

        {/* Action */}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white"
          style={{
            background: isLastPage ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: isLastPage ? '1px solid rgba(255,255,255,0.15)' : 'none',
          }}
        >
          {isLastPage ? (
            'Bereit'
          ) : (
            <>
              Weiter
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
