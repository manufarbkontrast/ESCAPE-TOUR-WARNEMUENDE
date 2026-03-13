import { createClient } from '@/lib/supabase/server'
import type { Database } from '@escape-tour/database/src/types/supabase'
import { Ticket, Users, Euro, Gamepad2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingRow = Database['public']['Tables']['bookings']['Row']
type SessionRow = Database['public']['Tables']['game_sessions']['Row']

interface StatCardProps {
  readonly label: string
  readonly value: string | number
  readonly icon: React.ElementType
  readonly accent?: string
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon: Icon, accent = 'rgba(230, 146, 30, 0.08)' }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-sand-500">{label}</span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: accent }}
        >
          <Icon className="h-4 w-4 text-brass-400" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-2xl font-bold text-sand-50">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RecentBookingsTable
// ---------------------------------------------------------------------------

function RecentBookingsTable({ bookings }: { readonly bookings: readonly BookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <p className="text-sm text-sand-600 py-8 text-center">Noch keine Buchungen vorhanden.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide">Code</th>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide">E-Mail</th>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide">Team</th>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide">Teilnehmer</th>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide">Datum</th>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide">Status</th>
            <th className="py-3 px-4 text-[11px] font-medium text-sand-600 uppercase tracking-wide text-right">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b hover:bg-white/[0.01] transition-colors"
              style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}
            >
              <td className="py-3 px-4 font-mono text-sm text-brass-400 font-medium">{b.booking_code}</td>
              <td className="py-3 px-4 text-sm text-sand-300">{b.contact_email}</td>
              <td className="py-3 px-4 text-sm text-sand-400">{b.team_name ?? '–'}</td>
              <td className="py-3 px-4 text-sm text-sand-300">{b.participant_count}</td>
              <td className="py-3 px-4 text-sm text-sand-400">
                {new Date(b.scheduled_date).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={b.status} />
              </td>
              <td className="py-3 px-4 text-sm text-sand-300 text-right font-medium">
                {(b.amount_cents / 100).toFixed(2).replace('.', ',')} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { readonly status: string | null }) {
  const styles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    confirmed: {
      bg: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.15)',
      text: 'text-green-400',
      label: 'Bestätigt',
    },
    completed: {
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.15)',
      text: 'text-blue-400',
      label: 'Abgeschlossen',
    },
    cancelled: {
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.15)',
      text: 'text-red-400',
      label: 'Storniert',
    },
    pending: {
      bg: 'rgba(234, 179, 8, 0.08)',
      border: 'rgba(234, 179, 8, 0.15)',
      text: 'text-yellow-400',
      label: 'Ausstehend',
    },
  }

  const s = styles[status ?? 'pending'] ?? styles.pending

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${s.text}`}
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch stats in parallel
  const [bookingsResult, sessionsResult] = await Promise.all([
    supabase.from('bookings').select(),
    supabase.from('game_sessions').select(),
  ])

  const bookings = (bookingsResult.data ?? []) as BookingRow[]
  const sessions = (sessionsResult.data ?? []) as SessionRow[]

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.amount_cents, 0)

  const totalParticipants = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.participant_count, 0)

  const activeSessions = sessions.filter((s) => s.status === 'active').length

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 10)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand-50 mb-6">Übersicht</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Buchungen" value={bookings.length} icon={Ticket} />
        <StatCard
          label="Umsatz"
          value={`${(totalRevenue / 100).toFixed(2).replace('.', ',')} €`}
          icon={Euro}
          accent="rgba(34, 197, 94, 0.08)"
        />
        <StatCard label="Teilnehmer" value={totalParticipants} icon={Users} />
        <StatCard
          label="Aktive Spiele"
          value={activeSessions}
          icon={Gamepad2}
          accent="rgba(59, 130, 246, 0.08)"
        />
      </div>

      {/* Recent bookings */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
          <h2 className="text-sm font-semibold text-sand-200">Letzte Buchungen</h2>
        </div>
        <RecentBookingsTable bookings={recentBookings} />
      </div>
    </div>
  )
}
