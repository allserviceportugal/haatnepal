"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/queries/conversations";
import { trackLead } from "@/lib/queries/transaction_config";
import { sendNewMessageEmail } from "@/lib/services/email";

export type ChatActionState = { error?: string };

export async function startConversationAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listing/${listingId}`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing) redirect(`/listing/${listingId}`);
  if (listing.seller_id === user.id) redirect(`/listing/${listingId}`);

  const conversationResult = await getOrCreateConversation(supabase, listingId, user.id, listing.seller_id);
  if (!conversationResult) redirect(`/listing/${listingId}`);

  const { id: conversationId, isNew } = conversationResult;

  if (isNew) {
    await trackLead(supabase, {
      listingId,
      sellerId: listing.seller_id,
      buyerId: user.id,
      leadType: 'message_started',
      conversationId,
    });
  }

  redirect(`/dashboard/messages/${conversationId}`);
}

async function assertParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  conversationId: string,
  userId: string
) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id, listing_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) {
    return null;
  }

  return conversation;
}

export async function sendMessageAction(
  conversationId: string,
  _prevState: ChatActionState,
  formData: FormData
): Promise<ChatActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to send a message." };
  }

  const conversation = await assertParticipant(supabase, conversationId, user.id);
  if (!conversation) {
    return { error: "You don't have access to this conversation." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "Message can't be empty." };
  }

  await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, body });

  // Send notification email to recipient (fire-and-forget, don't fail the message if email fails)
  try {
    const recipientId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;
    if (recipientId) {
      const { data: sender } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", user.id)
        .single();

      const { data: recipient } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", recipientId)
        .single();

      const { data: listing } = await supabase
        .from("listings")
        .select("title")
        .eq("id", conversation.listing_id)
        .single();

      if (sender && recipient) {
        const conversationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages/${conversationId}`;
        await sendNewMessageEmail(
          recipient.email,
          recipient.display_name,
          sender.display_name,
          sender.email,
          listing?.title || "Your listing",
          body,
          conversationUrl
        );
      }
    }
  } catch (error) {
    // Log but don't fail — email is best-effort notification
    console.error("[MESSAGE] Failed to send email notification:", error);
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
  return {};
}

export async function makeOfferAction(
  conversationId: string,
  listingId: string,
  _prevState: ChatActionState,
  formData: FormData
): Promise<ChatActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to make an offer." };
  }

  const conversation = await assertParticipant(supabase, conversationId, user.id);
  if (!conversation) {
    return { error: "You don't have access to this conversation." };
  }

  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Enter a valid offer amount." };
  }

  await supabase
    .from("offers")
    .update({ status: "countered" })
    .eq("conversation_id", conversationId)
    .eq("status", "pending");

  await supabase.from("offers").insert({
    conversation_id: conversationId,
    listing_id: listingId,
    amount,
    created_by: user.id,
    status: "pending",
  });

  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();

  if (listing) {
    await trackLead(supabase, {
      listingId,
      sellerId: listing.seller_id,
      buyerId: user.id,
      leadType: 'offer_made',
      conversationId,
    });
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
  return {};
}

export async function respondToOfferAction(offerId: string, response: "accepted" | "rejected") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: offer } = await supabase
    .from("offers")
    .select("id, conversation_id, created_by, status")
    .eq("id", offerId)
    .single();

  if (!offer) return;

  const conversation = await assertParticipant(supabase, offer.conversation_id, user.id);
  if (!conversation) return;
  if (offer.created_by === user.id) return; // can't respond to your own offer
  if (offer.status !== "pending") return;

  await supabase
    .from("offers")
    .update({ status: response, responded_at: new Date().toISOString() })
    .eq("id", offerId);

  revalidatePath(`/dashboard/messages/${offer.conversation_id}`);
}
