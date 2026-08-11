"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  signUpSchema,
  verifyCodeSchema,
  loginSchema,
  forgotPasswordSchema,
  setPasswordSchema,
} from "@/lib/validations/auth";
import { createOtpCode, checkOtpCode, markOtpCodeVerified } from "@/lib/utils/otp";
import { sendOtpEmail, sendWelcomeEmail } from "@/lib/services/email";

export type AuthActionState = {
  error?: string;
  codeSent?: boolean;
  step?: 'email' | 'verify' | 'set-password';
  mode?: 'signup' | 'reset';
  email?: string;
  success?: boolean;
};

const NOT_CONFIGURED_ERROR =
  "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

/**
 * SIGNUP: Collect all info (email, password, name, phone, account type) and send OTP
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

  // Generate and send OTP
  const { code, error: otpError } = await createOtpCode(email, {
    display_name: displayName,
    phone,
    account_type: accountType as "individual" | "business",
    password, // Store password in OTP metadata for later use
  });

  if (otpError || !code) {
    return {
      error: "Failed to generate verification code. Please try again.",
      step: 'email',
    };
  }

  const emailSent = await sendOtpEmail(email, code);
  if (!emailSent) {
    return {
      error: "Failed to send verification email. Please try again.",
      step: 'email',
    };
  }

  return {
    codeSent: true,
    step: 'verify',
    email,
  };
}

/**
 * VERIFY SIGNUP CODE: Create account with user's password and auto-login
 */
export async function verifySignupCodeAction(
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
  const { valid, metadata, error } = await checkOtpCode(email, code);

  if (!valid) {
    return {
      error: error || "Invalid or expired code. Request a new one.",
      step: 'verify',
      email,
    };
  }

  if (!metadata || !metadata.password) {
    return {
      error: "Verification failed. Please try again.",
      step: 'verify',
      email,
    };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const { password } = metadata;

  // Create Supabase auth user with user's password
  console.log("[SIGNUP] Creating auth user:", { email, phone: metadata.phone });
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: metadata.display_name,
        phone: metadata.phone,
        account_type: metadata.account_type,
      },
    },
  });

  if (authError || !authData.user) {
    console.error("[SIGNUP] Auth user creation FAILED:", {
      error: authError?.message,
      code: authError?.code,
      status: authError?.status,
    });
    return {
      error: `Failed to create account: ${authError?.message || "unknown"}`,
      step: 'verify',
      email,
    };
  }
  console.log("[SIGNUP] Auth user created:", authData.user.id);

  // Auto-confirm email since they verified via OTP
  console.log("[SIGNUP] Auto-confirming email...");
  const { error: confirmError } = await admin.auth.admin.updateUserById(
    authData.user.id,
    { email_confirm: true }
  );

  if (confirmError) {
    console.warn("[SIGNUP] Auto-confirm warning:", confirmError?.message);
  } else {
    console.log("[SIGNUP] Email confirmed");
  }

  // Create profile
  console.log("[SIGNUP] Creating profile...");
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", authData.user.id)
    .single();

  if (!existingProfile) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      display_name: metadata.display_name,
      email,
      phone: metadata.phone,
      account_type: metadata.account_type,
      phone_verified: false,
      password_set: true,
    });

    if (profileError) {
      console.error("[SIGNUP] Profile creation FAILED:", {
        error: profileError?.message,
        code: profileError?.code,
      });
      return {
        error: `Profile failed: ${profileError?.message || "unknown"}`,
        step: 'verify',
        email,
      };
    }
    console.log("[SIGNUP] Profile created");
  }

  // Mark OTP as verified
  await markOtpCodeVerified(email, code);

  // Sign in user with their password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("[AUTH] Error signing in after signup:", signInError);
    return {
      error: "Account created but login failed. Please try signing in.",
      step: 'verify',
      email,
    };
  }

  // Send welcome email
  await sendWelcomeEmail(email, metadata.display_name);

  // Redirect to home or next page
  const nextPath = formData.get("next");
  redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/");
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
      console.error("[AUTH] Login error:", signInError);
      return {
        error: "Invalid email or password.",
        step: 'email',
      };
    }

    const nextPath = next && typeof next === "string" && next.startsWith("/") ? next : "/";
    redirect(nextPath);
  } catch (error) {
    console.error("[AUTH] Error during login:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * FORGOT PASSWORD: Send OTP to email
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
    return { error: "Invalid email", step: 'email' };
  }

  const supabase = await createClient();
  const { email } = parsed.data;

  // Check if user exists
  const { data: user } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!user) {
    return {
      error: "No account found with this email.",
      step: 'email',
    };
  }

  const { code, error: otpError } = await createOtpCode(email, {
    display_name: "",
    phone: "",
    account_type: "individual",
  });

  if (otpError || !code) {
    return {
      error: "Failed to generate verification code. Please try again.",
      step: 'email',
    };
  }

  const emailSent = await sendOtpEmail(email, code);
  if (!emailSent) {
    return {
      error: "Failed to send verification email. Please try again.",
      step: 'email',
    };
  }

  return {
    codeSent: true,
    step: 'verify',
    email,
  };
}

/**
 * VERIFY RESET CODE: User verifies OTP for password reset
 */
export async function verifyResetCodeAction(
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
  const { valid, error } = await checkOtpCode(email, code);

  if (!valid) {
    return {
      error: error || "Invalid or expired code. Request a new one.",
      step: 'verify',
      email,
    };
  }

  await markOtpCodeVerified(email, code);

  return {
    step: 'set-password',
    mode: 'reset',
    email,
  };
}

/**
 * SET PASSWORD: For password reset flow only
 */
export async function setPasswordAction(
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
    const email = formData.get("email") as string;
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      step: 'set-password',
      mode: 'reset',
      email,
    };
  }

  const { password } = parsed.data;
  const email = formData.get("email") as string;
  const rememberMe = formData.get("rememberMe") === "on";
  const next = formData.get("next") as string | null;

  if (!email) {
    return { error: "Invalid request. Please try again.", step: 'set-password' };
  }

  try {
    const supabase = await createClient({ rememberMe });
    const admin = createAdminClient();

    // Look up user by email
    const { data: profile, error: profileLookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileLookupError || !profile) {
      return {
        error: "User not found. Please try again.",
        step: 'set-password',
        mode: 'reset',
        email,
      };
    }

    // Update password using admin API
    const { error: adminError } = await admin.auth.admin.updateUserById(
      profile.id,
      { password }
    );

    if (adminError) {
      console.error("[AUTH] Error updating password:", adminError);
      return {
        error: "Failed to set password. Please try again.",
        step: 'set-password',
        mode: 'reset',
        email,
      };
    }

    // Sign in with new password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("[AUTH] Error signing in after password reset:", signInError);
      return {
        error: "Password updated but login failed. Please try logging in.",
        step: 'set-password',
        mode: 'reset',
        email,
      };
    }

    const nextPath = next && typeof next === "string" && next.startsWith("/") ? next : "/";
    redirect(nextPath);
  } catch (error) {
    console.error("[AUTH] Error in set password:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'set-password',
      mode: 'reset',
      email,
    };
  }
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

  const { code, error: otpError } = await createOtpCode(email, {
    display_name: "",
    phone: "",
    account_type: "individual",
  });

  if (otpError || !code) {
    return { error: "Failed to generate verification code", email };
  }

  const emailSent = await sendOtpEmail(email, code);
  if (!emailSent) {
    return { error: "Failed to send verification email", email };
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
