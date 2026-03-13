import Link from 'next/link';

/**
 * Custom 404 page with maritime theme
 * Displayed when a route is not found
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 pattern-anchor flex items-center justify-center px-4">
      <div className="relative text-center max-w-lg mx-auto">
        {/* Large faded 404 background text */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          aria-hidden="true"
        >
          <span className="text-[12rem] md:text-[16rem] font-display font-bold text-navy-800 leading-none">
            404
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6 py-20">
          {/* Anchor icon */}
          <div className="flex justify-center">
            <svg
              className="h-24 w-24 text-white/10"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C10.9 2 10 2.9 10 4C10 4.74 10.4 5.39 11 5.73V7H6V9H11V17.27C9.17 16.7 7.59 15.44 6.67 13.73L4.93 14.73C6.3 17.27 8.94 19 12 19C15.06 19 17.7 17.27 19.07 14.73L17.33 13.73C16.41 15.44 14.83 16.7 13 17.27V9H18V7H13V5.73C13.6 5.39 14 4.74 14 4C14 2.9 13.1 2 12 2ZM12 4.5C11.72 4.5 11.5 4.28 11.5 4C11.5 3.72 11.72 3.5 12 3.5C12.28 3.5 12.5 3.72 12.5 4C12.5 4.28 12.28 4.5 12 4.5ZM7 20H5V22H19V20H17C15.5 20.62 13.78 21 12 21C10.22 21 8.5 20.62 7 20Z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sand-50">
            Schiff versenkt!
          </h1>

          {/* Subtitle */}
          <p className="text-sand-300 text-lg">
            Die Seite wurde leider nicht gefunden.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <Link href="/" className="btn btn-primary text-lg px-8 py-3">
              Zurueck zum Hafen
            </Link>
            <Link
              href="/touren"
              className="text-white hover:text-sand-100 transition-colors text-sm font-medium"
            >
              Zur Tour-Uebersicht
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
