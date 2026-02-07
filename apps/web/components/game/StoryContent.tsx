'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

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
          <p className="text-sand-400">{labels.noContent}</p>
          <button
            onClick={onContinue}
            className="mt-6 rounded-lg bg-brass-500 px-8 py-3 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95"
          >
            {labels.continue}
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
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/70 to-navy-900/95" />
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
          <div className="rounded-lg bg-navy-800/60 p-6 shadow-xl backdrop-blur-sm">
            <div className="space-y-4">
              {segments.map((segment) => (
                <p
                  key={segment.paragraphIndex}
                  className="text-base leading-relaxed text-sand-100"
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
            <div className="h-px w-12 bg-brass-500/40" />
            <svg
              className="h-5 w-5 text-brass-500/60"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <div className="h-px w-12 bg-brass-500/40" />
          </motion.div>

          {/* Continue button */}
          <motion.div variants={buttonVariants}>
            <button
              onClick={onContinue}
              className="w-full rounded-lg bg-brass-500 px-8 py-3 font-semibold text-navy-900 shadow-lg transition-all hover:bg-brass-400 active:scale-95"
            >
              {labels.continue}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
