"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { signUpSchema, verifyCodeSchema, signInSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  codeSent?: boolean;
  step?: 'email' | 'verify';
  email?: string;
  success?: boolean;
};

const NOT_CONFIGURED_ERROR =
  "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

/**
 * SIGNUP: Send OTP code to email
 * Email + Name + Phone + Account Type
 */
export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    accountType: formData.get("accountType"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      step: 'email',
    };
  }

  const { displayName, email, phone, accountType } = parsed.data;
  const supabase = await createClient();

  // Send OTP code to email
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        display_name: displayName,
        phone,
        account_type: accountType,
      },
    },
  });

  if (error) {
    return { error: error.message, step: 'email' };
  }

  return {
    codeSent: true,
    step: 'verify',
    email,
  };
}

/**
 * VERIFY CODE: User enters OTP from email
 */
export async function verifyCodeAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = verifyCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    const email = (formData.get("email") as string) ?? '';
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid code",
      step: 'verify',
      email,
    };
  }

  const { email, code } = parsed.data;
  const supabase = await createClient();

  // Verify OTP
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (error || !data.user) {
    return {
      error: "Invalid or expired code. Request a new one.",
      step: 'verify',
      email,
    };
  }

  // User authenticated! Create profile if doesn't exist
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!existingProfile) {
    const displayName = data.user.user_metadata?.display_name || email.split("@")[0];
    const phone = data.user.user_metadata?.phone || "";
    const accountType = data.user.user_metadata?.account_type || "individual";

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      display_name: displayName,
      email,
      phone,
      account_type: accountType,
      phone_verified: false,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return {
        error: "Account created but profile setup failed. Please contact support.",
        step: 'verify',
        email,
      };
    }
  }

  const nextPath = formData.get("next");
  redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/");
}

/**
 * LOGIN: Send OTP code to email (reuse signup for existing users)
 */
export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Invalid email", step: 'email' };
  }

  const supabase = await createClient();

  // Send OTP code
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, step: 'email' };
  }

  return {
    codeSent: true,
    step: 'verify',
    email: parsed.data.email,
  };
}

/**
 * RESEND CODE: User didn't receive code
 */
export async function resendCodeAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "Configuration error" };
  }

  const email = formData.get("email") as string;
  if (!email) return { error: "Email required" };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, email };
  }

  return { codeSent: true, email };
}

/**
 * LOGOUT
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
