import type { DraftListing } from "@/lib/supabase/types";

const DRAFT_STORAGE_KEY = "haatnepal_vehicle_draft";
const DRAFT_VERSION = "1";

export type StoredDraft = Omit<DraftListing, "created_at" | "updated_at" | "expires_at"> & {
  clientSavedAt: number;
};

/**
 * Save draft to localStorage for offline persistence.
 * Auto-save is done frequently while user types.
 */
export function saveDraftToLocalStorage(draft: Partial<DraftListing>): void {
  const stored: StoredDraft = {
    id: draft.id || "",
    seller_id: draft.seller_id || "",
    title: draft.title || null,
    description: draft.description || null,
    price: draft.price || null,
    category_id: draft.category_id || null,
    condition: draft.condition || null,
    listing_type: draft.listing_type || null,
    district: draft.district || null,
    city: draft.city || null,
    municipality: draft.municipality || null,
    ward_number: draft.ward_number || null,
    tole: draft.tole || null,
    bluebook_status: draft.bluebook_status || null,
    registration_year: draft.registration_year || null,
    manufacturing_year: draft.manufacturing_year || null,
    import_status: draft.import_status || null,
    owner_count: draft.owner_count || null,
    is_modified: draft.is_modified || false,
    accident_history: draft.accident_history || false,
    service_history: draft.service_history || null,
    food_freshness: draft.food_freshness || null,
    best_before_date: draft.best_before_date || null,
    manufacturing_date: draft.manufacturing_date || null,
    ingredients: draft.ingredients || null,
    storage_instructions: draft.storage_instructions || null,
    allergen_info: draft.allergen_info || null,
    category_path: draft.category_path || null,
    attribute_values: draft.attribute_values || {},
    courier_ids: draft.courier_ids || null,
    image_urls: draft.image_urls || null,
    status: draft.status || "auto-saved",
    clientSavedAt: Date.now(),
  };

  try {
    const data = JSON.stringify({ version: DRAFT_VERSION, data: stored });
    localStorage.setItem(DRAFT_STORAGE_KEY, data);
  } catch (error) {
    // localStorage quota exceeded, silently fail
    console.warn("Failed to save draft to localStorage:", error);
  }
}

/**
 * Load draft from localStorage.
 */
export function loadDraftFromLocalStorage(): StoredDraft | null {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (parsed.version !== DRAFT_VERSION) return null;

    // Check if draft is still "fresh" (within 30 days)
    const draft = parsed.data as StoredDraft;
    const ageMs = Date.now() - draft.clientSavedAt;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (ageMs > thirtyDaysMs) {
      clearDraftFromLocalStorage();
      return null;
    }

    return draft;
  } catch (error) {
    return null;
  }
}

/**
 * Clear draft from localStorage.
 */
export function clearDraftFromLocalStorage(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear draft from localStorage:", error);
  }
}

/**
 * Check if a draft exists in localStorage.
 */
export function hasDraftInLocalStorage(): boolean {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.version === DRAFT_VERSION && parsed.data !== null;
  } catch {
    return false;
  }
}
