"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

export type AuthActionState = {
  error?: string;
  needsEmailConfirmation?: boolean;
};

const NOT_CONFIGURED_ERROR =
  "Supabase isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";

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
    password: formData.get("password"),
    accountType: formData.get("accountType"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { displayName, email, phone, password, accountType } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, phone, account_type: accountType },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return { needsEmailConfirmation: true };
  }

  const nextPath = formData.get("next");
  redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: NOT_CONFIGURED_ERROR };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const nextPath = formData.get("next");
  redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
