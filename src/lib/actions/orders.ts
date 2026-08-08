"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckoutActionState = { error?: string; success?: boolean };

type CheckoutCartItem = { listingId: string };
type CheckoutDeliveryChoice = { sellerId: string; courierId: string | null; pickup: boolean };

export async function checkoutAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to check out." };
  }

  const cartRaw = formData.get("cartPayload");
  const deliveryRaw = formData.get("deliveryPayload");
  if (typeof cartRaw !== "string" || typeof deliveryRaw !== "string") {
    return { error: "Your cart is empty." };
  }

  let cartItems: CheckoutCartItem[];
  let deliveryChoices: CheckoutDeliveryChoice[];
  try {
    cartItems = JSON.parse(cartRaw);
    deliveryChoices = JSON.parse(deliveryRaw);
  } catch {
    return { error: "Could not read your cart. Please try again." };
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  const listingIds = cartItems.map((item) => item.listingId);
  const { data: listings } = await supabase
    .from("listings")
    .select("id, seller_id, price, status, listing_type")
    .in("id", listingIds);

  const validListings = (listings ?? []).filter(
    (listing) =>
      listing.status === "active" &&
      listing.listing_type === "fixed_price" &&
      listing.seller_id !== user.id
  );

  if (validListings.length === 0) {
    return { error: "None of the items in your cart are still available." };
  }

  const bySeller = new Map<string, typeof validListings>();
  for (const listing of validListings) {
    const group = bySeller.get(listing.seller_id) ?? [];
    group.push(listing);
    bySeller.set(listing.seller_id, group);
  }

  const createdOrderIds: string[] = [];

  for (const [sellerId, sellerListings] of bySeller) {
    const choice = deliveryChoices.find((d) => d.sellerId === sellerId);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        delivery_courier_id: choice?.courierId ?? null,
        pickup_selected: choice?.pickup ?? false,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !order) continue;

    await supabase.from("order_items").insert(
      sellerListings.map((listing) => ({
        order_id: order.id,
        listing_id: listing.id,
        price_at_order: listing.price,
      }))
    );

    createdOrderIds.push(order.id);
  }

  if (createdOrderIds.length === 0) {
    return { error: "Could not place your order. Please try again." };
  }

  revalidatePath("/dashboard/orders");
  return { success: true };
}
