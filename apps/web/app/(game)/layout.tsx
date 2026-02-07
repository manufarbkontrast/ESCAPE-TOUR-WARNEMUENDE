'use client'

import { useState } from 'react'
import { TOTAL_STATIONS } from '@escape-tour/shared'
import { useGameStore } from '@/stores'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
import { GameMenu } from '@/components/game/GameMenu'

interface GameLayoutProps {
  readonly children: React.ReactNode
}

/**
 * Game header component with reactive progress bar
 */
function GameHeader({ onMenuToggle }: { readonly onMenuToggle: () => void }) {
  const session = useGameStore((s) => s.session)
  const stationIndex = session?.currentStationIndex ?? 0
  const progressPercent = Math.round((stationIndex / TOTAL_STATIONS) * 100)

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
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-xs text-sand-300">
            <div className="h-2 w-24 rounded-full bg-navy-800 overflow-hidden">
              <div
                className="h-full bg-brass-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="hidden sm:inline tabular-nums">
              {stationIndex}/{TOTAL_STATIONS}
            </span>
          </div>

          {/* Menu Button */}
          <button
            type="button"
            onClick={onMenuToggle}
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
  )
}

/**
 * Game layout component
 * Provides minimal chrome for full-screen game experience
 */
export default function GameLayout({ children }: GameLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <OfflineIndicator />
      <GameHeader onMenuToggle={() => setIsMenuOpen((prev) => !prev)} />

      {/* Game Menu Overlay */}
      <GameMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main content area with top padding for fixed header */}
      <main className="flex-1 pt-14">
        {children}
      </main>
    </div>
  )
}
