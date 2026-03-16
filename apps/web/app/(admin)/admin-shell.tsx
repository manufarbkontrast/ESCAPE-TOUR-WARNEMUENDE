'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@escape-tour/database/src/types/supabase'
import {
  LayoutDashboard,
  Ticket,
  LogOut,
  Anchor,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { href: '/buchungen', label: 'Buchungen', icon: Ticket },
] as const

// ---------------------------------------------------------------------------
// AdminShell
// ---------------------------------------------------------------------------

interface AdminShellProps {
  readonly children: React.ReactNode
  readonly userEmail: string
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-dark-950">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 w-56 flex flex-col"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Anchor className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-[10px] text-dark-600">Escape Tour</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-dark-500 hover:text-dark-300'
                }`}
                style={
                  isActive
                    ? {
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                      }
                    : undefined
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.04)' }}>
          <p className="px-3 text-[11px] text-dark-600 truncate mb-2">{userEmail}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-dark-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
