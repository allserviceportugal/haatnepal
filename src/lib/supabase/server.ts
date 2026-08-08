import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Not typed against a generated Database schema yet — run `supabase gen
// types typescript` once a real project exists and wire it in as the
// generic here for full query type-safety. Domain types in ./types are
// used for casting query results in the meantime.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during a render pass — the
            // proxy is responsible for refreshing the session cookie there.
          }
        },
      },
    }
  );
}
