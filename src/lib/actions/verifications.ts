"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationRequestReceivedEmail } from "@/lib/services/email";
import type { SubscriptionTier } from "@/lib/supabase/types";

export async function submitVerificationRequestAction(
  planKey: Extract<SubscriptionTier, "plus" | "pro" | "premium">,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/plan");
  }

  // Validate planKey is one of the verification-gated tiers
  if (!["plus", "pro", "premium"].includes(planKey)) {
    revalidatePath("/dashboard/plan");
    redirect("/dashboard/plan");
  }

  // Get current plan to ensure user doesn't already have this tier or higher
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plans(key)")
    .eq("id", user.id)
    .single();

  const currentPlanKey = (profile as any)?.subscription_plans?.key as SubscriptionTier | null;

  // If user already has equal or higher plan, redirect
  if (currentPlanKey) {
    const PLAN_ORDER: SubscriptionTier[] = ["normal", "business", "plus", "pro", "premium", "custom"];
    if (PLAN_ORDER.indexOf(planKey) <= PLAN_ORDER.indexOf(currentPlanKey)) {
      revalidatePath("/dashboard/plan");
      redirect("/dashboard/plan");
    }
  }

  // Extract form fields
  const businessName = formData.get("businessName") as string;
  const contactPersonName = formData.get("contactPersonName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const businessAddress = formData.get("businessAddress") as string;
  const registrationCertificatePath = formData.get("registrationCertificatePath") as string;

  // Validate required fields
  if (!businessName || !contactPersonName || !contactEmail || !contactPhone || !businessAddress || !registrationCertificatePath) {
    throw new Error("All fields are required");
  }

  // Insert the verification request
  const { error } = await supabase
    .from("business_verification_requests")
    .insert({
      user_id: user.id,
      requested_plan_key: planKey,
      business_name: businessName,
      contact_person_name: contactPersonName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      business_address: businessAddress,
      registration_certificate_path: registrationCertificatePath,
      status: "pending",
    });

  if (error) {
    throw error;
  }

  try {
    await sendVerificationRequestReceivedEmail(
      businessName,
      contactPersonName,
      contactEmail,
      contactPhone,
      planKey
    );
  } catch (emailError) {
    console.error("Failed to send verification request notification email:", emailError);
  }

  revalidatePath("/dashboard/plan");
  redirect("/dashboard/plan");
}
