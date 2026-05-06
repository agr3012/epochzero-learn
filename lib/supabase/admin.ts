import { createClient } from '@supabase/supabase-js';

/**
 * Admin client using the service role key.
 * BYPASSES RLS. Use ONLY in server-side code (API routes, Server Actions).
 * NEVER import this into a Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
