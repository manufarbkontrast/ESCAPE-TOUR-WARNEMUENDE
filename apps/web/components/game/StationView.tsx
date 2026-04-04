'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, BookOpen, Anchor, HelpCircle, Navigation, MapPin } from 'lucide-react'
import type { Station, Puzzle } from '@escape-tour/shared'
import { PuzzleRenderer } from './PuzzleRenderer'
import { Timer } from './Timer'
import { HintSystem } from './HintSystem'
import { isDemoSession } from '@/lib/demo/helpers'
import { StoryChoice, STORY_CHOICES, type StoryBranch } from './StoryChoice'

type StationState = 'intro' | 'story' | 'choice' | 'puzzle' | 'success' | 'transition'

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

 const storyChoice = STORY_CHOICES.get(station.orderIndex)
 const [choiceResult, setChoiceResult] = useState<string | null>(null)

 const handleStoryComplete = () => {
  if (storyChoice && !choiceResult) {
   setCurrentState('choice')
   return
  }
  setCurrentState('puzzle')
 }

 const handleChoice = (branch: StoryBranch) => {
  const text = language === 'de' ? branch.resultTextDe : branch.resultTextEn
  setChoiceResult(text)
 }

 const handleChoiceComplete = () => {
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
  const hasTransitionText = !!(language === 'de' ? station.transitionTextDe : station.transitionTextEn)
  if (hasTransitionText) {
   // Show the transition story — player clicks "Zur Karte" to continue
   setCurrentState('transition')
  } else {
   // No transition text (e.g. last station) — auto-advance
   setCurrentState('transition')
   setTimeout(() => {
    onComplete()
   }, isDemo ? 500 : 2000)
  }
 }

 const stationName = language === 'de' ? station.nameDe : (station.nameEn ?? station.nameDe)
 const introText = language === 'de' ? station.introTextDe : (station.introTextEn ?? station.introTextDe)
 const storyText = language === 'de' ? station.storyTextDe : (station.storyTextEn ?? station.storyTextDe)
 const completionText = language === 'de' ? station.completionTextDe : (station.completionTextEn ?? station.completionTextDe)

 return (
  <div className="flex min-h-screen flex-col">
   {/* Station Info Bar */}
   <div className="mx-auto w-full max-w-2xl px-4 py-4">
    <div className="flex items-center justify-between rounded-2xl px-5 py-4" style={{ background: 'rgba(10, 10, 10, 0.88)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
     <div className="flex-1">
      <h1 className="text-2xl font-bold text-white tracking-tight">{stationName}</h1>
      <p className="text-sm text-white/60 font-semibold">
       Station {station.orderIndex + 1} · {puzzles.length} {language === 'de' ? 'Rätsel' : 'Puzzles'}
      </p>
     </div>
     <Timer sessionId={sessionId} />
    </div>
   </div>

   {/* Content Area */}
   <main className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-center px-6 pb-24">
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
       <div className="card-glass p-8">
        <h2 className="mb-4 text-3xl font-bold text-white tracking-tight">
         {language === 'de' ? 'Willkommen' : 'Welcome'}
        </h2>
        <p className="whitespace-pre-line text-lg leading-relaxed text-white/80">{introText}</p>
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
       <div className="card-glass p-8">
        <div className="flex items-center gap-2.5 mb-4">
         <BookOpen className="h-5 w-5 text-white/60" strokeWidth={1.5} />
         <h2 className="text-3xl font-bold text-white tracking-tight">
          {language === 'de' ? 'Die Geschichte' : 'The Story'}
         </h2>
        </div>
        <p className="whitespace-pre-line text-lg text-white/80 leading-relaxed">{storyText}</p>
       </div>
       <button
        onClick={handleStoryComplete}
        className="btn btn-primary w-full py-4 text-base"
       >
        {language === 'de' ? 'Rätsel starten' : 'Start Puzzle'}
       </button>
       {isDemo && (
        <p className="text-center text-xs text-white/40">
         Demo: {language === 'de' ? 'Geschichte kann übersprungen werden' : 'Story can be skipped'}
        </p>
       )}
      </motion.div>
     )}

     {currentState === 'choice' && storyChoice && (
      <motion.div
       key="choice"
       variants={fadeVariants}
       initial="enter"
       animate="center"
       exit="exit"
       transition={{ duration: 0.4 }}
       className="space-y-5 py-6"
      >
       <div className="card-glass p-6">
        {choiceResult ? (
         <div className="space-y-4">
          <p className="text-base text-white/80 leading-relaxed">{choiceResult}</p>
          <button
           onClick={handleChoiceComplete}
           className="btn btn-primary w-full py-3 text-base"
          >
           {language === 'de' ? 'Weiter zum Rätsel' : 'Continue to Puzzle'}
          </button>
         </div>
        ) : (
         <StoryChoice
          promptDe={storyChoice.promptDe}
          promptEn={storyChoice.promptEn}
          branches={storyChoice.branches}
          language={language}
          onChoose={handleChoice}
         />
        )}
       </div>
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
       <div className="card-glass p-8 text-center">
        <Anchor className="mx-auto mb-4 h-12 w-12 text-white" strokeWidth={1.5} />
        <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">
         {language === 'de' ? 'Geschafft!' : 'Success!'}
        </h2>
        <p className="text-base text-white/70 font-semibold">{completionText}</p>
       </div>
       <button
        onClick={handleStationComplete}
        className="btn btn-primary w-full py-4 text-lg"
       >
        {language === 'de' ? 'Weiter' : 'Continue'}
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
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
       className="space-y-5 py-6"
      >
       {station.transitionTextDe ? (
        <>
         <div className="card-glass p-8">
          <div className="flex items-center gap-2.5 mb-4">
           <Navigation className="h-6 w-6 text-white/60" strokeWidth={1.5} />
           <h2 className="text-2xl font-bold text-white tracking-tight">
            {language === 'de' ? 'Nächste Station' : 'Next Station'}
           </h2>
          </div>
          <p className="whitespace-pre-line text-lg text-white/80 leading-relaxed">
           {language === 'de' ? station.transitionTextDe : (station.transitionTextEn ?? station.transitionTextDe)}
          </p>
         </div>

         {station.walkingHintDe && (
          <div className="card-glass px-5 py-4">
           <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-white/50 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-base text-white/70 font-semibold">
             {language === 'de' ? station.walkingHintDe : (station.walkingHintEn ?? station.walkingHintDe)}
            </p>
           </div>
          </div>
         )}

         <button
          onClick={onComplete}
          className="btn btn-primary w-full py-4 text-lg"
         >
          <Navigation className="h-5 w-5" strokeWidth={2} />
          {language === 'de' ? 'Navigation starten' : 'Start Navigation'}
         </button>
        </>
       ) : (
        <div className="flex min-h-[50vh] items-center justify-center">
         <div className="text-center">
          <Anchor className="mx-auto mb-4 h-8 w-8 animate-pulse text-white" strokeWidth={1.5} />
          <p className="text-base text-white/50">{language === 'de' ? 'Wird geladen...' : 'Loading...'}</p>
         </div>
        </div>
       )}
      </motion.div>
     )}
    </AnimatePresence>
   </main>

   {/* Footer with Hint Button */}
   {currentState === 'puzzle' && currentPuzzle && (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.04] bg-dark-900/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
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
