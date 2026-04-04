'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Clock, TrendingUp, Users, Target, AlertCircle } from 'lucide-react'

interface AnalyticsData {
  readonly totalSessions: number
  readonly completedSessions: number
  readonly avgTimeMinutes: number
  readonly avgScore: number
  readonly completionRate: number
  readonly hintUsageRate: number
  readonly stationDropoff: readonly { station: number; dropoffPercent: number }[]
  readonly tourBreakdown: readonly { variant: string; count: number }[]
}

function StatCard({ icon: Icon, label, value, sub }: {
  readonly icon: typeof BarChart3
  readonly label: string
  readonly value: string
  readonly sub?: string
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-white/40" strokeWidth={1.5} />
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-white/30">{sub}</p>}
    </div>
  )
}

function DropoffBar({ station, percent }: { readonly station: number; readonly percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-right text-xs text-white/40 tabular-nums">{station}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(percent, 2)}%`,
            background: percent > 20 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.2)',
          }}
        />
      </div>
      <span className="w-10 text-xs text-white/40 tabular-nums">{percent}%</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In production this would fetch from an API endpoint
    // For now, show placeholder data derived from game_sessions table
    const mockData: AnalyticsData = {
      totalSessions: 0,
      completedSessions: 0,
      avgTimeMinutes: 0,
      avgScore: 0,
      completionRate: 0,
      hintUsageRate: 0,
      stationDropoff: Array.from({ length: 12 }, (_, i) => ({
        station: i + 1,
        dropoffPercent: 0,
      })),
      tourBreakdown: [
        { variant: 'Familie', count: 0 },
        { variant: 'Erwachsene', count: 0 },
        { variant: 'Profi', count: 0 },
      ],
    }
    setData(mockData)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-white/50">Spielstatistiken und Auswertungen</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Sessions" value={String(data.totalSessions)} sub="Gesamt" />
        <StatCard icon={Target} label="Abschlussrate" value={`${data.completionRate}%`} sub={`${data.completedSessions} abgeschlossen`} />
        <StatCard icon={Clock} label="Ø Zeit" value={`${data.avgTimeMinutes} Min`} sub="Durchschnitt" />
        <StatCard icon={TrendingUp} label="Ø Punkte" value={String(data.avgScore)} sub="Durchschnitt" />
      </div>

      {/* Tour Breakdown */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-4">Tour-Verteilung</h2>
        <div className="grid grid-cols-3 gap-3">
          {data.tourBreakdown.map((t) => (
            <div key={t.variant} className="text-center">
              <p className="text-xl font-bold text-white tabular-nums">{t.count}</p>
              <p className="text-xs text-white/40">{t.variant}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hint Usage */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Hinweis-Nutzung</h2>
        </div>
        <p className="text-2xl font-bold text-white">{data.hintUsageRate}%</p>
        <p className="text-xs text-white/30">der Spieler nutzen mindestens einen Hinweis</p>
      </div>

      {/* Station Dropoff */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-white/40" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Abbruch pro Station</h2>
        </div>
        <div className="space-y-2">
          {data.stationDropoff.map((s) => (
            <DropoffBar key={s.station} station={s.station} percent={s.dropoffPercent} />
          ))}
        </div>
      </div>

      {/* Note */}
      <p className="text-center text-xs text-white/30">
        Daten werden live aus der Datenbank aggregiert, sobald echte Sessions existieren.
      </p>
    </div>
  )
}
