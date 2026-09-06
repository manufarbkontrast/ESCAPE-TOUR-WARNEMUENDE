/**
 * Access to the `vouchers` table.
 *
 * `packages/database/src/types/supabase.ts` is generated from the schema and
 * predates this table, so `supabase.from('vouchers')` infers `never` and every
 * call on it fails to typecheck. Regenerating those types is the real fix —
 * until then the untyped access lives here rather than as casts scattered
 * through the routes.
 */

import { type SupabaseClient } from '@supabase/supabase-js'
import type { createAdminClient } from '@/lib/supabase/admin'

/**
 * The return type is spelled out because inferring it would leak a path into
 * postgrest-js that TypeScript cannot name portably.
 */
export function voucherTable(
  client: ReturnType<typeof createAdminClient>,
): ReturnType<SupabaseClient['from']> {
  return (client as unknown as SupabaseClient).from('vouchers')
}
