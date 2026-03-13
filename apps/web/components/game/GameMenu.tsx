'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Volume2, VolumeX, Star, LogOut } from 'lucide-react'
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
  visible: { x: 0, transition: { type: 'spring', damping: 30, stiffness: 350 } },
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
            className="fixed top-0 right-0 z-[70] h-full w-72 border-l border-white/[0.04] shadow-2xl"
            style={{ background: 'rgba(11, 25, 41, 0.95)', backdropFilter: 'blur(20px)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Spielmenü"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
                <h2 className="font-display font-semibold text-sand-50">Menü</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-icon-sm text-sand-400"
                  aria-label="Menü schließen"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-3 space-y-1">
                {/* Pause / Resume */}
                {session && (
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sand-200 hover:bg-white/[0.04] transition-all duration-150"
                  >
                    {isPaused ? (
                      <>
                        <div className="btn-icon-sm flex items-center justify-center text-green-400" style={{ background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.1)' }}>
                          <Play className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-medium">Tour fortsetzen</span>
                      </>
                    ) : (
                      <>
                        <div className="btn-icon-sm flex items-center justify-center text-sand-100" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                          <Pause className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-medium">Tour pausieren</span>
                      </>
                    )}
                  </button>
                )}

                {/* Toggle Sound */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sand-200 hover:bg-white/[0.04] transition-all duration-150"
                >
                  {isMuted ? (
                    <>
                      <div className="btn-icon-sm flex items-center justify-center text-sand-500">
                        <VolumeX className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium">Ton einschalten</span>
                    </>
                  ) : (
                    <>
                      <div className="btn-icon-sm flex items-center justify-center text-sand-100" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <Volume2 className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium">Ton ausschalten</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="my-3 h-px bg-white/[0.04]" />

                {/* Points display */}
                {session && (
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div className="text-xs text-sand-500 mb-1.5 font-medium tracking-wide uppercase">Punkte</div>
                    <div className="flex items-center gap-2.5">
                      <Star className="h-5 w-5 text-white" strokeWidth={1.5} fill="currentColor" />
                      <span className="font-display text-2xl font-bold text-white tabular-nums">
                        {session.totalPoints}
                      </span>
                    </div>
                  </div>
                )}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={handleExitTour}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400/80 hover:bg-red-500/[0.06] transition-all duration-150"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  <span className="font-medium">Tour verlassen</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
