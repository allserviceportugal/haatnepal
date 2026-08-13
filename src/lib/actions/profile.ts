"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";

export type ProfileActionState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    district: formData.get("district"),
    city: formData.get("city"),
    businessDescription: formData.get("businessDescription"),
    logoUrl: formData.get("logoUrl"),
    coverImageUrl: formData.get("coverImageUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  // Check if phone number is already used by another user
  const { data: existingPhone } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", parsed.data.phone)
    .neq("id", user.id)
    .single();

  if (existingPhone) {
    return { error: "This phone number is already registered to another account. Please use a different number." };
  }

  // Re-check the storefront-branding entitlement server-side (not just in
  // the UI) so the restriction can't be bypassed by posting the form
  // directly — mirrors featureListingAction's plan-lookup pattern.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("subscription_plans(allows_storefront_branding)")
    .eq("id", user.id)
    .single();
  const plan = (
    profileRow as unknown as { subscription_plans: { allows_storefront_branding: boolean } | null } | null
  )?.subscription_plans;
  const canBrand = plan?.allows_storefront_branding ?? false;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      phone: parsed.data.phone,
      district: parsed.data.district || null,
      city: parsed.data.city || null,
      ...(canBrand
        ? {
            business_description: parsed.data.businessDescription || null,
            logo_url: parsed.data.logoUrl || null,
            cover_image_url: parsed.data.coverImageUrl || null,
          }
        : {}),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
