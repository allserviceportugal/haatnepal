"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

/**
 * Keeps one Supabase browser client alive for the lifetime of the tab so
 * its built-in session auto-refresh keeps running in the background and
 * persists refreshed cookies. This used to be proxy.ts's job on every
 * server request, but Next.js 16 locks Proxy to the Node.js runtime, which
 * our Cloudflare deployment target doesn't support yet — this client-side
 * listener is the replacement so long-lived sessions don't silently expire.
 */
export function AuthSessionSync() {
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    clientRef.current ??= createClient();

    const {
      data: { subscription },
    } = clientRef.current.auth.onAuthStateChange(() => {
      // Subscribing is what keeps the client's internal refresh timer
      // alive; the callback itself doesn't need to do anything.
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
