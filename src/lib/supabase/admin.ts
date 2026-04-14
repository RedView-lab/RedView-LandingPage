import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using service_role key.
 * ONLY use server-side (API routes, webhooks). Never expose to client.
 * Bypasses RLS — use with caution.
 */
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
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
  return _supabaseAdmin;
}
