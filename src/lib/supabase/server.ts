import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Not typed against a generated Database schema yet — run `supabase gen
// types typescript` once a real project exists and wire it in as the
// generic here for full query type-safety. Domain types in ./types are
// used for casting query results in the meantime.
export async function createClient(options?: { rememberMe?: boolean }) {
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
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              let finalOptions = cookieOptions;
              if (options?.rememberMe === false) {
                // Session cookie: remove maxAge and expires to make it
                // disappear when the browser fully closes
                finalOptions = {
                  ...cookieOptions,
                  maxAge: undefined,
                  expires: undefined,
                };
              }
              cookieStore.set(name, value, finalOptions);
            });
          } catch {
            // Called from a Server Component during a render pass — the
            // proxy is responsible for refreshing the session cookie there.
          }
        },
      },
    }
  );
}
