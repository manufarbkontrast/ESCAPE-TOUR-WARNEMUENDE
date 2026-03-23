'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import type { Easing } from 'framer-motion';

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

interface FaqAccordionProps {
  readonly items: ReadonlyArray<FaqItem>;
}

const EASE_IN_OUT: Easing = 'easeInOut';
const EASE_OUT: Easing = 'easeOut';

/**
 * Animation variants for the accordion content
 */
const contentVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: EASE_IN_OUT },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: EASE_OUT },
  },
};

/**
 * Chevron icon component for accordion toggle
 */
function ChevronIcon({ isOpen }: { readonly isOpen: boolean }) {
  return (
    <motion.svg
      className="h-5 w-5 text-white flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.25 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </motion.svg>
  );
}

/**
 * Single accordion item component
 */
function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  readonly item: FaqItem;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/10 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left gap-4"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-sans font-bold text-lg text-white">
          {item.question}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <p className="pt-3 pb-1 text-base text-white/80 font-semibold leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQ Accordion component
 * Only one item can be open at a time
 * Uses framer-motion for smooth height animations
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="w-full">
      {items.map((item, index) => (
        <AccordionItem
          key={item.question}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
