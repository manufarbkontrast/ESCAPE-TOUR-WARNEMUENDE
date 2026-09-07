'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface RevealProps {
 readonly children: ReactNode;
 readonly className?: string;
 /** Milliseconds to hold back the transition, for staggering siblings. */
 readonly delay?: number;
}

/** How far below the fold a block starts fading in, as a share of the viewport. */
const LEAD_IN = 0.18;

/** Backstop sweeps after mount, in milliseconds — see the note on `revealIfVisible`. */
const BACKSTOP_DELAYS = [120, 400, 1000, 2000] as const;

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
 * Two rules shape this component, both learned the hard way:
 *
 * 1. The hidden state is applied in an effect, never during render. The server
 *    sends visible markup, so a visitor without JavaScript — and every crawler
 *    — reads the full page.
 *
 * 2. Nothing may leave a block hidden for good. An IntersectionObserver alone
 *    was not enough: landing straight on /#ablauf, which the site's own menu
 *    links to, left every step invisible because the page jumps to the anchor
 *    only after hydration and the observer never reported it. So the observer
 *    is treated as an optimisation, and a plain rectangle check — on scroll,
 *    on resize, and on a few timers after mount — is what actually guarantees
 *    the content appears.
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
  // No observer means no reliable way to know when the block arrives. Rather
  // than hide content and hope a fallback catches it, leave it visible.
  if (typeof IntersectionObserver === 'undefined') return;

  // A block that is already on screen is never hidden in the first place.
  // This is what makes landing on /#ablauf safe: if the jump to the anchor
  // happened before this ran, the steps stay visible instead of waiting for
  // an observer callback that may never describe a scroll that already
  // finished. Blocks still below the fold take the normal path below.
  const atMount = element.getBoundingClientRect();
  if (atMount.top < window.innerHeight && atMount.bottom > 0) return;

  setPending(true);

  let done = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  let observer: IntersectionObserver | undefined;

  const finish = () => {
   if (done) return;
   done = true;
   setPending(false);
   observer?.disconnect();
   timers.forEach(clearTimeout);
   window.removeEventListener('scroll', revealIfVisible);
   window.removeEventListener('resize', revealIfVisible);
  };

  function revealIfVisible() {
   const box = element!.getBoundingClientRect();
   if (box.top < window.innerHeight * (1 + LEAD_IN) && box.bottom > 0) finish();
  }

  observer = new IntersectionObserver(
   (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) finish();
   },
   { rootMargin: `0px 0px ${Math.round(LEAD_IN * 100)}% 0px` }
  );
  observer.observe(element);

  window.addEventListener('scroll', revealIfVisible, { passive: true });
  window.addEventListener('resize', revealIfVisible, { passive: true });
  const frame = requestAnimationFrame(revealIfVisible);
  BACKSTOP_DELAYS.forEach((ms) => timers.push(setTimeout(revealIfVisible, ms)));

  return () => {
   cancelAnimationFrame(frame);
   observer?.disconnect();
   timers.forEach(clearTimeout);
   window.removeEventListener('scroll', revealIfVisible);
   window.removeEventListener('resize', revealIfVisible);
  };
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
