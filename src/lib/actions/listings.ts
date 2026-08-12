"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validations/listing";
import { isDescendantOfSlug } from "@/lib/queries/listings";

export type ListingActionState = { error?: string; formValues?: Record<string, string | string[]> };

function formDataToPlainObject(formData: FormData): Record<string, string | string[]> {
  const obj: Record<string, string | string[]> = {};
  const keys = new Set<string>();
  for (const [key, value] of formData.entries()) {
    keys.add(key);
    if (key === "courierIds" || key === "listingImages") {
      if (Array.isArray(obj[key])) {
        (obj[key] as string[]).push(String(value));
      } else {
        obj[key] = [String(value)];
      }
    } else {
      obj[key] = String(value);
    }
  }
  return obj;
}

function parseListingForm(formData: FormData) {
  const priceOnRequest = formData.get("priceOnRequest") === "on";
  const price = priceOnRequest ? "0" : formData.get("price");

  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price,
    priceOnRequest,
    categoryId: formData.get("categoryId"),
    condition: formData.get("condition"),
    listingType: formData.get("listingType"),
    district: formData.get("district"),
    city: formData.get("city") ?? "",
    municipality: formData.get("municipality") ?? "",
    ward_number: formData.get("ward_number") ?? "",
    tole: formData.get("tole") ?? "",
    land_unit_system: formData.get("land_unit_system") ?? "",
    land_ropani: formData.get("land_ropani") ?? "",
    land_aana: formData.get("land_aana") ?? "",
    land_paisa: formData.get("land_paisa") ?? "",
    land_daam: formData.get("land_daam") ?? "",
    land_bigha: formData.get("land_bigha") ?? "",
    land_kattha: formData.get("land_kattha") ?? "",
    land_dhur: formData.get("land_dhur") ?? "",
    land_area_sqft: formData.get("land_area_sqft") ?? "",
    company_name: formData.get("company_name") ?? "",
    salary_min: formData.get("salary_min") ?? "",
    salary_max: formData.get("salary_max") ?? "",
    salary_period: formData.get("salary_period") ?? "",
    salary_negotiable: formData.get("salary_negotiable") === "on",
    vacancies_count: formData.get("vacancies_count") ?? "",
    application_deadline: formData.get("application_deadline") ?? "",
    external_apply_url: formData.get("external_apply_url") ?? "",
    registrationYear: formData.get("registrationYear") ?? "",
    manufacturingYear: formData.get("manufacturingYear") ?? "",
    bluebookStatus: formData.get("bluebookStatus") ?? "",
    importStatus: formData.get("importStatus") ?? "",
    ownerCount: formData.get("ownerCount") ?? "",
    isModified: formData.get("isModified") === "on",
    accidentHistory: formData.get("accidentHistory") === "on",
    serviceHistory: formData.get("serviceHistory") ?? "",
    foodFreshness: formData.get("foodFreshness") ?? "",
    bestBeforeDate: formData.get("bestBeforeDate") ?? "",
    manufacturingDate: formData.get("manufacturingDate") ?? "",
    ingredients: formData.get("ingredients") ?? "",
    storageInstructions: formData.get("storageInstructions") ?? "",
    allergenInfo: formData.get("allergenInfo") ?? "",
    harvestDate: formData.get("harvestDate") ?? "",
    unitOfSale: formData.get("unitOfSale") ?? "",
    minOrderQuantity: formData.get("minOrderQuantity") ?? "",
    farmLocation: formData.get("farmLocation") ?? "",
    forRent: formData.get("forRent") === "on",
    rentalRatePeriod: formData.get("rentalRatePeriod") ?? "",
  });
}

function startOfCurrentMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

