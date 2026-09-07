'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface RevealProps {
 readonly children: ReactNode;
 readonly className?: string;
 /** Milliseconds to hold back the transition, for staggering siblings. */
 readonly delay?: number;
}

/**
 * Grows the observed area *downwards*, so a block starts fading in while it is
 * still below the fold and is done by the time it is properly on screen.
 *
 * This was a negative value first, which held the reveal back until the block
 * was already well inside the viewport — scrolling then landed you on a section
 * that was still half empty. Trigger early; the animation should be over before
 * anyone looks at it.
 */
const ROOT_MARGIN = '0px 0px 18% 0px';

function prefersReducedMotion(): boolean {
 return (
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
 );
}

/**
 * Fades a block in when it scrolls into view.
 *
 * The hidden state is applied in an effect, never during render. That is the
 * whole trick: the server sends visible markup, so a visitor without
 * JavaScript — and every crawler — reads the full page. Anything that would
 * leave the content hidden (reduced motion, a browser without
 * IntersectionObserver) simply skips arming it.
 *
 * Children are passed through untouched, so they stay server-rendered even
 * though this wrapper is a client component.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
 const [pending, setPending] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const element = ref.current;
  if (!element) return;
  if (prefersReducedMotion()) return;
  if (typeof IntersectionObserver === 'undefined') return;

  setPending(true);

  const observer = new IntersectionObserver(
   (entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    setPending(false);
    // One-shot: scrolling back up must not hide the block again.
    observer.disconnect();
   },
   { rootMargin: ROOT_MARGIN }
  );

  observer.observe(element);
  return () => observer.disconnect();
 }, []);

 return (
  <div
   ref={ref}
   className={cn('reveal', pending && 'reveal-pending', className)}
   style={delay ? { transitionDelay: `${delay}ms` } : undefined}
  >
   {children}
  </div>
 );
}
