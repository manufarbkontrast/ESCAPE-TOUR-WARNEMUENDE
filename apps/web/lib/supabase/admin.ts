/**
 * Trusted server-side Supabase client (service role).
 *
 * Guests never sign in, so route handlers run as the `anon` role. The RLS
 * policies on `bookings` and `game_sessions` are written against
 * `auth.uid()`, which means an anonymous request sees zero rows — a booking
 * code can never be redeemed and a paid session can never be loaded.
 *
 * These routes do their own authorization (booking code, HMAC session
 * cookie, Stripe webhook signature), so they connect as the service role and
 * bypass RLS deliberately.
 *
 * NEVER import this from a client component: the key it reads must not reach
 * the browser.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@escape-tour/database/src/types/supabase';

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Returns the shared service-role client.
 *
 * The environment is validated on first use rather than at module load, so a
 * missing key fails the single request that needs it instead of breaking the
 * production build (see `lib/stripe/server.ts` for the pattern to avoid).
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
    );
  }

  cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

/** Test seam — drops the memoised client. */
export function resetAdminClient(): void {
  cachedClient = null;
}
