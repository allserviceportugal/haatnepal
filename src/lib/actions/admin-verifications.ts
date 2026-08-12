"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendVerificationApprovedEmail, sendVerificationRejectedEmail } from "@/lib/services/email";

export async function approveVerificationRequestAction(requestId: string) {
  const { supabase: adminSupabase } = await requireAdmin();

  // Fetch the verification request
  const { data: request, error: fetchError } = await adminSupabase
    .from("business_verification_requests")
    .select("*, profiles(id, display_name, email)")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    throw new Error("Verification request not found");
  }

  // Look up the plan id for the requested plan key
  const { data: plan, error: planError } = await adminSupabase
    .from("subscription_plans")
    .select("id, name")
    .eq("key", request.requested_plan_key)
    .single();

  if (planError || !plan) {
    throw new Error("Plan not found");
  }

  // Get the current user for reviewed_by
  const {
    data: { user },
  } = await adminSupabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Update the verification request
  const { error: updateError } = await adminSupabase
    .from("business_verification_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) throw updateError;

  // Update the user's subscription plan
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({ subscription_plan_id: plan.id })
    .eq("id", request.user_id);

  if (profileError) throw profileError;

  // Send approval email
  try {
    await sendVerificationApprovedEmail(
      request.profiles?.email || request.contact_email,
      request.profiles?.display_name || request.contact_person_name,
      plan.name
    );
  } catch (emailError) {
    console.error("Failed to send approval email:", emailError);
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/dashboard/plan");
}

export async function rejectVerificationRequestAction(requestId: string, reason: string) {
  const { supabase: adminSupabase } = await requireAdmin();

  if (!reason || reason.trim().length === 0) {
    throw new Error("Rejection reason is required");
  }

  // Fetch the verification request
  const { data: request, error: fetchError } = await adminSupabase
    .from("business_verification_requests")
    .select("*, profiles(id, display_name, email)")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    throw new Error("Verification request not found");
  }

  // Look up plan name
  const { data: plan, error: planError } = await adminSupabase
    .from("subscription_plans")
    .select("name")
    .eq("key", request.requested_plan_key)
    .single();

  if (planError || !plan) {
    throw new Error("Plan not found");
  }

  // Get the current user for reviewed_by
  const {
    data: { user },
  } = await adminSupabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Update the verification request
  const { error: updateError } = await adminSupabase
    .from("business_verification_requests")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) throw updateError;

  // Send rejection email
  try {
    await sendVerificationRejectedEmail(
      request.profiles?.email || request.contact_email,
      request.profiles?.display_name || request.contact_person_name,
      plan.name,
      reason
    );
  } catch (emailError) {
    console.error("Failed to send rejection email:", emailError);
  }

  revalidatePath("/admin/verifications");
}
