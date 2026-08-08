import { createBrowserClient } from "@supabase/ssr";

// Not typed against a generated Database schema yet — run `supabase gen
// types typescript` once a real project exists and wire it in as the
// generic here for full query type-safety. Domain types in ./types are
// used for casting query results in the meantime.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
