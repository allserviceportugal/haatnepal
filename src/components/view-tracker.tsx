"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  listingId: string;
}

export function ViewTracker({ listingId }: ViewTrackerProps) {
  useEffect(() => {
    // Fire the view tracking once on mount
    // Use keepalive: true so the request completes even if the page navigates away
    fetch(`/api/listings/${listingId}/view`, {
      method: "POST",
      keepalive: true,
    }).catch((err) => {
      console.error("[VIEW_TRACKER] Failed to track view:", err);
      // Silently fail; don't break the page experience over analytics
    });
  }, [listingId]);

  // Component renders nothing; this is purely for side effects
  return null;
}
