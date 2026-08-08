"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validations/listing";

export type ListingActionState = { error?: string };

function parseListingForm(formData: FormData) {
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    listingType: formData.get("listingType"),
    district: formData.get("district"),
    city: formData.get("city"),
  });
}

function startOfCurrentMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

async function checkListingQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan_id, subscription_plans(name, monthly_listing_quota)")
    .eq("id", userId)
    .single();

  const plan = (
    profile as unknown as { subscription_plans: { name: string; monthly_listing_quota: number | null } | null } | null
  )?.subscription_plans;

  if (!plan || plan.monthly_listing_quota === null) {
    return null; // unlimited (or no plan resolved — fail open rather than block posting)
  }

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .gte("created_at", startOfCurrentMonthISO());

  if ((count ?? 0) >= plan.monthly_listing_quota) {
    return `You've used all ${plan.monthly_listing_quota} of your free listings this month on the ${plan.name} plan. Upgrade on the Plan page for more.`;
  }

  return null;
}

async function saveAttributeValues(supabase: SupabaseClient, listingId: string, formData: FormData) {
  await supabase.from("listing_attribute_values").delete().eq("listing_id", listingId);

  const values = Array.from(formData.entries())
    .filter(([key, value]) => key.startsWith("attr_") && typeof value === "string" && value.trim() !== "")
    .map(([key, value]) => ({
      listing_id: listingId,
      attribute_id: key.slice("attr_".length),
      value: String(value).trim(),
    }));

  if (values.length > 0) {
    await supabase.from("listing_attribute_values").insert(values);
  }
}

async function saveDeliveryOptions(supabase: SupabaseClient, listingId: string, formData: FormData) {
  await supabase.from("listing_delivery_options").delete().eq("listing_id", listingId);

  const courierIds = formData
    .getAll("courierIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (courierIds.length > 0) {
    await supabase
      .from("listing_delivery_options")
      .insert(courierIds.map((courierId) => ({ listing_id: listingId, courier_id: courierId })));
  }
}

export async function createListingAction(
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to post a listing." };
  }

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const quotaError = await checkListingQuota(supabase, user.id);
  if (quotaError) {
    return { error: quotaError };
  }

  const { title, description, price, categoryId, condition, listingType, district, city } =
    parsed.data;
  const pickupAvailable = formData.get("pickupAvailable") === "on";

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      category_id: categoryId,
      title,
      description,
      price,
      condition,
      listing_type: listingType,
      district,
      city: city || null,
      pickup_available: pickupAvailable,
    })
    .select("id")
    .single();

  if (error || !listing) {
    return { error: error?.message ?? "Could not create the listing." };
  }

  const imageUrls = formData
    .getAll("imageUrls")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (imageUrls.length > 0) {
    await supabase
      .from("listing_images")
      .insert(imageUrls.map((url, index) => ({ listing_id: listing.id, url, sort_order: index })));
  }

  await saveAttributeValues(supabase, listing.id, formData);
  await saveDeliveryOptions(supabase, listing.id, formData);

  revalidatePath("/");
  redirect(`/listing/${listing.id}`);
}

export async function updateListingAction(
  listingId: string,
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { title, description, price, categoryId, condition, listingType, district, city } =
    parsed.data;
  const pickupAvailable = formData.get("pickupAvailable") === "on";

  const { error } = await supabase
    .from("listings")
    .update({
      title,
      description,
      price,
      category_id: categoryId,
      condition,
      listing_type: listingType,
      district,
      city: city || null,
      pickup_available: pickupAvailable,
    })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  await saveAttributeValues(supabase, listingId, formData);
  await saveDeliveryOptions(supabase, listingId, formData);

  revalidatePath(`/listing/${listingId}`);
  redirect(`/listing/${listingId}`);
}

export async function deleteListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("listings").delete().eq("id", listingId).eq("seller_id", user.id);

  revalidatePath("/dashboard/listings");
  redirect("/dashboard/listings");
}

export async function markListingSoldAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  revalidatePath(`/listing/${listingId}`);
  revalidatePath("/dashboard/listings");
}
