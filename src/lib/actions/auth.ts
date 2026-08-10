"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { signUpSchema, verifyCodeSchema, signInSchema } from "@/lib/validations/auth";
import { createOtpCode, verifyOtpCode } from "@/lib/utils/otp";
import { sendOtpEmail, sendWelcomeEmail } from "@/lib/services/email";

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

  // Generate and store 6-digit OTP code
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

  // Send OTP email with haatnepal branding
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
 * VERIFY CODE: User enters 6-digit code from email
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

  // Verify the OTP code
  const { valid, metadata, error } = await verifyOtpCode(email, code);

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

  // Create Supabase user
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: Math.random().toString(36).slice(-20), // Random password (user will use OTP to login)
    options: {
      data: {
        display_name: metadata.display_name,
        phone: metadata.phone,
        account_type: metadata.account_type,
      },
    },
  });

  if (authError || !authData.user) {
    console.error("Error creating auth user:", authError);
    return {
      error: "Failed to create account. Please try again.",
      step: 'verify',
      email,
    };
  }

  // Get or create profile
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

  // Send welcome email
  await sendWelcomeEmail(email, metadata.display_name);

  // Sign in the user
  await supabase.auth.signInWithPassword({
    email,
    password: authData.user.user_metadata?.password || "",
  });

  const nextPath = formData.get("next");
  redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/");
}

/**
 * LOGIN: Send OTP code to existing user
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
  const { email } = parsed.data;

  // Check if user exists
  const { data: user } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!user) {
    return {
      error: "No account found with this email. Please sign up first.",
      step: 'email',
    };
  }

  // Generate and send OTP code for login
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

  // Send OTP email
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

  // Generate new OTP code
  const { code, error: otpError } = await createOtpCode(email, {
    display_name: "",
    phone: "",
    account_type: "individual",
  });

  if (otpError || !code) {
    return { error: "Failed to generate verification code", email };
  }

  // Send OTP email
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
