"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFavoriteAction } from "@/lib/actions/favorites";

export function FavoriteButton({
  listingId,
  initialFavorited,
  currentPath,
}: {
  listingId: string;
  initialFavorited: boolean;
  currentPath: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFavorited, toggleOptimistic] = useOptimistic(initialFavorited);

  const handleToggle = () => {
    toggleOptimistic(!optimisticFavorited);
    startTransition(() => toggleFavoriteAction(listingId, optimisticFavorited, currentPath));
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      aria-pressed={optimisticFavorited}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        optimisticFavorited
          ? "border-orange-200 bg-orange-50 text-orange-600"
          : "border-slate-200 text-slate-700 hover:border-orange-200 hover:text-orange-600"
      }`}
    >
      <span aria-hidden>{optimisticFavorited ? "♥" : "♡"}</span>
      {optimisticFavorited ? "Saved" : "Save"}
    </button>
  );
}
