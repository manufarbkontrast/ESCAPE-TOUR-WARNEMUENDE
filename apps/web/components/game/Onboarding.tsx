'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Compass, HelpCircle, ChevronRight, Anchor } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OnboardingProps {
 readonly onComplete: () => void
 readonly language: 'de' | 'en'
}

interface OnboardingStep {
 readonly icon: LucideIcon
 readonly titleDe: string
 readonly titleEn: string
 readonly descriptionDe: string
 readonly descriptionEn: string
 readonly accentColor: string
 readonly accentGlow: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS: readonly OnboardingStep[] = [
 {
  icon: MapPin,
  titleDe: 'Stationen finden',
  titleEn: 'Find Stations',
  descriptionDe: 'Folgt der Karte zu den markierten Stationen in Warnemünde. Die weiße Markierung zeigt euch, wo ihr als nächstes hin müsst.',
  descriptionEn: 'Follow the map to marked stations across Warnemünde. The white marker shows where to go next.',
  accentColor: 'rgba(255, 255, 255, 0.9)',
  accentGlow: 'rgba(255, 255, 255, 0.1)',
 },
 {
  icon: Compass,
  titleDe: 'Rätsel lösen',
  titleEn: 'Solve Puzzles',
  descriptionDe: 'An jeder Station erwartet euch eine Geschichte und ein Rätsel. Löst es, um Punkte zu sammeln und die nächste Station freizuschalten.',
  descriptionEn: 'Each station has a story and a puzzle. Solve it to earn points and unlock the next station.',
  accentColor: 'rgba(34, 197, 94, 0.9)',
  accentGlow: 'rgba(34, 197, 94, 0.15)',
 },
 {
  icon: HelpCircle,
  titleDe: 'Hinweise nutzen',
  titleEn: 'Use Hints',
  descriptionDe: 'Kommt ihr nicht weiter? Nutzt das Hinweis-System — aber Vorsicht, jeder Hinweis kostet Punkte. Je weniger Hilfe, desto besser euer Ergebnis.',
  descriptionEn: 'Stuck? Use the hint system — but be careful, each hint costs points. Less help means a better score.',
  accentColor: 'rgba(168, 85, 247, 0.9)',
  accentGlow: 'rgba(168, 85, 247, 0.15)',
 },
] as const

const STORAGE_KEY = 'escape-tour-onboarding-seen'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
 initial: { opacity: 0 },
 animate: { opacity: 1, transition: { duration: 0.3 } },
 exit: { opacity: 0, transition: { duration: 0.2 } },
} as const

const stepVariants = {
 enter: { opacity: 0, x: 60, scale: 0.96 },
 center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
 exit: { opacity: 0, x: -60, scale: 0.96, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
} as const

const iconVariants = {
 initial: { scale: 0, rotate: -20 },
 animate: {
  scale: 1,
  rotate: 0,
  transition: { delay: 0.15, type: 'spring', stiffness: 300, damping: 20 },
 },
} as const

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function hasSeenOnboarding(): boolean {
 if (typeof window === 'undefined') return false
 return localStorage.getItem(STORAGE_KEY) === 'true'
}

function markOnboardingSeen(): void {
 if (typeof window !== 'undefined') {
  localStorage.setItem(STORAGE_KEY, 'true')
 }
}

// ---------------------------------------------------------------------------
// Onboarding component
// ---------------------------------------------------------------------------

export function Onboarding({ onComplete, language }: OnboardingProps) {
 const [currentStep, setCurrentStep] = useState(0)
 const [direction, setDirection] = useState(1)

 const step = STEPS[currentStep]
 const isLastStep = currentStep === STEPS.length - 1
 const Icon = step.icon

 const handleNext = useCallback(() => {
  if (isLastStep) {
   markOnboardingSeen()
   onComplete()
   return
  }
  setDirection(1)
  setCurrentStep((prev) => prev + 1)
 }, [isLastStep, onComplete])

 const handleSkip = useCallback(() => {
  markOnboardingSeen()
  onComplete()
 }, [onComplete])

 return (
  <motion.div
   variants={containerVariants}
   initial="initial"
   animate="animate"
   exit="exit"
   className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6"
   style={{
    background: 'radial-gradient(ellipse at center, rgba(10, 10, 10, 0.97) 0%, rgba(5, 5, 5, 0.99) 100%)',
    backdropFilter: 'blur(20px)',
   }}
  >
   {/* Skip button */}
   {!isLastStep && (
    <button
     onClick={handleSkip}
     className="absolute top-6 right-6 text-xs font-semibold text-white/40 hover:text-white/60 transition-colors duration-150"
    >
     {language === 'de' ? 'Überspringen' : 'Skip'}
    </button>
   )}

   {/* Content */}
   <div className="w-full max-w-sm">
    <AnimatePresence mode="wait" custom={direction}>
     <motion.div
      key={currentStep}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex flex-col items-center text-center"
     >
      {/* Icon */}
      <motion.div
       variants={iconVariants}
       initial="initial"
       animate="animate"
       className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl"
       style={{
        background: step.accentGlow,
        border: `1px solid ${step.accentColor.replace('0.9', '0.15')}`,
        boxShadow: `0 0 40px ${step.accentGlow}`,
       }}
      >
       <Icon
        className="h-9 w-9"
        style={{ color: step.accentColor }}
        strokeWidth={1.5}
       />
      </motion.div>

      {/* Title */}
      <h2 className="mb-3 text-2xl font-bold text-white tracking-tight">
       {language === 'de' ? step.titleDe : step.titleEn}
      </h2>

      {/* Description */}
      <p className="text-base leading-relaxed text-white/60 font-semibold max-w-xs">
       {language === 'de' ? step.descriptionDe : step.descriptionEn}
      </p>
     </motion.div>
    </AnimatePresence>
   </div>

   {/* Bottom controls */}
   <div className="absolute bottom-12 left-6 right-6 flex flex-col items-center gap-6">
    {/* Step indicators */}
    <div className="flex items-center gap-2">
     {STEPS.map((_, index) => (
      <div
       key={index}
       className="h-1.5 rounded-full transition-all duration-300"
       style={{
        width: index === currentStep ? '24px' : '6px',
        background: index === currentStep
         ? step.accentColor
         : 'rgba(255, 255, 255, 0.1)',
        boxShadow: index === currentStep
         ? `0 0 8px ${step.accentGlow}`
         : 'none',
       }}
      />
     ))}
    </div>

    {/* Action button */}
    <button
     onClick={handleNext}
     className="btn btn-primary w-full max-w-xs py-4 text-base"
     style={isLastStep ? {
      boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.12)`,
     } : undefined}
    >
     {isLastStep ? (
      <>
       <Anchor className="h-4 w-4" strokeWidth={2} />
       {language === 'de' ? 'Abenteuer starten' : 'Start Adventure'}
      </>
     ) : (
      <>
       {language === 'de' ? 'Weiter' : 'Next'}
       <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </>
     )}
    </button>
   </div>
  </motion.div>
 )
}
