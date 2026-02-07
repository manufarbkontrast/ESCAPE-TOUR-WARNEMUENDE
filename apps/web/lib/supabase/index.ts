/**
 * Supabase client exports
 * Barrel export for easier imports
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';