async function checkListingQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<{ error: string | null; listing_duration_days: number | null }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan_id, subscription_plans(name, monthly_listing_quota, listing_duration_days)")
    .eq("id", userId)
    .single();

  const plan = (
    profile as unknown as { subscription_plans: { name: string; monthly_listing_quota: number | null; listing_duration_days: number | null } | null } | null
  )?.subscription_plans;

  if (!plan || plan.monthly_listing_quota === null) {
    return { error: null, listing_duration_days: plan?.listing_duration_days ?? null }; // unlimited (or no plan resolved — fail open rather than block posting)
  }

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .gte("created_at", startOfCurrentMonthISO());

  if ((count ?? 0) >= plan.monthly_listing_quota) {
    return {
      error: `You've used all ${plan.monthly_listing_quota} of your free listings this month on the ${plan.name} plan. Upgrade on the Plan page for more.`,
      listing_duration_days: plan.listing_duration_days,
    };
  }

  return { error: null, listing_duration_days: plan.listing_duration_days };
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
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      formValues: formDataToPlainObject(formData),
    };
  }

  const quotaCheckResult = await checkListingQuota(supabase, user.id);
  if (quotaCheckResult.error) {
    return { error: quotaCheckResult.error };
  }

  const { title, description, price, priceOnRequest, categoryId, condition, listingType, district, city, municipality, ward_number, tole, land_unit_system, land_ropani, land_aana, land_paisa, land_daam, land_bigha, land_kattha, land_dhur, land_area_sqft, company_name, salary_min, salary_max, salary_period, salary_negotiable, vacancies_count, application_deadline, external_apply_url, registrationYear, manufacturingYear, bluebookStatus, importStatus, ownerCount, isModified, accidentHistory, serviceHistory, foodFreshness, bestBeforeDate, manufacturingDate, ingredients, storageInstructions, allergenInfo, harvestDate, unitOfSale, minOrderQuantity, farmLocation, forRent, rentalRatePeriod } =
    parsed.data;
  const pickupAvailable = formData.get("pickupAvailable") === "on";

  // Compute expires_at based on listing_duration_days from the subscription plan
  const now = new Date();
  const durationDays = quotaCheckResult.listing_duration_days ?? 60; // Default to 60 if not set
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  // Compute is_agriculture by checking if categoryId is a descendant of "agriculture"
  const isAgricultureListing = await isDescendantOfSlug(supabase, categoryId, "agriculture");

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
      municipality: municipality || null,
      ward_number: ward_number ? parseInt(String(ward_number), 10) : null,
      tole: tole || null,
      land_unit_system: land_unit_system || null,
      land_ropani: land_ropani ? parseInt(String(land_ropani), 10) : null,
      land_aana: land_aana ? parseInt(String(land_aana), 10) : null,
      land_paisa: land_paisa ? parseInt(String(land_paisa), 10) : null,
      land_daam: land_daam ? parseInt(String(land_daam), 10) : null,
      land_bigha: land_bigha ? parseInt(String(land_bigha), 10) : null,
      land_kattha: land_kattha ? parseInt(String(land_kattha), 10) : null,
      land_dhur: land_dhur ? parseInt(String(land_dhur), 10) : null,
      land_area_sqft: land_area_sqft ? parseFloat(String(land_area_sqft)) : null,
      company_name: company_name || null,
      salary_min: salary_min ? parseFloat(String(salary_min)) : null,
      salary_max: salary_max ? parseFloat(String(salary_max)) : null,
      salary_period: salary_period || null,
      salary_negotiable: salary_negotiable,
      vacancies_count: vacancies_count ? parseInt(String(vacancies_count), 10) : null,
      application_deadline: application_deadline || null,
      external_apply_url: external_apply_url || null,
      registration_year: registrationYear ? parseInt(String(registrationYear), 10) : null,
      manufacturing_year: manufacturingYear ? parseInt(String(manufacturingYear), 10) : null,
      bluebook_status: bluebookStatus || null,
      import_status: importStatus || null,
      owner_count: ownerCount ? parseInt(String(ownerCount), 10) : null,
      is_modified: isModified,
      accident_history: accidentHistory,
      service_history: serviceHistory || null,
      food_freshness: foodFreshness || null,
      best_before_date: bestBeforeDate || null,
      manufacturing_date: manufacturingDate || null,
      ingredients: ingredients || null,
      storage_instructions: storageInstructions || null,
      allergen_info: allergenInfo || null,
      is_food: foodFreshness ? true : false,
      is_agriculture: isAgricultureListing,
      harvest_date: harvestDate || null,
      unit_of_sale: unitOfSale || null,
      min_order_quantity: minOrderQuantity ? parseFloat(String(minOrderQuantity)) : null,
      farm_location: farmLocation || null,
      for_rent: forRent,
      rental_rate_period: rentalRatePeriod || null,
      price_on_request: priceOnRequest,
      expires_at: expiresAt,
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
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      formValues: formDataToPlainObject(formData),
    };
  }

  // Check 15-minute edit window
  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("created_at, seller_id")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .single();

  if (fetchError || !listing) {
    return { error: "Listing not found or you don't have permission to edit it." };
  }

  const { isWithinEditWindow } = await import("@/lib/format");
  if (!isWithinEditWindow(listing.created_at)) {
    return { error: "You can only edit a listing within 15 minutes of posting. To change this listing, please mark it as Sold and create a new one." };
  }

  const { title, description, price, priceOnRequest, categoryId, condition, listingType, district, city, municipality, ward_number, tole, land_unit_system, land_ropani, land_aana, land_paisa, land_daam, land_bigha, land_kattha, land_dhur, land_area_sqft, company_name, salary_min, salary_max, salary_period, salary_negotiable, vacancies_count, application_deadline, external_apply_url, foodFreshness, bestBeforeDate, manufacturingDate, ingredients, storageInstructions, allergenInfo, harvestDate, unitOfSale, minOrderQuantity, farmLocation, forRent, rentalRatePeriod } =
    parsed.data;
  const pickupAvailable = formData.get("pickupAvailable") === "on";

  // Compute is_agriculture for update
  const isAgricultureListing = await isDescendantOfSlug(supabase, categoryId, "agriculture");

  const { error } = await supabase
    .from("listings")
    .update({
      title,
      description,
      price,
      price_on_request: priceOnRequest,
      category_id: categoryId,
      condition,
      listing_type: listingType,
      district,
      city: city || null,
      pickup_available: pickupAvailable,
      municipality: municipality || null,
      ward_number: ward_number ? parseInt(String(ward_number), 10) : null,
      tole: tole || null,
      land_unit_system: land_unit_system || null,
      land_ropani: land_ropani ? parseInt(String(land_ropani), 10) : null,
      land_aana: land_aana ? parseInt(String(land_aana), 10) : null,
      land_paisa: land_paisa ? parseInt(String(land_paisa), 10) : null,
      land_daam: land_daam ? parseInt(String(land_daam), 10) : null,
      land_bigha: land_bigha ? parseInt(String(land_bigha), 10) : null,
      land_kattha: land_kattha ? parseInt(String(land_kattha), 10) : null,
      land_dhur: land_dhur ? parseInt(String(land_dhur), 10) : null,
      land_area_sqft: land_area_sqft ? parseFloat(String(land_area_sqft)) : null,
      company_name: company_name || null,
      salary_min: salary_min ? parseFloat(String(salary_min)) : null,
      salary_max: salary_max ? parseFloat(String(salary_max)) : null,
      salary_period: salary_period || null,
      salary_negotiable: salary_negotiable,
      vacancies_count: vacancies_count ? parseInt(String(vacancies_count), 10) : null,
      application_deadline: application_deadline || null,
      external_apply_url: external_apply_url || null,
      food_freshness: foodFreshness || null,
      best_before_date: bestBeforeDate || null,
      manufacturing_date: manufacturingDate || null,
      ingredients: ingredients || null,
      storage_instructions: storageInstructions || null,
      allergen_info: allergenInfo || null,
      is_agriculture: isAgricultureListing,
      harvest_date: harvestDate || null,
      unit_of_sale: unitOfSale || null,
      min_order_quantity: minOrderQuantity ? parseFloat(String(minOrderQuantity)) : null,
      farm_location: farmLocation || null,
      for_rent: forRent,
      rental_rate_period: rentalRatePeriod || null,
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

export type FeatureListingState = { error?: string };

export async function featureListingAction(
  listingId: string,
  _prevState: FeatureListingState,
  _formData: FormData
): Promise<FeatureListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .eq("seller_id", user.id)
    .single();

  if (!listing) {
    return { error: "Listing not found." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plans(name, monthly_featured_quota)")
    .eq("id", user.id)
    .single();

  const plan = (
    profile as unknown as { subscription_plans: { name: string; monthly_featured_quota: number | null } | null } | null
  )?.subscription_plans;

  if (!plan || plan.monthly_featured_quota === 0) {
    return { error: "Your plan doesn't include featured listings. Upgrade to Plus or higher on the Plan page." };
  }

  if (plan.monthly_featured_quota !== null) {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .gte("featured_at", startOfCurrentMonthISO());

    if ((count ?? 0) >= plan.monthly_featured_quota) {
      return {
        error: `You've used all ${plan.monthly_featured_quota} featured listings this month on the ${plan.name} plan. Upgrade for more.`,
      };
    }
  }

  const featuredAt = new Date();
  const featuredUntil = new Date(featuredAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  await supabase
    .from("listings")
    .update({ featured_at: featuredAt.toISOString(), featured_until: featuredUntil.toISOString() })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  revalidatePath(`/listing/${listingId}`);
  revalidatePath("/dashboard/listings");

  return {};
}
