import type { SupabaseClient } from "@supabase/supabase-js";

export type TransactionConfig = {
  default_transaction_mode: 'classified' | 'direct_purchase' | 'hybrid';
  allow_contact: boolean;
  allow_message: boolean;
  allow_offer: boolean;
  allow_cart: boolean;
  allow_checkout: boolean;
  allow_phone_call: boolean;
  hide_contact_from_anonymous: boolean;
  track_leads: boolean;
};

/**
 * Get effective transaction config for a listing
 * Hierarchy: listing config > seller config > category config
 */
export async function getListingTransactionConfig(
  supabase: SupabaseClient,
  listingId: string,
  currentUserId?: string
): Promise<TransactionConfig | null> {
  // Get listing with category and seller info
  const { data: listing } = await supabase
    .from("listings")
    .select("id, category_id, seller_id, transaction_mode, allow_offers, allow_checkout, allow_contact, allow_messaging")
    .eq("id", listingId)
    .single();

  if (!listing) return null;

  // Start with category config
  let config = await getCategoryTransactionConfig(supabase, listing.category_id);
  if (!config) return null;

  // Override with seller config if exists
  const sellerConfig = await getSellerTransactionConfig(
    supabase,
    listing.seller_id,
    listing.category_id
  );
  if (sellerConfig) {
    config = { ...config, ...sellerConfig };
  }

  // Override with listing config if not 'default'
  if (listing.transaction_mode && listing.transaction_mode !== 'default') {
    if (listing.allow_offers !== null) config.allow_offer = listing.allow_offers;
    if (listing.allow_checkout !== null) config.allow_checkout = listing.allow_checkout;
    if (listing.allow_contact !== null) config.allow_contact = listing.allow_contact;
    if (listing.allow_messaging !== null) config.allow_message = listing.allow_messaging;
  }

  // If anonymous user, hide contact
  if (!currentUserId && config.hide_contact_from_anonymous) {
    config.allow_contact = false;
    config.allow_phone_call = false;
  }

  return config;
}

/**
 * Get category-level transaction config
 */
export async function getCategoryTransactionConfig(
  supabase: SupabaseClient,
  categoryId: string
): Promise<TransactionConfig | null> {
  const { data } = await supabase
    .from("category_transaction_config")
    .select("*")
    .eq("category_id", categoryId)
    .single();

  return data as TransactionConfig | null;
}

/**
 * Get seller-level transaction config (overrides for specific category)
 */
export async function getSellerTransactionConfig(
  supabase: SupabaseClient,
  sellerId: string,
  categoryId: string
): Promise<Partial<TransactionConfig> | null> {
  const { data } = await supabase
    .from("seller_transaction_preferences")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("category_id", categoryId)
    .single();

  if (!data) return null;

  // Only return non-null fields (overrides)
  const result: Partial<TransactionConfig> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && (key.startsWith('allow_') || key === 'default_transaction_mode')) {
      (result as Record<string, unknown>)[key] = value;
    }
  });
  return result;
}

/**
 * Track a lead (contact reveal, message, offer, etc.)
 */
export async function trackLead(
  supabase: SupabaseClient,
  {
    listingId,
    sellerId,
    buyerId,
    leadType,
    conversationId,
    offerId,
  }: {
    listingId: string;
    sellerId: string;
    buyerId: string;
    leadType:
      | 'contact_revealed'
      | 'phone_click'
      | 'email_click'
      | 'message_started'
      | 'offer_made'
      | 'favorite';
    conversationId?: string;
    offerId?: string;
  }
) {
  const { error } = await supabase.rpc('track_lead', {
    p_listing_id: listingId,
    p_seller_id: sellerId,
    p_buyer_id: buyerId,
    p_lead_type: leadType,
    p_conversation_id: conversationId,
    p_offer_id: offerId,
  });

  if (error) {
    console.error('Error tracking lead:', error);
  }
}

/**
 * Get lead metrics for a listing (for seller dashboard)
 */
export async function getListingLeadMetrics(
  supabase: SupabaseClient,
  listingId: string
) {
  const { data, error } = await supabase.rpc('get_listing_lead_metrics', {
    p_listing_id: listingId,
  });

  if (error) {
    console.error('Error fetching lead metrics:', error);
    return null;
  }

  return data?.[0] || null;
}
