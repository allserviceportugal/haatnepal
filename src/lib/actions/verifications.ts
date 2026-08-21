"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationRequestReceivedEmail } from "@/lib/services/email";
import type { SubscriptionTier } from "@/lib/supabase/types";

export type VerificationFormState = {
  error?: string;
  values?: Record<string, string>;
};

const PLAN_ORDER: SubscriptionTier[] = ["normal", "business", "plus", "pro", "premium", "custom"];

export async function submitVerificationRequestAction(
  planKey: Extract<SubscriptionTier, "plus" | "pro" | "premium">,
  _prevState: VerificationFormState,
  formData: FormData
): Promise<VerificationFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/plan");
  }

  if (!["plus", "pro", "premium"].includes(planKey)) {
    revalidatePath("/dashboard/plan");
    redirect("/dashboard/plan");
  }

  // Applicant type decides which fields are required, and is read from the
  // profile rather than the form so it cannot be spoofed by the client.
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, subscription_plans(key)")
    .eq("id", user.id)
    .single();

  const currentPlanKey = (profile as any)?.subscription_plans?.key as SubscriptionTier | null;
  const applicantType = ((profile as any)?.account_type as "individual" | "business") ?? "individual";

  if (currentPlanKey && PLAN_ORDER.indexOf(planKey) <= PLAN_ORDER.indexOf(currentPlanKey)) {
    revalidatePath("/dashboard/plan");
    redirect("/dashboard/plan");
  }

  const str = (k: string) => ((formData.get(k) as string) ?? "").trim();

  // Shared across both applicant types
  const contactPersonName = str("contactPersonName");
  const contactEmail = str("contactEmail");
  const contactPhone = str("contactPhone");
  const address = str("businessAddress");
  const panNumber = str("panNumber");
  const businessDescription = str("businessDescription");
  const documentPath = str("registrationCertificatePath");

  // Type-specific
  const businessName = str("businessName");
  const businessRegistrationNumber = str("businessRegistrationNumber");
  const citizenshipNumber = str("citizenshipNumber");

  const values = {
    contactPersonName, contactEmail, contactPhone, businessAddress: address,
    panNumber, businessName, businessRegistrationNumber, citizenshipNumber,
    businessDescription,
  };
  const fail = (error: string): VerificationFormState => ({ error, values });

  if (!contactPersonName) return fail(applicantType === "business" ? "Representative name is required." : "Full name is required.");
  if (!contactEmail) return fail("Contact email is required.");
  if (!contactPhone) return fail("Contact phone is required.");
  if (!address) return fail(applicantType === "business" ? "Business address is required." : "Address is required.");
  if (!panNumber) return fail(applicantType === "business" ? "Business PAN number is required." : "PAN number is required.");

  if (!businessDescription) return fail("A description is required — it appears on your public profile.");
  if (businessDescription.length > 2000) return fail("Description must be 2000 characters or fewer.");

  if (applicantType === "business") {
    if (!businessName) return fail("Business name is required.");
    if (!businessRegistrationNumber) return fail("Business registration certificate number is required.");
  } else {
    if (!citizenshipNumber) return fail("Citizenship card number is required.");
  }

  if (!documentPath) {
    return fail(
      applicantType === "business"
        ? "Please upload your business registration certificate."
        : "Please upload a copy of your citizenship card or PAN card."
    );
  }

  const { error } = await supabase.from("business_verification_requests").insert({
    user_id: user.id,
    requested_plan_key: planKey,
    applicant_type: applicantType,
    business_name: applicantType === "business" ? businessName : null,
    business_registration_number: applicantType === "business" ? businessRegistrationNumber : null,
    citizenship_number: applicantType === "individual" ? citizenshipNumber : null,
    pan_number: panNumber,
    contact_person_name: contactPersonName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    business_address: address,
    business_description: businessDescription,
    registration_certificate_path: documentPath,
    status: "pending",
  });

  if (error) {
    console.error("[VERIFICATION] Insert failed:", error.message);
    return fail("We couldn't submit your request. Please try again.");
  }

  // Mirror onto the profile so it is live on /u/[userId] immediately. This column
  // is already user-editable from the dashboard profile form, so this is not a
  // privilege escalation; a failure here must not lose the submitted application.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ business_description: businessDescription })
    .eq("id", user.id);

  if (profileError) {
    console.error("[VERIFICATION] Profile description update failed:", profileError.message);
  }

  try {
    await sendVerificationRequestReceivedEmail(
      applicantType === "business" ? businessName : contactPersonName,
      contactPersonName,
      contactEmail,
      contactPhone,
      planKey
    );
  } catch (emailError) {
    console.error("[VERIFICATION] Notification email failed:", emailError);
  }

  revalidatePath("/dashboard/plan");
  redirect("/dashboard/plan?submitted=1");
}
