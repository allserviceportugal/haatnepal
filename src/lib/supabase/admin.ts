import { createClient } from "@supabase/supabase-js";

// Admin client for server-side operations that require bypassing RLS or acting
// on behalf of unauthenticated users (e.g., resetting another user's password).
// Uses SUPABASE_SECRET_KEY (service role), which must never be exposed to client-side code.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
