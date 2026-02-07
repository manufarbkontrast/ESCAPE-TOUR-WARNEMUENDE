'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores'
import { useAudioStore } from '@/stores/audioStore'

interface GameMenuProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const

const menuVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
} as const

export function GameMenu({ isOpen, onClose }: GameMenuProps) {
  const router = useRouter()
  const session = useGameStore((s) => s.session)
  const pauseSession = useGameStore((s) => s.pauseSession)
  const resumeSession = useGameStore((s) => s.resumeSession)
  const isMuted = useAudioStore((s) => s.isMuted)
  const toggleMute = useAudioStore((s) => s.toggleMute)

  const isPaused = session?.status === 'paused'

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const handlePauseToggle = () => {
    if (isPaused) {
      resumeSession()
    } else {
      pauseSession()
    }
  }

  const handleExitTour = () => {
    onClose()
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-navy-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-[70] h-full w-72 bg-navy-900 border-l border-navy-800 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Spielmenü"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-navy-800">
                <h2 className="font-display font-semibold text-sand-50">Menü</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-navy-800 transition-colors"
                  aria-label="Menü schließen"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                {/* Pause / Resume */}
                {session && (
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sand-200 hover:bg-navy-800 transition-colors"
                  >
                    {isPaused ? (
                      <>
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>Tour fortsetzen</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Tour pausieren</span>
                      </>
                    )}
                  </button>
                )}

                {/* Toggle Sound */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sand-200 hover:bg-navy-800 transition-colors"
                >
                  {isMuted ? (
                    <>
                      <svg className="h-5 w-5 text-sand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                      <span>Ton einschalten</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 text-brass-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      <span>Ton ausschalten</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="my-3 h-px bg-navy-800" />

                {/* Points display */}
                {session && (
                  <div className="rounded-lg bg-navy-800/50 px-4 py-3">
                    <div className="text-xs text-sand-400 mb-1">Punkte</div>
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-brass-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-display text-xl font-bold text-brass-400 tabular-nums">
                        {session.totalPoints}
                      </span>
                    </div>
                  </div>
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={handleExitTour}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Tour verlassen
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
