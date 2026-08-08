"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";

export function AddToCartButton({
  listingId,
  title,
  price,
  currency,
  image,
  sellerId,
  sellerName,
  district,
}: {
  listingId: string;
  title: string;
  price: number;
  currency: string;
  image: string | null;
  sellerId: string;
  sellerName: string;
  district: string;
}) {
  const { items, addItem } = useCart();
  const router = useRouter();
  const inCart = items.some((item) => item.listingId === listingId);

  return (
    <button
      type="button"
      onClick={() => {
        if (!inCart) {
          addItem({ listingId, title, price, currency, image, sellerId, sellerName, district });
        }
        router.push("/cart");
      }}
      className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
    >
      {inCart ? "View cart" : "Add to cart"}
    </button>
  );
}
