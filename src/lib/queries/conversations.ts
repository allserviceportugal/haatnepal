import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationWithRelations, TimelineEntry } from "@/lib/supabase/types";

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  listingId: string,
  buyerId: string,
  sellerId: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

export async function getConversationsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ConversationWithRelations[]> {
  const { data } = await supabase
    .from("conversations")
    .select(
      `
      *,
      listings(id, title, listing_images(url)),
      buyer:profiles!conversations_buyer_id_fkey(id, display_name),
      seller:profiles!conversations_seller_id_fkey(id, display_name)
    `
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as ConversationWithRelations[];
}

export async function getConversation(
  supabase: SupabaseClient,
  conversationId: string
): Promise<ConversationWithRelations | null> {
  const { data } = await supabase
    .from("conversations")
    .select(
      `
      *,
      listings(id, title, price, currency, status, listing_images(url)),
      buyer:profiles!conversations_buyer_id_fkey(id, display_name),
      seller:profiles!conversations_seller_id_fkey(id, display_name)
    `
    )
    .eq("id", conversationId)
    .single();

  return data as unknown as ConversationWithRelations | null;
}

export async function getConversationTimeline(
  supabase: SupabaseClient,
  conversationId: string
): Promise<TimelineEntry[]> {
  const [{ data: messages }, { data: offers }] = await Promise.all([
    supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at"),
    supabase.from("offers").select("*").eq("conversation_id", conversationId).order("created_at"),
  ]);

  const entries: TimelineEntry[] = [
    ...(messages ?? []).map((message) => ({
      kind: "message" as const,
      created_at: message.created_at,
      message,
    })),
    ...(offers ?? []).map((offer) => ({
      kind: "offer" as const,
      created_at: offer.created_at,
      offer,
    })),
  ];

  entries.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return entries;
}
