/**
 * Browser-side Supabase client for Next.js App Router
 * Uses @supabase/ssr for automatic session management
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@escape-tour/database/src/types/supabase';

/**
 * Create a Supabase client for use in browser (Client Components)
 * Automatically manages auth session via cookies
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
