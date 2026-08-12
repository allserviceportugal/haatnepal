import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const VIEWER_COOKIE_NAME = "hn_vid";
const VIEWER_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listingId } = await params;

    // Get or create anonymous viewer key
    const cookieStore = await cookies();
    let viewerKey = cookieStore.get(VIEWER_COOKIE_NAME)?.value;

    if (!viewerKey) {
      viewerKey = randomUUID();
      // Set cookie in response — httpOnly, 1yr, SameSite=Lax
      cookieStore.set(VIEWER_COOKIE_NAME, viewerKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VIEWER_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    // Get current user from the session (may be null for anonymous visitors)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Call the RPC to record the view
    // The RPC handles self-view exclusion and ON CONFLICT dedup
    const { error } = await supabase.rpc("track_listing_view", {
      p_listing_id: listingId,
      p_viewer_id: user?.id || null,
      p_viewer_key: viewerKey,
    });

    if (error) {
      console.error("[VIEW_TRACKING] RPC error:", error);
      // Don't fail the request; this is best-effort analytics
      return new Response(JSON.stringify({ ok: false }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("[VIEW_TRACKING] Error:", err);
    // Return 200 anyway — view tracking should never break the listing page
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
}
