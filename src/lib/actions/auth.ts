"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  signUpSchema,
  loginSchema,
} from "@/lib/validations/auth";
import { sendConfirmationEmail } from "@/lib/services/email";

export type AuthActionState = {
  error?: string;
  step?: 'email' | 'success';
  email?: string;
  success?: boolean;
  formValues?: {
    displayName?: string;
    email?: string;
    phone?: string;
    accountType?: string;
  };
};

const NOT_CONFIGURED_ERROR =
  "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

/**
 * SIGNUP: Create account and send email confirmation link
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
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone"),
    accountType: formData.get("accountType"),
  });

  const displayName = formData.get("displayName") as string;
  const emailInput = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const accountType = formData.get("accountType") as string;

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      step: 'email',
      formValues: { displayName, email: emailInput, phone, accountType },
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  // Check if email or phone already exist
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingEmail) {
    return {
      error: "This email is already registered. Please log in instead.",
      step: 'email',
      formValues: { displayName, email, phone, accountType },
    };
  }

  const { data: existingPhone } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .single();

  if (existingPhone) {
    return {
      error: "This phone number is already registered. Please use a different number.",
      step: 'email',
      formValues: { displayName, email, phone, accountType },
    };
  }

  // Create auth user WITHOUT email confirmation requirement
  console.log("[SIGNUP] Creating auth user:", email);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        phone,
        account_type: accountType,
      },
      emailRedirectTo: undefined, // Don't use Supabase email confirmation
    },
  });

  if (authError || !authData.user) {
    console.error("[SIGNUP] Auth creation failed:", authError?.message);
    return {
      error: `Failed to create account: ${authError?.message || "unknown error"}`,
      step: 'email',
      formValues: { displayName, email, phone, accountType },
    };
  }

  console.log("[SIGNUP] Auth user created:", authData.user.id);

  // Create or update profile with email_confirmed = false (using admin client to bypass RLS)
  console.log("[SIGNUP] Creating/updating profile...");
  const adminClient = createAdminClient();
  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: authData.user.id,
    display_name: displayName,
    email,
    phone,
    account_type: accountType,
    phone_verified: false,
    password_set: true,
    email_confirmed: false,
  });

  if (profileError) {
    console.error("[SIGNUP] Profile creation failed:", profileError?.message);
    return {
      error: `Profile creation failed: ${profileError?.message || "unknown error"}`,
      step: 'email',
      formValues: { displayName, email, phone, accountType },
    };
  }

  console.log("[SIGNUP] Profile created, generating confirmation token...");

  // Generate confirmation token (using admin client to bypass RLS)
  const token = crypto.randomBytes(32).toString("hex");
  const { error: tokenError } = await adminClient
    .from("email_confirmation_tokens")
    .insert({
      user_id: authData.user.id,
      token,
      email,
    });

  if (tokenError) {
    console.error("[SIGNUP] Token creation failed:", tokenError?.message);
    return {
      error: "Failed to create confirmation token",
      step: 'email',
    };
  }

  // Send confirmation email via Resend
  console.log("[SIGNUP] Sending confirmation email...");
  const emailResult = await sendConfirmationEmail(email, displayName, token);

  if (!emailResult.success) {
    console.error("[SIGNUP] Email sending failed:", emailResult.error);
    return {
      error: `Failed to send confirmation email: ${emailResult.error}`,
      step: 'email',
    };
  }

  console.log("[SIGNUP] Account created and confirmation email sent");

  return {
    success: true,
    step: 'success',
    email,
  };
}

/**
 * LOGIN: Email + Password login (requires email confirmation)
 */
export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe"),
  });

  if (!parsed.success) {
    return {
      error: "Invalid email or password.",
      step: 'email',
    };
  }

  const { email, password, rememberMe } = parsed.data;
  const next = formData.get("next");

  try {
    const supabase = await createClient({ rememberMe });

    // Check if email is confirmed
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email_confirmed")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("[LOGIN] Profile lookup failed:", profileError?.message);
      return {
        error: "Invalid email or password.",
        step: 'email',
      };
    }

    if (!profile.email_confirmed) {
      console.log("[LOGIN] Email not confirmed for:", email);
      return {
        error: "Please confirm your email before logging in. Check your inbox for the confirmation link.",
        step: 'email',
      };
    }

    // Email is confirmed, proceed with login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("[LOGIN] Sign-in failed:", signInError?.message);
      return {
        error: "Invalid email or password.",
        step: 'email',
      };
    }

    const nextPath = next && typeof next === "string" && next.startsWith("/") ? next : "/";
    redirect(nextPath);
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * LOGOUT
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
