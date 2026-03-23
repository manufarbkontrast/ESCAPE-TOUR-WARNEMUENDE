'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Anchor } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryContentProps {
 readonly content: string | null
 readonly backgroundImageUrl: string | null
 readonly onContinue: () => void
 readonly language: 'de' | 'en'
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LABELS = {
 de: {
  continue: 'Weiter',
  noContent: 'Keine Geschichte verfügbar.',
 },
 en: {
  continue: 'Continue',
  noContent: 'No story content available.',
 },
} as const

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
  opacity: 1,
  transition: {
   staggerChildren: 0.04,
   delayChildren: 0.2,
  },
 },
} as const

const wordVariants = {
 hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
 visible: {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  transition: {
   duration: 0.4,
   ease: 'easeOut',
  },
 },
} as const

const buttonVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
  opacity: 1,
  y: 0,
  transition: {
   duration: 0.5,
   ease: 'easeOut',
   delay: 0.3,
  },
 },
} as const

// ---------------------------------------------------------------------------
// Helper: split content into paragraphs and words
// ---------------------------------------------------------------------------

interface ContentSegment {
 readonly type: 'paragraph'
 readonly words: readonly string[]
 readonly paragraphIndex: number
}

const splitContentIntoSegments = (
 text: string,
): readonly ContentSegment[] => {
 const paragraphs = text.split(/\n\n+/)

 return paragraphs.map((paragraph, paragraphIndex) => ({
  type: 'paragraph' as const,
  words: paragraph.trim().split(/\s+/).filter(Boolean),
  paragraphIndex,
 }))
}

// ---------------------------------------------------------------------------
// StoryContent component
// ---------------------------------------------------------------------------

export function StoryContent({
 content,
 backgroundImageUrl,
 onContinue,
 language,
}: StoryContentProps) {
 const labels = LABELS[language]

 const segments = useMemo(
  () => (content ? splitContentIntoSegments(content) : []),
  [content],
 )

 if (!content) {
  return (
   <div className="flex min-h-[50vh] items-center justify-center px-4">
    <div className="text-center">
     <p className="text-sm text-dark-500">{labels.noContent}</p>
     <button
      onClick={onContinue}
      className="btn btn-primary mt-6"
     >
      {labels.continue}
      <ChevronRight className="h-4 w-4" strokeWidth={2} />
     </button>
    </div>
   </div>
  )
 }

 return (
  <div className="relative min-h-[50vh]">
   {/* Background image */}
   {backgroundImageUrl && (
    <div
     className="absolute inset-0 bg-cover bg-center"
     style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
     <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/70 to-dark-950/95" />
    </div>
   )}

   {/* Content */}
   <div className="relative z-10 px-4 py-8">
    <motion.div
     variants={containerVariants}
     initial="hidden"
     animate="visible"
     className="mx-auto max-w-2xl space-y-6"
    >
     {/* Story text with word-by-word fade-in */}
     <div className="card p-6">
      <div className="space-y-4">
       {segments.map((segment) => (
        <p
         key={segment.paragraphIndex}
         className="text-lg leading-relaxed text-white/80"
        >
         {segment.words.map((word, wordIndex) => (
          <motion.span
           key={`${segment.paragraphIndex}-${wordIndex}`}
           variants={wordVariants}
           className="mr-[0.3em] inline-block"
          >
           {word}
          </motion.span>
         ))}
        </p>
       ))}
      </div>
     </div>

     {/* Decorative divider */}
     <motion.div
      variants={buttonVariants}
      className="flex items-center justify-center gap-3"
     >
      <div className="h-px w-12" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
      <Anchor className="h-4 w-4 text-dark-500" strokeWidth={1.5} />
      <div className="h-px w-12" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
     </motion.div>

     {/* Continue button */}
     <motion.div variants={buttonVariants}>
      <button
       onClick={onContinue}
       className="btn btn-primary w-full"
      >
       {labels.continue}
       <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
     </motion.div>
    </motion.div>
   </div>
  </div>
 )
}
