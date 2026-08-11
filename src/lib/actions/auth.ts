"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  signUpSchema,
  loginSchema,
} from "@/lib/validations/auth";
import { sendWelcomeEmail } from "@/lib/services/email";

export type AuthActionState = {
  error?: string;
  step?: 'email' | 'success';
  email?: string;
  success?: boolean;
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

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      step: 'email',
    };
  }

  const { displayName, email, password, phone, accountType } = parsed.data;
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
    };
  }

  // Create auth user (Supabase will send confirmation email automatically)
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    console.error("[SIGNUP] Auth creation failed:", authError?.message);
    return {
      error: `Failed to create account: ${authError?.message || "unknown error"}`,
      step: 'email',
    };
  }

  console.log("[SIGNUP] Auth user created:", authData.user.id);

  // Create profile
  console.log("[SIGNUP] Creating profile...");
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    display_name: displayName,
    email,
    phone,
    account_type: accountType,
    phone_verified: false,
    password_set: true,
  });

  if (profileError) {
    console.error("[SIGNUP] Profile creation failed:", profileError?.message);
    return {
      error: `Profile creation failed: ${profileError?.message || "unknown error"}`,
      step: 'email',
    };
  }

  console.log("[SIGNUP] Profile created successfully");

  return {
    success: true,
    step: 'success',
    email,
  };
}

/**
 * LOGIN: Email + Password login
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
