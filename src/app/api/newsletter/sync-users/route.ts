import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminApiKey, createUnauthorizedResponse, checkRateLimit, createRateLimitedResponse } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    if (!verifyAdminApiKey(request)) {
      return createUnauthorizedResponse();
    }

    // Rate limiting (max 1 per hour)
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`sync-users-${clientIp}`, 1, 3600000)) {
      return createRateLimitedResponse();
    }

    const supabase = await createClient();

    // Get all auth users
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("[SYNC USERS] Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users to sync",
        synced: 0,
      });
    }

    // Insert all users into newsletter_subscribers
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert(
        users.map((user) => ({
          email: user.email,
          active: true,
          categories: ["blogs", "top_sellers", "featured_listings", "weekly_digest"],
          subscribed_at: user.created_at || new Date().toISOString(),
        }))
      )
      .select();

    if (error) {
      // If constraint error (duplicate emails), it's okay - those users already exist
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Sync completed (some users already subscribed)",
          total_users: users.length,
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "All users synced to newsletter",
      synced: data?.length || users.length,
      total_users: users.length,
    });
  } catch (error) {
    console.error("[SYNC USERS] Error:", error);
    return NextResponse.json(
      { error: "Failed to sync users", success: false },
      { status: 500 }
    );
  }
}
