"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackShareAction(listingId: string, sellerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Anonymous share, still track it
    return await supabase.from("leads").insert({
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: null,
      lead_type: "share_click",
    });
  }

  // Authenticated share
  return await supabase.from("leads").insert({
    listing_id: listingId,
    seller_id: sellerId,
    buyer_id: user.id,
    lead_type: "share_click",
  });
}
