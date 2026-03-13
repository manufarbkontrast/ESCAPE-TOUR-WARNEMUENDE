'use client'

import { useState } from 'react'
import { Menu, Compass } from 'lucide-react'
import { TOTAL_STATIONS } from '@escape-tour/shared'
import { useGameStore } from '@/stores'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
import { GameMenu } from '@/components/game/GameMenu'
import { isDemoSession } from '@/lib/demo/helpers'
import { DEMO_STATIONS } from '@/lib/demo/data'

interface GameLayoutProps {
  readonly children: React.ReactNode
}

/**
 * Game header component with reactive progress bar
 */
function GameHeader({ onMenuToggle }: { readonly onMenuToggle: () => void }) {
  const session = useGameStore((s) => s.session)
  const stationIndex = session?.currentStationIndex ?? 0
  const totalStations = isDemoSession(session?.id ?? '') ? DEMO_STATIONS.length : TOTAL_STATIONS
  const progressPercent = Math.round((stationIndex / totalStations) * 100)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-navy-900/90 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="btn-icon-lg flex items-center justify-center text-white">
            <Compass className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <span className="font-display font-semibold text-lg text-sand-50 tracking-tight">Escape Tour</span>
        </div>

        {/* Game Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-28 rounded-full bg-navy-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.5))',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)',
                }}
              />
            </div>
            <span className="tabular-nums font-semibold text-sm text-sand-300">
              {stationIndex}/{totalStations}
            </span>
          </div>

          {/* Menu Button */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="btn-icon-md text-sand-200"
            aria-label="Menü"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800">
      <OfflineIndicator />
      <GameHeader onMenuToggle={() => setIsMenuOpen((prev) => !prev)} />

      {/* Game Menu Overlay */}
      <GameMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main content area with top padding for fixed header */}
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  )
}
