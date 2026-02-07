'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface GameErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Error boundary for game pages
 * Displays a game-themed error state with reassurance about saved progress
 */
export default function GameError({ error, reset }: GameErrorProps) {
  useEffect(() => {
    console.error('Game error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-navy-950">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* Compass icon */}
        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-brass-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl font-bold text-sand-50">
          Stoerung im Kompass!
        </h1>

        {/* Message */}
        <p className="text-sand-300 leading-relaxed">
          Ein Fehler ist aufgetreten. Keine Sorge, euer Spielstand wurde
          gespeichert.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="btn btn-primary"
          >
            Erneut versuchen
          </button>
          <Link href="/" className="btn btn-ghost">
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
