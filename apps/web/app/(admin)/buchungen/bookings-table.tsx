'use client'

import { useState, useMemo } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import type { Database } from '@escape-tour/database/src/types/supabase'

type BookingRow = Database['public']['Tables']['bookings']['Row']

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
   className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.text}`}
   style={{ background: s.bg, border: `1px solid ${s.border}` }}
  >
   {s.label}
  </span>
 )
}

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

function CopyButton({ text }: { readonly text: string }) {
 const [copied, setCopied] = useState(false)

 const handleCopy = () => {
  navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 1500)
 }

 return (
  <button
   onClick={handleCopy}
   className="ml-1.5 text-dark-600 hover:text-white/50 transition-colors"
   aria-label="Kopieren"
  >
   {copied ? (
    <Check className="h-3 w-3 text-green-400" strokeWidth={2} />
   ) : (
    <Copy className="h-3 w-3" strokeWidth={1.5} />
   )}
  </button>
 )
}

// ---------------------------------------------------------------------------
// BookingsTable
// ---------------------------------------------------------------------------

interface BookingsTableProps {
 readonly bookings: readonly BookingRow[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
 const [search, setSearch] = useState('')
 const [statusFilter, setStatusFilter] = useState<string>('all')

 const filtered = useMemo(() => {
  const q = search.toLowerCase()
  return bookings.filter((b) => {
   const matchesSearch =
    !q ||
    b.booking_code.toLowerCase().includes(q) ||
    b.contact_email.toLowerCase().includes(q) ||
    (b.team_name?.toLowerCase().includes(q) ?? false)

   const matchesStatus = statusFilter === 'all' || b.status === statusFilter

   return matchesSearch && matchesStatus
  })
 }, [bookings, search, statusFilter])

 const inputStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
 }

 return (
  <div>
   {/* Filters */}
   <div className="flex flex-wrap gap-3 mb-4">
    <div className="relative flex-1 min-w-[200px]">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-600" strokeWidth={1.5} />
     <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Code, E-Mail oder Team suchen..."
      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder:text-dark-500 focus:outline-none focus:ring-1 focus:ring-white/20"
      style={inputStyle}
     />
    </div>
    <select
     value={statusFilter}
     onChange={(e) => setStatusFilter(e.target.value)}
     className="rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-white/20"
     style={inputStyle}
    >
     <option value="all">Alle Status</option>
     <option value="confirmed">Bestätigt</option>
     <option value="completed">Abgeschlossen</option>
     <option value="pending">Ausstehend</option>
     <option value="cancelled">Storniert</option>
    </select>
   </div>

   {/* Table */}
   <div
    className="rounded-2xl overflow-hidden"
    style={{
     background: 'rgba(255, 255, 255, 0.02)',
     border: '1px solid rgba(255, 255, 255, 0.04)',
    }}
   >
    {filtered.length === 0 ? (
     <p className="text-sm text-dark-600 py-12 text-center">
      {search || statusFilter !== 'all'
       ? 'Keine Buchungen für diesen Filter gefunden.'
       : 'Noch keine Buchungen vorhanden.'}
     </p>
    ) : (
     <div className="overflow-x-auto">
      <table className="w-full text-left">
       <thead>
        <tr className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">Code</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">E-Mail</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">Team</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">Teilnehmer</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">Datum</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">Status</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide text-right">Betrag</th>
         <th className="py-3 px-4 text-[11px] font-semibold text-dark-600 uppercase tracking-wide">Gebucht am</th>
        </tr>
       </thead>
       <tbody>
        {filtered.map((b) => (
         <tr
          key={b.id}
          className="border-b hover:bg-white/[0.01] transition-colors"
          style={{ borderColor: 'rgba(255, 255, 255, 0.03)' }}
         >
          <td className="py-3 px-4">
           <span className="font-mono text-sm text-white font-semibold">{b.booking_code}</span>
           <CopyButton text={b.booking_code} />
          </td>
          <td className="py-3 px-4 text-sm text-white/70">{b.contact_email}</td>
          <td className="py-3 px-4 text-sm text-white/60">{b.team_name ?? '–'}</td>
          <td className="py-3 px-4 text-sm text-white/70">{b.participant_count}</td>
          <td className="py-3 px-4 text-sm text-white/60">
           {new Date(b.scheduled_date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
           })}
          </td>
          <td className="py-3 px-4">
           <StatusBadge status={b.status} />
          </td>
          <td className="py-3 px-4 text-sm text-white/70 text-right font-semibold">
           {(b.amount_cents / 100).toFixed(2).replace('.', ',')} €
          </td>
          <td className="py-3 px-4 text-sm text-dark-500">
           {b.created_at
            ? new Date(b.created_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
             })
            : '–'}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>
  </div>
 )
}
