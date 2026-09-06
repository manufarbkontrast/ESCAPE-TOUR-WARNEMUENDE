import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/roles'
import { AdminShell } from './admin-shell'

interface AdminLayoutProps {
 readonly children: React.ReactNode
}

/**
 * Admin layout with auth gate
 *
 * Zweite Schicht neben `middleware.ts`: jede Seite unter app/(admin) läuft
 * hier durch, unabhängig vom Matcher-Regex der Middleware.
 *
 * Nicht eingeloggt → /login. Eingeloggt ohne Admin-Rolle → Startseite; ein
 * Login-Redirect liefe für den Fall im Kreis.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()

 if (!user) {
  redirect('/login')
 }

 if (!isAdmin(user)) {
  redirect('/')
 }

 return <AdminShell userEmail={user.email ?? ''}>{children}</AdminShell>
}
