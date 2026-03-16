'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface MarketingErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Error boundary for marketing pages
 * Displays a maritime-themed error state with recovery options
 */
export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    console.error('Marketing page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-dark-950 pattern-waves">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* Warning icon */}
        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-white"
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
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          Etwas ist schiefgelaufen
        </h1>

        {/* Message */}
        <p className="text-dark-200 font-medium leading-relaxed">
          Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es
          erneut oder kehren Sie zur Startseite zurueck.
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
            Zurueck zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
