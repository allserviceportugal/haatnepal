import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/supabase/types";

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const image = listing.listing_images[0]?.url;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-md border border-slate-200 bg-white transition hover:shadow-md hover:shadow-slate-200"
    >
      <div className="relative h-36 w-full overflow-hidden bg-slate-100 sm:h-40">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            No photo yet
          </div>
        )}

        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
            <path
              d="M12 20s-7.5-4.6-9.9-9.1C.6 7.5 2 4 5.6 4c2 0 3.5 1.1 4.4 2.5C10.9 5.1 12.4 4 14.4 4 18 4 19.4 7.5 17.9 10.9 15.5 15.4 12 20 12 20Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {listing.listing_type === "fixed_price" && (
          <span className="absolute left-2 top-2 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Buy now
          </span>
        )}
        {listing.status === "sold" && (
          <span className="absolute inset-x-2 bottom-2 rounded bg-slate-900/90 px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-2.5">
        <p className="text-lg font-black leading-none text-slate-900">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <h3 className="line-clamp-2 text-xs leading-snug text-slate-700">{listing.title}</h3>
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
          <span className="truncate">{listing.city ? `${listing.city}, ${listing.district}` : listing.district}</span>
          <span className="shrink-0">{timeAgo(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
