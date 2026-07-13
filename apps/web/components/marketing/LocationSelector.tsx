'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { TOUR_LOCATIONS, DEFAULT_LOCATION } from '@/lib/config/locations'

/**
 * Location picker for the landing page hero.
 *
 * Renders every configured standort as a selectable card. Available locations
 * are selectable; upcoming ones show a "Bald" badge and are disabled. The CTA
 * routes to the booking flow for the currently selected location.
 */
export function LocationSelector() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(
    DEFAULT_LOCATION?.id ?? null
  )

  const selected =
    TOUR_LOCATIONS.find((location) => location.id === selectedId) ?? null

  const handleSelect = (id: string, available: boolean) => {
    if (!available) {
      return
    }
    setSelectedId(id)
  }

  const handleStart = () => {
    if (!selected?.available) {
      return
    }
    router.push(`/buchen?location=${selected.id}`)
  }

  return (
    <div className="card-glass mx-auto max-w-2xl text-left">
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-white/60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="text-sm font-semibold uppercase tracking-wide text-white/60">
          Wähle deinen Standort
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOUR_LOCATIONS.map((location) => {
          const isSelected = location.id === selectedId

          return (
            <button
              key={location.id}
              type="button"
              onClick={() => handleSelect(location.id, location.available)}
              disabled={!location.available}
              aria-pressed={isSelected}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                location.available
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50',
                isSelected
                  ? 'border-neon-400/60 bg-neon-500/[0.06]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/25'
              )}
            >
              <span className="text-base font-bold text-white">
                {location.name}
              </span>
              <span className="text-xs font-semibold text-white/55">
                {location.region}
              </span>

              {!location.available && (
                <span className="mt-1 inline-flex rounded-md border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/55">
                  Bald
                </span>
              )}

              {isSelected && location.available && (
                <svg
                  className="absolute right-2.5 top-2.5 h-4 w-4 text-neon-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={!selected?.available}
        className="btn btn-primary mt-5 w-full text-lg"
      >
        {selected?.available
          ? `Tour in ${selected.name} buchen`
          : 'Standort wählen'}
      </button>
    </div>
  )
}
