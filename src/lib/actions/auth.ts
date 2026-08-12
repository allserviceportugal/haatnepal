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
import { sendWelcomeEmail } from "@/lib/services/email";
import { isDisposableEmail } from "@/lib/utils/spam-protection";

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
    planKey?: string;
    acceptTerms?: string;
    subscribeNewsletter?: string;
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

  // If Pro is selected and user is individual, convert to business
  if (planKey === 'pro' && accountType !== 'business') {
    accountType = 'business';
  }

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
    email_confirmed: true,
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

  console.log("[SIGNUP] Profile created, sending welcome email with credentials...");

  // Send welcome email with credentials via Resend
  const emailResult = await sendWelcomeEmail(email, displayName, password);

  if (!emailResult.success) {
    console.error("[SIGNUP] Email sending failed:", emailResult.error);
    return {
      error: `Failed to send welcome email: ${emailResult.error}`,
      step: 'email',
    };
  }

  console.log("[SIGNUP] Account created, email confirmed, and welcome email sent");

  // Sign in the new user immediately
  try {
    const supabase = await createClient();
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("[SIGNUP] User signed in automatically");
  } catch (error) {
    console.error("[SIGNUP] Auto-signin failed:", error);
  }

  // Return success state - client will handle redirect with message
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
