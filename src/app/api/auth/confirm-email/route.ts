import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing confirmation token" },
        { status: 400 }
      );
    }

    console.log("[CONFIRM EMAIL] Received token");

    const adminClient = createAdminClient();

    // Find the token in the database
    const { data: tokenData, error: tokenError } = await adminClient
      .from("email_confirmation_tokens")
      .select("id, user_id, email, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      console.error("[CONFIRM EMAIL] Token not found or error:", tokenError?.message);
      return NextResponse.redirect(
        new URL("/auth/confirmation-failed?reason=invalid-token", request.url)
      );
    }

    // Check if token is already used
    if (tokenData.used_at) {
      console.log("[CONFIRM EMAIL] Token already used");
      return NextResponse.redirect(
        new URL("/auth/confirmation-failed?reason=already-used", request.url)
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (new Date() > expiresAt) {
      console.log("[CONFIRM EMAIL] Token expired");
      return NextResponse.redirect(
        new URL("/auth/confirmation-failed?reason=expired", request.url)
      );
    }

    // Mark email as confirmed
    console.log("[CONFIRM EMAIL] Updating profile for user:", tokenData.user_id);
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ email_confirmed: true })
      .eq("id", tokenData.user_id);

    if (updateError) {
      console.error("[CONFIRM EMAIL] Update failed:", updateError?.message);
      return NextResponse.redirect(
        new URL("/auth/confirmation-failed?reason=update-failed", request.url)
      );
    }

    // Mark token as used
    await adminClient
      .from("email_confirmation_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    console.log("[CONFIRM EMAIL] Email confirmed successfully for:", tokenData.email);

    // Redirect to success page or login
    return NextResponse.redirect(
      new URL("/login?confirmed=true", request.url)
    );
  } catch (error) {
    console.error("[CONFIRM EMAIL] Error:", error);
    return NextResponse.redirect(
      new URL("/auth/confirmation-failed?reason=error", request.url)
    );
  }
}
