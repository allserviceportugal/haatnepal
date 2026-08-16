import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/supabase/types";

export function ListingCard({
  listing,
  applicantCount,
}: {
  listing: ListingWithRelations;
  applicantCount?: number;
}) {
  const image = listing.listing_images[0]?.url;
  const isFeatured = listing.featured_until !== null && new Date(listing.featured_until) > new Date();
  const isOrganic = (listing.listing_attribute_values ?? []).some(
    (row) => row.category_attributes?.key === "organic" && row.value === "true"
  );
  const href = applicantCount !== undefined ? `/dashboard/listings/${listing.id}/applicants` : `/listing/${listing.id}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-md border border-slate-200 bg-white transition hover:shadow-md hover:shadow-slate-200"
    >
      <div className="relative w-full overflow-hidden bg-slate-100 aspect-video">
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

        {(listing.favorite_count ?? 0) > 0 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-red-500" aria-hidden>
              <path d="M12 20s-7.5-4.6-9.9-9.1C.6 7.5 2 4 5.6 4c2 0 3.5 1.1 4.4 2.5C10.9 5.1 12.4 4 14.4 4 18 4 19.4 7.5 17.9 10.9 15.5 15.4 12 20 12 20Z" />
            </svg>
            {listing.favorite_count}
          </span>
        )}

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {isFeatured && (
            <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
              Featured
            </span>
          )}
          {applicantCount !== undefined && (
            <span className="rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {applicantCount} {applicantCount === 1 ? "applicant" : "applicants"}
            </span>
          )}
          {listing.listing_type === "fixed_price" && (
            <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Buy now
            </span>
          )}
          {listing.profiles?.account_type === "business" && (
            <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Business
            </span>
          )}
          {isOrganic && (
            <span className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Organic
            </span>
          )}
        </div>
        {listing.status === "sold" && (
          <span className="absolute inset-x-2 bottom-2 rounded bg-slate-900/90 px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-2.5">
        <p className="text-lg font-black leading-none text-slate-900">
          {formatPrice(listing.price, listing.currency, listing.price_on_request)}
          {listing.unit_of_sale && (
            <span className="ml-1 text-xs text-slate-600">/{listing.unit_of_sale}</span>
          )}
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
