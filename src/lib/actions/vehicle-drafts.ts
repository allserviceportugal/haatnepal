"use server";

import { createClient } from "@/lib/supabase/server";
import type { DraftListing, DraftStatus } from "@/lib/supabase/types";

export type DraftActionState = {
  error?: string;
  draftId?: string;
  success?: boolean;
};

/**
 * Auto-save draft to database.
 * Called frequently as user types.
 */
export async function autoSaveDraftAction(
  _prevState: DraftActionState,
  formData: FormData
): Promise<DraftActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be signed in to save a draft." };
    }

    const draftId = formData.get("draftId") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") ? Number(formData.get("price")) : null;
    const categoryId = formData.get("categoryId") as string | null;
    const condition = formData.get("condition") as string | null;
    const listingType = formData.get("listingType") as string | null;
    const district = formData.get("district") as string | null;
    const city = formData.get("city") as string | null;
    const municipality = formData.get("municipality") as string | null;
    const wardNumber = formData.get("wardNumber") ? Number(formData.get("wardNumber")) : null;
    const tole = formData.get("tole") as string | null;
    const bluebookStatus = formData.get("bluebookStatus") as string | null;
    const registrationYear = formData.get("registrationYear")
      ? Number(formData.get("registrationYear"))
      : null;
    const manufacturingYear = formData.get("manufacturingYear")
      ? Number(formData.get("manufacturingYear"))
      : null;
    const importStatus = formData.get("importStatus") as string | null;
    const ownerCount = formData.get("ownerCount") ? Number(formData.get("ownerCount")) : null;
    const isModified = formData.get("isModified") === "on";
    const accidentHistory = formData.get("accidentHistory") === "on";
    const serviceHistory = formData.get("serviceHistory") as string | null;

    // Extract category path
    const categoryPath = formData.get("categoryPath") as string | null;
    const parsedCategoryPath = categoryPath ? JSON.parse(categoryPath) : null;

    // Extract attribute values
    const attributeValues: Record<string, string> = {};
    const entries = formData.entries();
    for (const [key, value] of entries) {
      if (key.startsWith("attr_") && typeof value === "string" && value.trim() !== "") {
        const attrKey = key.slice("attr_".length);
        attributeValues[attrKey] = value.trim();
      }
    }

    // Extract courier IDs
    const courierIds = formData.getAll("courierIds").filter((v) => typeof v === "string" && v.length > 0) as string[];

    // Extract image URLs
    const imageUrls = formData.getAll("imageUrls").filter((v) => typeof v === "string" && v.length > 0) as string[];

    const draftData: Partial<DraftListing> = {
      seller_id: user.id,
      title: title?.trim() || null,
      description: description?.trim() || null,
      price,
      category_id: categoryId || null,
      condition: condition || null,
      listing_type: listingType || null,
      district: district || null,
      city: city?.trim() || null,
      municipality: municipality?.trim() || null,
      ward_number: wardNumber,
      tole: tole?.trim() || null,
      bluebook_status: bluebookStatus || null,
      registration_year: registrationYear,
      manufacturing_year: manufacturingYear,
      import_status: importStatus || null,
      owner_count: ownerCount,
      is_modified: isModified,
      accident_history: accidentHistory,
      service_history: serviceHistory?.trim() || null,
      category_path: parsedCategoryPath,
      attribute_values: attributeValues,
      courier_ids: courierIds.length > 0 ? courierIds : null,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      status: "auto-saved" as DraftStatus,
    };

    if (draftId && draftId !== "new") {
      // Update existing draft
      const { error } = await supabase
        .from("draft_listings")
        .update(draftData)
        .eq("id", draftId)
        .eq("seller_id", user.id);

      if (error) {
        return { error: `Failed to save draft: ${error.message}` };
      }

      return { success: true, draftId };
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from("draft_listings")
        .insert([draftData])
        .select("id")
        .single();

      if (error) {
        return { error: `Failed to create draft: ${error.message}` };
      }

      return { success: true, draftId: data.id };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to save draft: ${message}` };
  }
}

/**
 * Load draft from database by ID.
 */
export async function loadDraftAction(draftId: string): Promise<DraftListing | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("draft_listings")
      .select("*")
      .eq("id", draftId)
      .eq("seller_id", user.id)
      .single();

    if (error || !data) return null;

    return data as DraftListing;
  } catch {
    return null;
  }
}

/**
 * Delete a draft.
 */
export async function deleteDraftAction(draftId: string): Promise<DraftActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be signed in." };
    }

    const { error } = await supabase
      .from("draft_listings")
      .delete()
      .eq("id", draftId)
      .eq("seller_id", user.id);

    if (error) {
      return { error: `Failed to delete draft: ${error.message}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to delete draft: ${message}` };
  }
}

/**
 * Get all drafts for current user.
 */
export async function getUserDraftsAction(): Promise<DraftListing[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("draft_listings")
      .select("*")
      .eq("seller_id", user.id)
      .order("updated_at", { ascending: false });

    if (error || !data) return [];

    return data as DraftListing[];
  } catch {
    return [];
  }
}

/**
 * Convert draft to listing (when user submits).
 */
export async function convertDraftToListingAction(
  draftId: string,
  finalListingData: Record<string, any>
): Promise<{ error?: string; listingId?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be signed in." };
    }

    // Load the draft
    const { data: draft, error: draftError } = await supabase
      .from("draft_listings")
      .select("*")
      .eq("id", draftId)
      .eq("seller_id", user.id)
      .single();

    if (draftError || !draft) {
      return { error: "Draft not found." };
    }

    // Merge draft data with final data, final data takes precedence
    const mergedData = { ...draft, ...finalListingData };

    // Delete the draft
    await supabase.from("draft_listings").delete().eq("id", draftId);

    return { listingId: draftId }; // Return draft ID as signal it was processed
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to convert draft: ${message}` };
  }
}
