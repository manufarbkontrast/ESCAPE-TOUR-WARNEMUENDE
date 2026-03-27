'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, Search, MapPin, Target, AlertTriangle } from 'lucide-react'
import type { Hint } from '@escape-tour/shared'
import { useGameStore } from '@/stores/gameStore'

interface HintSystemProps {
 readonly puzzleId: string
 readonly sessionId: string
 readonly language: 'de' | 'en'
 readonly onClose: () => void
}

const hintLevels = [
 { level: 1, label: 'Kleiner Hinweis', labelEn: 'Small Hint', icon: Lightbulb },
 { level: 2, label: 'Mittlerer Hinweis', labelEn: 'Medium Hint', icon: Search },
 { level: 3, label: 'Großer Hinweis', labelEn: 'Big Hint', icon: MapPin },
 { level: 4, label: 'Lösung anzeigen', labelEn: 'Show Solution', icon: Target },
] as const

export function HintSystem({ puzzleId, sessionId, language, onClose }: HintSystemProps) {
 const session = useGameStore((state) => state.session)
 const useHint = useGameStore((state) => state.useHint)
 const [hints, setHints] = useState<readonly Hint[]>([])
 const [revealedHints, setRevealedHints] = useState<readonly number[]>([])
 const [confirmingLevel, setConfirmingLevel] = useState<number | null>(null)
 const [isLoading, setIsLoading] = useState(true)
 const [fetchError, setFetchError] = useState<string | null>(null)

 useEffect(() => {
  const fetchHints = async () => {
   setFetchError(null)
   try {
    const response = await fetch(`/api/game/hints/${puzzleId}`)
    if (!response.ok) throw new Error('Failed to fetch hints')

    const data: { readonly data: readonly Hint[] | null } = await response.json()
    if (data.data) {
     setHints(data.data)
    }
   } catch (error) {
    console.error('Error fetching hints:', error)
    setFetchError(language === 'de' ? 'Hinweise konnten nicht geladen werden' : 'Failed to load hints')
   } finally {
    setIsLoading(false)
   }
  }

  fetchHints()
 }, [puzzleId, language])

 const getElapsedSeconds = () => {
  if (!session?.startedAt) return 0
  const startTime = new Date(session.startedAt).getTime()
  const now = Date.now()
  return Math.floor((now - startTime) / 1000) - session.totalPauseSeconds
 }

 const handleRevealHint = (level: number) => {
  setConfirmingLevel(level)
 }

 const confirmReveal = (level: number) => {
  setRevealedHints((prev) => [...prev, level])
  useHint()
  setConfirmingLevel(null)
 }

 const cancelReveal = () => {
  setConfirmingLevel(null)
 }

 const elapsedSeconds = getElapsedSeconds()

 return (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
   <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 100 }}
    className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl"
    style={{
     background: 'rgba(10, 10, 10, 0.95)',
     backdropFilter: 'blur(20px)',
     border: '1px solid rgba(255, 255, 255, 0.04)',
     boxShadow: '0 -4px 40px rgba(0, 0, 0, 0.3)',
    }}
   >
    {/* Header */}
    <div className="border-b border-white/[0.04] p-4">
     <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-white tracking-tight">
       {language === 'de' ? 'Hinweise' : 'Hints'}
      </h2>
      <button
       onClick={onClose}
       className="btn-icon-sm text-dark-500"
       aria-label={language === 'de' ? 'Schließen' : 'Close'}
      >
       <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
     </div>
    </div>

    {/* Content */}
    <div className="max-h-[70vh] overflow-y-auto p-4">
     {isLoading ? (
      <div className="py-8 text-center">
       <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
       <p className="text-sm text-dark-500">{language === 'de' ? 'Wird geladen...' : 'Loading...'}</p>
      </div>
     ) : fetchError ? (
      <div className="py-8 text-center">
       <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" strokeWidth={1.5} />
       <p className="text-red-400">{fetchError}</p>
      </div>
     ) : hints.length === 0 ? (
      <div className="py-8 text-center">
       <p className="text-sm text-dark-500">
        {language === 'de' ? 'Keine Hinweise verfügbar' : 'No hints available'}
       </p>
      </div>
     ) : (
      <div className="space-y-2.5">
       {hintLevels.map((levelInfo) => {
        const hint = hints.find((h) => h.hintLevel === levelInfo.level)
        if (!hint) return null

        const isAvailable = elapsedSeconds >= hint.availableAfterSeconds
        const isRevealed = revealedHints.includes(levelInfo.level)
        const isConfirming = confirmingLevel === levelInfo.level
        const label = language === 'de' ? levelInfo.label : levelInfo.labelEn
        const hintText = language === 'de' ? hint.textDe : (hint.textEn ?? hint.textDe)
        const Icon = levelInfo.icon

        return (
         <div
          key={levelInfo.level}
          className={`rounded-2xl p-4 transition-all duration-150 ${
           isAvailable
            ? ''
            : 'opacity-40'
          }`}
          style={{
           background: isAvailable ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.02)',
           border: `1px solid ${isAvailable ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)'}`,
          }}
         >
          <div className="flex items-start justify-between gap-3">
           <div className="flex-1">
            <div className="mb-1 flex items-center gap-2.5">
             <div className="btn-icon-sm flex items-center justify-center text-white" style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
             </div>
             <h3 className="font-semibold text-white/80 text-sm">{label}</h3>
            </div>

            {!isAvailable && (
             <p className="ml-[46px] text-xs text-dark-600">
              {language === 'de' ? 'Verfügbar in' : 'Available in'}{' '}
              {Math.ceil((hint.availableAfterSeconds - elapsedSeconds) / 60)}{' '}
              {language === 'de' ? 'Min' : 'min'}
             </p>
            )}

            {isRevealed && (
             <p className="ml-[46px] mt-2 text-sm text-white/70 font-semibold leading-relaxed">{hintText}</p>
            )}
           </div>

           <div className="text-right">
            <div className="mb-1.5 text-xs font-semibold text-white/60 tabular-nums">-{hint.pointPenalty}pts</div>
            {isAvailable && !isRevealed && !isConfirming && (
             <button
              onClick={() => handleRevealHint(levelInfo.level)}
              className="btn btn-secondary px-4 py-1.5 text-xs"
             >
              {language === 'de' ? 'Anzeigen' : 'Reveal'}
             </button>
            )}
           </div>
          </div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
           {isConfirming && (
            <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="mt-3 border-t border-white/[0.04] pt-3"
            >
             <p className="mb-3 text-sm text-white/60">
              {language === 'de'
               ? `Dieser Hinweis kostet ${hint.pointPenalty} Punkte. Fortfahren?`
               : `This hint costs ${hint.pointPenalty} points. Continue?`}
             </p>
             <div className="flex gap-2">
              <button
               onClick={() => confirmReveal(levelInfo.level)}
               className="btn btn-primary flex-1 py-2 text-sm"
              >
               {language === 'de' ? 'Ja' : 'Yes'}
              </button>
              <button
               onClick={cancelReveal}
               className="btn btn-secondary flex-1 py-2 text-sm"
              >
               {language === 'de' ? 'Nein' : 'No'}
              </button>
             </div>
            </motion.div>
           )}
          </AnimatePresence>
         </div>
        )
       })}
      </div>
     )}
    </div>
   </motion.div>
  </div>
 )
}
