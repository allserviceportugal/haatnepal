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
 * SIGNUP: Generate and send 6-digit OTP to email
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

  const { code, error: otpError } = await createOtpCode(email, {
    display_name: displayName,
    phone,
    account_type: accountType as "individual" | "business",
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
 * VERIFY SIGNUP CODE: User enters 6-digit code from email during signup
 * Creates account and signs in temporarily, then prompts to set password
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

  if (!metadata) {
    return {
      error: "Verification failed. Please try again.",
      step: 'verify',
      email,
    };
  }

  const supabase = await createClient();

  // Check if phone number is already registered
  const { data: existingPhone } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", metadata.phone)
    .single();

  if (existingPhone) {
    return {
      error: "This phone number is already registered. Please use a different number.",
      step: 'verify',
      email,
    };
  }

  // Check if email is already registered
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingEmail) {
    return {
      error: "This email is already registered. Please use a different email or log in.",
      step: 'verify',
      email,
    };
  }
  const randomPassword = Math.random().toString(36).slice(-20);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: randomPassword,
    options: {
      data: {
        display_name: metadata.display_name,
        phone: metadata.phone,
        account_type: metadata.account_type,
      },
    },
  });

  if (authError || !authData.user) {
    console.error("[AUTH] Error creating auth user:", {
      error: authError,
      message: authError?.message,
      status: authError?.status,
    });
    return {
      error: "Failed to create account. Please try again.",
      step: 'verify',
      email,
    };
  }

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
      password_set: false,
    });

    if (profileError) {
      console.error("[AUTH] Error creating profile:", {
        error: profileError,
        message: profileError?.message,
        code: profileError?.code,
        details: profileError?.details,
      });
      return {
        error: "Account created but profile setup failed. Please contact support.",
        step: 'verify',
        email,
      };
    }
  }

  await markOtpCodeVerified(email, code);

  // Sign in with temporary password to establish session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: randomPassword,
  });

  if (signInError) {
    console.error("[AUTH SIGNUP] Sign-in after verification FAILED:", {
      error: signInError,
      message: signInError?.message,
      status: signInError?.status,
      code: signInError?.code,
      authDataUser: authData.user ? { id: authData.user.id, email: authData.user.email } : null,
    });
    return {
      error: `Account created but login failed: ${signInError?.message || "unknown error"}. Please try signing in with your email.`,
      step: 'verify',
      email,
    };
  }

  console.log("[AUTH SIGNUP] Sign-in successful:", {
    userId: signInData.user?.id,
    email: signInData.user?.email,
  });

  // Return to set-password step instead of redirecting
  return {
    step: 'set-password',
    mode: 'signup',
    email,
  };
}

/**
 * SET PASSWORD: User sets their password after signup or password reset
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
    const mode = formData.get("mode") as string;
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      step: 'set-password',
      mode: mode as 'signup' | 'reset',
      email,
    };
  }

  const { password } = parsed.data;
  const email = formData.get("email") as string;
  const mode = formData.get("mode") as string;
  const rememberMe = formData.get("rememberMe") === "on";
  const next = formData.get("next") as string | null;

  if (!email || !mode) {
    return {
      error: "Invalid request. Please try again.",
      step: 'set-password',
    };
  }

  if (mode === 'signup') {
    // Signup flow: user has an active session from verifySignupCodeAction
    try {
      const supabase = await createClient();

      // Update the password in the current session
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error("[AUTH] Error updating password (signup):", updateError);
        return {
          error: "Failed to set password. Please try again.",
          step: 'set-password',
          mode: 'signup',
          email,
        };
      }

      // Mark password as set in profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ password_set: true })
        .eq("email", email);

      if (profileError) {
        console.error("[AUTH] Error updating profile (signup):", profileError);
        return {
          error: "Password set but profile update failed. Please contact support.",
          step: 'set-password',
          mode: 'signup',
          email,
        };
      }

      // Send welcome email
      await sendWelcomeEmail(email, formData.get("displayName") as string ?? "User");

      // Session is already active from verifySignupCodeAction, just redirect
      const nextPath = next && typeof next === "string" && next.startsWith("/") ? next : "/";
      redirect(nextPath);
    } catch (error) {
      console.error("[AUTH] Error in set password (signup):", error);
      return {
        error: "An error occurred. Please try again.",
        step: 'set-password',
        mode: 'signup',
        email,
      };
    }
  } else if (mode === 'reset') {
    // Reset flow: user has no active session, need admin client
    try {
      const supabase = await createClient({ rememberMe });
      const admin = createAdminClient();

      // Look up the user by email to get their ID
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

      // Use admin client to update password
      const { error: adminError } = await admin.auth.admin.updateUserById(profile.id, {
        password,
      });

      if (adminError) {
        console.error("Error updating password via admin:", adminError);
        return {
          error: "Failed to set password. Please try again.",
          step: 'set-password',
          mode: 'reset',
          email,
        };
      }

      // Update profile to mark password as set
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ password_set: true })
        .eq("email", email);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return {
          error: "Password set but profile update failed. Please contact support.",
          step: 'set-password',
          mode: 'reset',
          email,
        };
      }

      // Sign in the user with their new password to establish session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Error signing in after password reset:", signInError);
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
      console.error("Error in set password (reset):", error);
      return {
        error: "An error occurred. Please try again.",
        step: 'set-password',
        mode: 'reset',
        email,
      };
    }
  }

  return {
    error: "Invalid mode. Please try again.",
    step: 'set-password',
  };
}

/**
 * LOGIN: Email + Password login (not OTP-based)
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
      error: parsed.error.issues[0]?.message ?? "Invalid email or password.",
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
      console.error("Login error:", signInError);
      return {
        error: "Invalid email or password.",
        step: 'email',
      };
    }

    const nextPath = next && typeof next === "string" && next.startsWith("/") ? next : "/";
    redirect(nextPath);
  } catch (error) {
    console.error("Error during login:", error);
    return {
      error: "An error occurred. Please try again.",
      step: 'email',
    };
  }
}

/**
 * FORGOT PASSWORD: Send OTP to email for password reset
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
 * VERIFY RESET CODE: User enters 6-digit code during password reset
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
 * RESEND CODE: User didn't receive code (used by both signup and password reset)
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
