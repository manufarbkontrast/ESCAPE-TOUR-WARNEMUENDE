import { cn } from '@/lib/utils/cn';

interface GameLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * Game header component
 * Minimal header for in-game experience
 */
function GameHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur border-b border-navy-800">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brass-500 text-navy-950 font-bold flex items-center justify-center text-lg">
            ⚓
          </div>
          <span className="font-display font-semibold text-sm">Escape Tour</span>
        </div>

        {/* Game Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Progress Indicator Placeholder */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-sand-300">
            <div className="h-2 w-24 rounded-full bg-navy-800 overflow-hidden">
              <div className="h-full bg-brass-500 w-0" id="progress-bar" />
            </div>
          </div>

          {/* Menu Button */}
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-navy-800 transition-colors"
            aria-label="Menü"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Game layout component
 * Provides minimal chrome for full-screen game experience
 * No footer, maximized content area
 */
export default function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <GameHeader />

      {/* Main content area with top padding for fixed header */}
      <main className="flex-1 pt-14">
        {children}
      </main>

      {/* Optional: Bottom navigation for game controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-navy-950/95 backdrop-blur border-t border-navy-800 safe-area-inset-bottom hidden">
        {/* Game controls will be inserted here by child components */}
      </div>
    </div>
  );
}
