import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Link</h1>
          <p className="mt-2 text-slate-600">No confirmation token provided.</p>
        </div>
      </div>
    );
  }

  try {
    const adminClient = createAdminClient();

    // Find the token in the database
    const { data: tokenData, error: tokenError } = await adminClient
      .from("email_confirmation_tokens")
      .select("id, user_id, email, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Invalid Token</h1>
            <p className="mt-2 text-slate-600">This confirmation link is invalid.</p>
          </div>
        </div>
      );
    }

    // Check if token is already used
    if (tokenData.used_at) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-600">Already Confirmed</h1>
            <p className="mt-2 text-slate-600">This email has already been confirmed.</p>
            <a href="/login" className="mt-4 inline-block text-orange-600 hover:text-orange-700">
              Go to Login
            </a>
          </div>
        </div>
      );
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (new Date() > expiresAt) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Link Expired</h1>
            <p className="mt-2 text-slate-600">This confirmation link has expired.</p>
          </div>
        </div>
      );
    }

    // Mark email as confirmed
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ email_confirmed: true })
      .eq("id", tokenData.user_id);

    if (updateError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-2 text-slate-600">Failed to confirm email.</p>
          </div>
        </div>
      );
    }

    // Mark token as used
    await adminClient
      .from("email_confirmation_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Redirect to login
    redirect("/login?confirmed=true");
  } catch (error) {
    console.error("[CONFIRM EMAIL] Error:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-slate-600">An error occurred.</p>
        </div>
      </div>
    );
  }
}
