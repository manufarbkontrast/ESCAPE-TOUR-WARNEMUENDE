import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from './admin-shell'

interface AdminLayoutProps {
 readonly children: React.ReactNode
}

/**
 * Admin layout with auth gate
 * Redirects to /login if no authenticated user
 * Login page has its own layout (no shell)
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()

 if (!user) {
  redirect('/login')
 }

 return <AdminShell userEmail={user.email ?? ''}>{children}</AdminShell>
}
