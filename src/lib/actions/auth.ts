"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  setPasswordSchema,
  changePasswordSchema,
  verifyCodeSchema,
} from "@/lib/validations/auth";
import { sendWelcomeEmail, sendOtpVerificationEmail } from "@/lib/services/email";
import { isDisposableEmail } from "@/lib/utils/spam-protection";

export type AuthActionState = {
  error?: string;
  step?: 'email' | 'verify' | 'success';
  email?: string;
  success?: boolean;
  requireLogin?: boolean;
  formValues?: {
    displayName?: string;
    email?: string;
    phone?: string;
    accountType?: string;
    planKey?: string;
    acceptTerms?: string;
    subscribeNewsletter?: string;
  };
};

const NOT_CONFIGURED_ERROR =
  "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function insertOtpCodeWithRetry(
  adminClient: ReturnType<typeof createAdminClient>,
  email: string,
  maxRetries: number = 3
): Promise<{ code: string; expiresAt: string }> {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await adminClient.from("otp_codes").insert({
      email,
      code,
      expires_at: expiresAt,
      verified_at: null,
      attempts: 0,
    });

    // Success — code was inserted
    if (!error) {
      return { code, expiresAt };
    }

    // If not a unique constraint violation, give up
    if (!error.message?.includes("unique")) {
      throw error;
    }

    // Unique violation — retry with a new code
    console.log(`[OTP] Code collision on attempt ${i + 1}, retrying...`);
  }

  throw new Error("Failed to generate unique OTP code after retries");
}

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
    planKey: formData.get("planKey"),
    acceptTerms: formData.get("acceptTerms"),
    subscribeNewsletter: formData.get("subscribeNewsletter"),
  });

  const displayName = formData.get("displayName") as string;
  const emailInput = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  let accountType = formData.get("accountType") as string;
  const planKey = formData.get("planKey") as string;
  const acceptTerms = formData.get("acceptTerms") as string;
  const subscribeNewsletter = formData.get("subscribeNewsletter") as string;

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      step: 'email',
      formValues: { displayName, email: emailInput, phone, accountType, planKey, acceptTerms, subscribeNewsletter },
    };
  }

  const { email, password } = parsed.data;

  // Check for disposable email
  if (isDisposableEmail(email)) {
    return {
      error: "Please use a real email address. Disposable emails are not allowed.",
      step: 'email',
      formValues: { displayName, email, phone, accountType, planKey, acceptTerms, subscribeNewsletter },
    };
  }

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
      formValues: { displayName, email, phone, accountType, planKey, acceptTerms, subscribeNewsletter },
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
      formValues: { displayName, email, phone, accountType, planKey, acceptTerms, subscribeNewsletter },
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
      formValues: { displayName, email, phone, accountType, planKey, acceptTerms, subscribeNewsletter },
    };
  }

  console.log("[SIGNUP] Auth user created:", authData.user.id);

  // Create or update profile with email_confirmed = true (auto-confirm)
  console.log("[SIGNUP] Creating/updating profile...");
  const adminClient = createAdminClient();

  // Fetch plan ID if a non-default plan was selected
  let subscriptionPlanId: string | null = null;
  if (planKey && planKey !== 'normal') {
    const { data: plan } = await adminClient
      .from("subscription_plans")
      .select("id")
      .eq("key", planKey)
      .single();
    subscriptionPlanId = plan?.id ?? null;
  }

  // Ensure account_type is valid enum value
  const validAccountType = (accountType === 'business' ? 'business' : 'individual');

  const profileUpdate: any = {
    id: authData.user.id,
    display_name: displayName,
    email,
    phone,
    account_type: validAccountType,
    phone_verified: false,
    password_set: true,
    email_confirmed: false,
  };

  if (subscriptionPlanId) {
    profileUpdate.subscription_plan_id = subscriptionPlanId;
  }

  const { error: profileError } = await adminClient.from("profiles").upsert(profileUpdate);

  if (profileError) {
    console.error("[SIGNUP] Profile creation failed:", JSON.stringify(profileError));
    return {
      error: `Profile creation failed: ${profileError?.message || "unknown error"}. Details: ${JSON.stringify(profileError)}`,
      step: 'email',
      formValues: { displayName, email, phone, accountType, planKey, acceptTerms, subscribeNewsletter },
    };
  }

  console.log("[SIGNUP] Profile created, generating OTP...");

  // Generate OTP code with retry on collision
  let code: string;
  let expiresAt: string;
  try {
    const otpResult = await insertOtpCodeWithRetry(adminClient, email);
    code = otpResult.code;
    expiresAt = otpResult.expiresAt;
  } catch (err) {
    console.error("[SIGNUP] OTP generation failed:", err);
    return {
      error: `Failed to generate verification code. Please try again.`,
      step: 'email',
    };
  }

  // Send OTP verification email
  const emailResult = await sendOtpVerificationEmail(email, displayName, code);

  if (!emailResult.success) {
    console.error("[SIGNUP] OTP email sending failed:", emailResult.error);
    return {
      error: `Failed to send verification code: ${emailResult.error}`,
      step: 'email',
    };
  }

  console.log("[SIGNUP] Profile created, OTP generated and sent");

  // Sign in the new user immediately (they'll be on the verify screen)
  try {
    const supabase = await createClient();
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("[SIGNUP] User signed in automatically for verify step");
  } catch (error) {
    console.error("[SIGNUP] Auto-signin failed:", error);
  }

  // Return verify step - show OTP form
  return {
    success: true,
    step: 'verify',
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

    // Sign in with email and password
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

    // Check if user's email is confirmed
    const { data: profile } = await supabase
      .from("profiles")
      .select("email_confirmed, display_name")
      .eq("email", email)
      .single();

    if (profile && !profile.email_confirmed) {
      // Email not verified, sign out and show verify screen
      await supabase.auth.signOut();

      // Generate and send OTP
      const adminClient = createAdminClient();
      try {
        const otpResult = await insertOtpCodeWithRetry(adminClient, email);
        await sendOtpVerificationEmail(email, profile?.display_name || email, otpResult.code);
      } catch (err) {
        console.error("[LOGIN] OTP generation failed:", err);
        return {
          error: "Failed to send verification code. Please try again.",
          step: 'email',
        };
      }

      return {
        step: 'verify',
        email,
      };
    }

    const nextPath = next && typeof next === "string" && next.startsWith("/") ? next : "/";
    redirect(nextPath);
  } catch (error: unknown) {
    // redirect() throws an error internally; check if this is a redirect error by looking for its marker properties
    if (error && typeof error === "object" && ("digest" in error || "status" in error)) {
      // This is likely a redirect error from Next.js, so re-throw it
      throw error;
    }
    console.error("[LOGIN] Error:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * FORGOT PASSWORD: Email + OTP reset link
 */
export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: "Please enter a valid email address.",
      step: 'email',
    };
  }

  const { email } = parsed.data;

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    // Always return generic success (don't leak whether email exists)
    return {
      success: true,
      step: 'success',
    };
  } catch (error: unknown) {
    console.error("[FORGOT_PASSWORD] Error:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * RESET PASSWORD: Set new password (from email link)
 */
export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid input",
      step: 'email',
    };
  }

  const { password } = parsed.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "Session expired. Please try the forgot password link again.",
        step: 'email',
      };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("[RESET_PASSWORD] Update error:", error);
      return {
        error: "Failed to update password. Please try again.",
        step: 'email',
      };
    }

    return {
      success: true,
      step: 'success',
    };
  } catch (error: unknown) {
    console.error("[RESET_PASSWORD] Error:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * CHANGE PASSWORD: Update password for logged-in user
 */
export async function changePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in to change your password.",
      step: 'email',
    };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid input",
      step: 'email',
    };
  }

  const { currentPassword, password } = parsed.data;

  try {
    // Re-authenticate with current password to verify it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: currentPassword,
    });

    if (signInError) {
      console.error("[CHANGE_PASSWORD] Re-auth failed:", signInError);
      return {
        error: "Current password is incorrect.",
        step: 'email',
      };
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      console.error("[CHANGE_PASSWORD] Update error:", updateError);
      return {
        error: "Failed to update password. Please try again.",
        step: 'email',
      };
    }

    return {
      success: true,
      step: 'success',
    };
  } catch (error: unknown) {
    console.error("[CHANGE_PASSWORD] Error:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * VERIFY CODE: Verify OTP from signup or login
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
    return {
      error: "Please enter a valid 6-digit code.",
      step: 'verify',
    };
  }

  const { email, code } = parsed.data;

  try {
    const admin = createAdminClient();

    // Look up the OTP code
    const { data: otpRow, error: queryError } = await admin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .is("verified_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (queryError || !otpRow) {
      // Get the latest unverified row to increment attempts by ID
      const { data: latestRow } = await admin
        .from("otp_codes")
        .select("id, attempts")
        .eq("email", email)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const currentAttempts = (latestRow?.attempts ?? 0) as number;

      if (currentAttempts < 5 && latestRow?.id) {
        // Update by ID for deterministic single-row updates
        await admin
          .from("otp_codes")
          .update({ attempts: currentAttempts + 1 })
          .eq("id", latestRow.id);
      }

      if (currentAttempts >= 4) {
        return {
          error: "Too many attempts. Please request a new code.",
          step: 'verify',
          email,
        };
      }

      return {
        error: "Invalid or expired code. Please try again.",
        step: 'verify',
        email,
      };
    }

    // Mark code as verified
    await admin
      .from("otp_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", otpRow.id);

    // Update profile email_confirmed
    await admin
      .from("profiles")
      .update({ email_confirmed: true })
      .eq("email", email);

    // Send welcome email (without password)
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("email", email)
      .single();

    if (profile) {
      await sendWelcomeEmail(email, profile.display_name);
    }

    // Check if user has an active session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.email === email) {
      // Came from signup (session already live)
      return {
        success: true,
        step: 'success',
      };
    } else {
      // Came from login (need to re-login)
      return {
        success: true,
        step: 'success',
        requireLogin: true,
      };
    }
  } catch (error: unknown) {
    console.error("[VERIFY_CODE] Error:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'verify',
      email,
    };
  }
}

/**
 * RESEND OTP: Send a new OTP code
 */
export async function resendOtpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return {
      error: "Invalid email address.",
      step: 'verify',
    };
  }

  try {
    const admin = createAdminClient();

    // Get user's display name
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("email", email)
      .single();

    if (!profile) {
      return {
        error: "User not found.",
        step: 'verify',
        email,
      };
    }

    // Generate and insert new OTP with retry on collision
    try {
      const otpResult = await insertOtpCodeWithRetry(admin, email);
      await sendOtpVerificationEmail(email, profile.display_name, otpResult.code);
    } catch (err) {
      console.error("[RESEND_OTP] OTP generation failed:", err);
      return {
        error: "Failed to resend code. Please try again.",
        step: 'verify',
        email,
      };
    }

    return {
      success: true,
      step: 'verify',
      email,
    };
  } catch (error: unknown) {
    console.error("[RESEND_OTP] Error:", error);
    return {
      error: "Failed to resend code. Please try again.",
      step: 'verify',
      email,
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
