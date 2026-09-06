/**
 * Vergibt oder entzieht die Admin-Rolle für den Admin-Bereich.
 *
 * Ohne mindestens ein Konto mit dieser Rolle bleiben /dashboard und
 * /buchungen für alle gesperrt — die Middleware und das Admin-Layout prüfen
 * seit der Rollenumstellung nicht mehr nur „eingeloggt".
 *
 * Aufruf (aus apps/web):
 *   node --env-file=.env.local --import tsx scripts/set-admin-role.ts chef@example.de
 *   node --env-file=.env.local --import tsx scripts/set-admin-role.ts chef@example.de --remove
 *   node --env-file=.env.local --import tsx scripts/set-admin-role.ts --list
 *
 * Braucht SUPABASE_SERVICE_ROLE_KEY: `app_metadata` ist mit dem Anon-Key nicht
 * schreibbar, und genau das ist der Grund, warum die Rolle dort und nicht in
 * `user_metadata` steht.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { withAdminRole, withoutAdminRole } from '../lib/auth/assign-role'
import { isAdmin } from '../lib/auth/roles'

/** Seitengröße beim Durchblättern der Nutzerliste. */
const PAGE_SIZE = 200

/** Obergrenze, damit ein API-Fehler nicht in eine Endlosschleife läuft. */
const MAX_PAGES = 50

interface Args {
  readonly email: string | null
  readonly remove: boolean
  readonly list: boolean
}

function parseArgs(argv: readonly string[]): Args {
  const rest = argv.filter((a) => !a.startsWith('--'))

  return {
    email: rest[0] ?? null,
    remove: argv.includes('--remove'),
    list: argv.includes('--list'),
  }
}

function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.\n' +
        'Aufruf mit: node --env-file=.env.local --import tsx scripts/set-admin-role.ts …',
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Alle Konten, seitenweise. Die Admin-API kennt keine Suche nach E-Mail. */
async function listAllUsers(supabase: SupabaseClient) {
  const users = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE })

    if (error) {
      throw new Error(`Nutzerliste konnte nicht gelesen werden: ${error.message}`)
    }

    users.push(...data.users)

    if (data.users.length < PAGE_SIZE) break
  }

  return users
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const supabase = createServiceClient()
  const users = await listAllUsers(supabase)

  if (args.list) {
    if (users.length === 0) {
      console.log('Keine Konten vorhanden.')
      return
    }

    console.log(`${users.length} Konto/Konten:`)
    for (const user of users) {
      console.log(`  ${isAdmin(user) ? '[admin]' : '[     ]'} ${user.email ?? '(ohne E-Mail)'}`)
    }
    return
  }

  if (!args.email) {
    throw new Error(
      'Bitte eine E-Mail-Adresse angeben, oder --list für eine Übersicht.\n' +
        'Beispiel: node --env-file=.env.local --import tsx scripts/set-admin-role.ts chef@example.de',
    )
  }

  const gesucht = args.email.trim().toLowerCase()
  const user = users.find((u) => u.email?.toLowerCase() === gesucht)

  if (!user) {
    throw new Error(
      `Kein Konto mit der E-Mail-Adresse ${args.email}.\n` +
        'Vorhandene Konten zeigt --list. Ein Konto legt man im Supabase-Dashboard unter Authentication an.',
    )
  }

  const neu = args.remove ? withoutAdminRole(user.app_metadata) : withAdminRole(user.app_metadata)

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, { app_metadata: neu })

  if (error) {
    throw new Error(`Rolle konnte nicht geschrieben werden: ${error.message}`)
  }

  // Gegenprüfung mit derselben Funktion, die auch die Middleware benutzt.
  const jetztAdmin = isAdmin(data.user)

  if (jetztAdmin === args.remove) {
    throw new Error(
      `Die Rolle steht nach dem Schreiben auf "${String(data.user.app_metadata?.role)}" — erwartet war ` +
        `${args.remove ? 'keine Admin-Rolle' : 'admin'}.`,
    )
  }

  console.log(
    args.remove
      ? `Admin-Rolle entzogen: ${user.email}`
      : `Admin-Rolle vergeben: ${user.email}\n` +
          'Die Rolle steht im JWT — betroffene Konten müssen sich einmal neu anmelden.',
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
