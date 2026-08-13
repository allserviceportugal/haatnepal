import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListingById, isDescendantOfSlug } from "@/lib/queries/listings";
import { getListingTransactionConfig } from "@/lib/queries/transaction_config";
import { FavoriteButton } from "@/components/favorite-button";
import { ListingCTASection } from "@/components/listing-cta-section";
import { FeatureListingButton } from "@/components/feature-listing-button";
import { ReportIssueButton } from "@/components/report-issue-button";
import { ShareListingButton } from "@/components/share-listing-button";
import { deleteListingAction, markListingSoldAction } from "@/lib/actions/listings";
import { startConversationAction } from "@/lib/actions/conversations";
import { withdrawJobApplicationAction } from "@/lib/actions/job-applications";
import { JobApplicationForm } from "@/components/job-application-form";
import { ViewTracker } from "@/components/view-tracker";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { formatPrice, formatSalary, timeAgo, isWithinEditWindow } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return { title: "Listing" };
  }

  try {
    const supabase = await createClient();
    const listing = await getListingById(supabase, id);

    if (!listing) {
      return { title: "Listing Not Found" };
    }

    const image = listing.listing_images[0]?.url;
    const location = listing.city ? `${listing.city}, ${listing.district}` : listing.district;
    const description = listing.description
      ? listing.description.substring(0, 160).replace(/\n/g, " ")
      : `Buy or sell on Haat Nepal`;

    return {
      title: `${listing.title} - ${formatPrice(listing.price, listing.currency, listing.price_on_request)} | Haat Nepal`,
      description,
      openGraph: {
        title: listing.title,
        description,
        images: image
          ? [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: listing.title,
              },
            ]
          : undefined,
        type: "website",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: listing.title,
        description,
        images: image ? [image] : undefined,
      },
      alternates: {
        canonical: `https://haatnepal.com/listing/${id}`,
      },
    };
  } catch {
    return { title: "Listing" };
  }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn&apos;t configured yet</h1>
        <p className="mt-2 text-slate-600">
          Add your Supabase project URL and anon key to <code>.env.local</code> to see live
          listings.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const listing = await getListingById(supabase, id);
  if (!listing) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === listing.seller_id;

  // Get transaction config for this listing
  const transactionConfig = await getListingTransactionConfig(supabase, id, user?.id);

  let canFeatureFree = false;
  if (isOwner) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plans(monthly_featured_quota)")
      .eq("id", user.id)
      .single();
    const plan = (
      profile as unknown as { subscription_plans: { monthly_featured_quota: number | null } | null } | null
    )?.subscription_plans;

    const quota = plan?.monthly_featured_quota ?? null;
    if (quota === null) {
      // Unlimited (Custom plan)
      canFeatureFree = true;
    } else if (quota === 0) {
      // No free features (Normal, Business plans)
      canFeatureFree = false;
    } else {
      // Finite quota (Pro plan with 20) - count this month's featured listings
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .gte("featured_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      canFeatureFree = (count ?? 0) < quota;
    }
  }

  let isFavorited = false;
  if (user) {
    const { data } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .maybeSingle();
    isFavorited = Boolean(data);
  }

  // Check if this is a jobs listing
  const isJobsListing = listing.categories?.parent_id
    ? await isDescendantOfSlug(supabase, listing.category_id, "jobs")
    : listing.categories?.slug === "jobs";

  // Check if this is an agriculture listing
  const isAgricultureListing = listing.categories?.parent_id
    ? await isDescendantOfSlug(supabase, listing.category_id, "agriculture")
    : listing.categories?.slug === "agriculture";

  // Fetch existing job application if user is signed in and this is a jobs listing
  let userJobApplication = null;
  if (isJobsListing && user && !isOwner) {
    const { data } = await supabase
      .from("job_applications")
      .select("id, created_at")
      .eq("listing_id", id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    userJobApplication = data;
  }

  const images = [...listing.listing_images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Track views for non-owners only */}
      {!isOwner && <ViewTracker listingId={listing.id} />}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ListingImageGallery images={images} alt={listing.title} />

          <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-slate-700">{listing.description}</p>
          </div>

          {listing.listing_attribute_values.length > 0 && (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Details</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {listing.listing_attribute_values
                  .filter((row) => row.category_attributes)
                  .map((row) => (
                    <div key={row.id} className="flex justify-between gap-3 border-b border-slate-100 pb-2 text-sm">
                      <dt className="text-slate-500">{row.category_attributes?.label}</dt>
                      <dd className="font-semibold text-slate-800">
                        {row.category_attributes?.input_type === "boolean"
                          ? row.value === "true"
                            ? "Yes"
                            : "No"
                          : row.value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}

          {isJobsListing && (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Job Details</h2>
              <dl className="mt-4 space-y-3">
                {listing.company_name && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Company</dt>
                    <dd className="text-sm font-semibold text-slate-900">{listing.company_name}</dd>
                  </div>
                )}

                {formatSalary(
                  listing.salary_min,
                  listing.salary_max,
                  listing.salary_period,
                  listing.salary_negotiable
                ) && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Salary</dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {formatSalary(
                        listing.salary_min,
                        listing.salary_max,
                        listing.salary_period,
                        listing.salary_negotiable
                      )}
                    </dd>
                  </div>
                )}

                {listing.vacancies_count && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Vacancies</dt>
                    <dd className="text-sm font-semibold text-slate-900">{listing.vacancies_count}</dd>
                  </div>
                )}

                {listing.application_deadline && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Application Deadline</dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {new Date(listing.application_deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {new Date(listing.application_deadline) < new Date() && (
                        <span className="ml-2 text-xs font-bold text-red-600">(Closed)</span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {isAgricultureListing && (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                {listing.for_rent ? "Service Details" : "Farm & Product Details"}
              </h2>
              <dl className="mt-4 space-y-3">
                {listing.harvest_date && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Harvest / Production Date</dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {new Date(listing.harvest_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}

                {listing.unit_of_sale && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Unit of Sale</dt>
                    <dd className="text-sm font-semibold text-slate-900">{listing.unit_of_sale}</dd>
                  </div>
                )}

                {listing.min_order_quantity && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Minimum Order Quantity</dt>
                    <dd className="text-sm font-semibold text-slate-900">
                      {listing.min_order_quantity} {listing.unit_of_sale || "units"}
                    </dd>
                  </div>
                )}

                {listing.farm_location && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Farm / Origin Location</dt>
                    <dd className="text-sm font-semibold text-slate-900">{listing.farm_location}</dd>
                  </div>
                )}

                {listing.for_rent && listing.rental_rate_period && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-sm font-semibold text-slate-600">Rate Period</dt>
                    <dd className="inline-flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-900">
                        Per {listing.rental_rate_period}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {!isJobsListing && (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Delivery</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {listing.pickup_available && <li>Buyer pickup available</li>}
                {listing.listing_delivery_options.map(({ courier }) => (
                  <li key={courier.id}>
                    {courier.name} — NPR {courier.base_cost_npr}
                  </li>
                ))}
                {!listing.pickup_available && listing.listing_delivery_options.length === 0 && (
                  <li className="text-slate-500">Contact the seller to arrange delivery.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            {listing.categories && (
              <Link
                href={`/c/${listing.categories.slug}`}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500"
              >
                {listing.categories.name}
              </Link>
            )}
            <div className="mt-2 flex items-start gap-2">
              <h1 className="flex-1 text-2xl font-black text-slate-900">{listing.title}</h1>
              {listing.featured_until !== null && new Date(listing.featured_until) > new Date() && (
                <span className="rounded bg-amber-400 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-black text-orange-600">
              {formatPrice(listing.price, listing.currency, listing.price_on_request)}
              {isAgricultureListing && (
                <>
                  {listing.unit_of_sale && <span className="ml-2 text-lg text-slate-600">/{listing.unit_of_sale}</span>}
                  {listing.for_rent && listing.rental_rate_period && (
                    <span className="ml-2 text-lg text-slate-600">/{listing.rental_rate_period}</span>
                  )}
                </>
              )}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>{listing.city ? `${listing.city}, ${listing.district}` : listing.district}</span>
              <span>{timeAgo(listing.created_at)}</span>
            </div>

            {/* Engagement row: views, saves, shares */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
              {listing.view_count !== null && (
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M12 5C7 5 2.73 7.61 1 11.5c1.73 3.89 6 6.5 11 6.5s9.27-2.61 11-6.5c-1.73-3.89-6-6.5-11-6.5zm0 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                  </svg>
                  {listing.view_count} {listing.view_count === 1 ? "view" : "views"}
                </span>
              )}
              {(listing.favorite_count ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-red-500" aria-hidden>
                    <path d="M12 20s-7.5-4.6-9.9-9.1C.6 7.5 2 4 5.6 4c2 0 3.5 1.1 4.4 2.5C10.9 5.1 12.4 4 14.4 4 18 4 19.4 7.5 17.9 10.9 15.5 15.4 12 20 12 20Z" />
                  </svg>
                  {listing.favorite_count} {listing.favorite_count === 1 ? "save" : "saves"}
                </span>
              )}
              {((listing as any).share_count ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4m0 0L8 6m4-4v13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {(listing as any).share_count} {((listing as any).share_count ?? 0) === 1 ? "share" : "shares"}
                </span>
              )}
            </div>

            {(listing.favorite_count ?? 0) > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-red-500" aria-hidden>
                  <path d="M12 20s-7.5-4.6-9.9-9.1C.6 7.5 2 4 5.6 4c2 0 3.5 1.1 4.4 2.5C10.9 5.1 12.4 4 14.4 4 18 4 19.4 7.5 17.9 10.9 15.5 15.4 12 20 12 20Z" />
                </svg>
                {listing.favorite_count} {listing.favorite_count === 1 ? "person saved" : "people saved"} this
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  {isWithinEditWindow(listing.created_at) ? (
                    <Link
                      href={`/listing/${listing.id}/edit`}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600"
                    >
                      Edit
                    </Link>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                      Edit window closed (15 min)
                    </span>
                  )}
                  {listing.status !== "sold" && (
                    <form action={markListingSoldAction.bind(null, listing.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600"
                      >
                        Mark as sold
                      </button>
                    </form>
                  )}
                  <form action={deleteListingAction.bind(null, listing.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                  <FeatureListingButton
                    listingId={listing.id}
                    featuredUntil={listing.featured_until}
                    canFeatureFree={canFeatureFree}
                  />
                </>
              ) : (
                <FavoriteButton
                  listingId={listing.id}
                  initialFavorited={isFavorited}
                  currentPath={`/listing/${listing.id}`}
                />
              )}
            </div>

            {!isOwner && !isJobsListing && listing.status === "active" && transactionConfig && (
              <div className="mt-6">
                <ListingCTASection
                  listingId={listing.id}
                  sellerId={listing.seller_id}
                  sellerPhone={listing.profiles?.phone ?? undefined}
                  sellerEmail={listing.profiles?.email ?? undefined}
                  sellerName={listing.profiles?.display_name ?? "Seller"}
                  listingTitle={listing.title}
                  listingPrice={listing.price}
                  listingImage={images[0]?.url ?? null}
                  config={transactionConfig}
                  currentUserId={user?.id}
                  priceOnRequest={listing.price_on_request}
                />
              </div>
            )}
          </div>

          {isJobsListing && !isOwner && listing.status === "active" && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Apply for this job</h2>

              {userJobApplication ? (
                <div>
                  <p className="text-sm text-slate-600">
                    Applied on{" "}
                    <span className="font-semibold text-slate-900">
                      {new Date(userJobApplication.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                  <form action={withdrawJobApplicationAction.bind(null, userJobApplication.id)} className="mt-3">
                    <button
                      type="submit"
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Withdraw application
                    </button>
                  </form>
                </div>
              ) : listing.external_apply_url ? (
                <a
                  href={listing.external_apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-full bg-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Apply on company website →
                </a>
              ) : !user ? (
                <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                  <p className="font-semibold">Sign in to apply</p>
                  <p className="mt-1">You need to be signed in to submit an application.</p>
                  <Link
                    href={`/login?next=/listing/${listing.id}`}
                    className="mt-2 inline-block font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Sign in →
                  </Link>
                </div>
              ) : (
                <JobApplicationForm listingId={listing.id} userId={user.id} />
              )}

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 mb-3">Or contact the employer directly:</p>
                <form action={startConversationAction.bind(null, listing.id)}>
                  <button
                    type="submit"
                    className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Message employer
                  </button>
                </form>
              </div>
            </div>
          )}

          {listing.profiles && !isOwner && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {isJobsListing ? "Employer" : "Seller"}
                </h2>
                {listing.profiles.account_type === "business" && (
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-600">
                    Business
                  </span>
                )}
              </div>
              <Link
                href={`/u/${listing.profiles.id}`}
                className="mt-3 block text-lg font-bold text-slate-900 hover:text-orange-600"
              >
                {listing.profiles.display_name}
              </Link>
              <p className="mt-1 text-sm text-slate-500">
                {listing.profiles.rating_count > 0
                  ? `★ ${listing.profiles.rating_avg.toFixed(1)} (${listing.profiles.rating_count})`
                  : "No ratings yet"}
              </p>
              <Link
                href={`/u/${listing.profiles.id}`}
                className="mt-3 block text-center text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                {listing.profiles.account_type === "business"
                  ? "View business profile & all listings →"
                  : "View profile & other listings →"}
              </Link>
              {!isJobsListing && (
                <form action={startConversationAction.bind(null, listing.id)} className="mt-4">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
                  >
                    Message seller
                  </button>
                </form>
              )}
              <div className="mt-4 border-t border-slate-200 pt-4 flex gap-4">
                <ShareListingButton
                  listingId={listing.id}
                  sellerId={listing.seller_id}
                  listingTitle={listing.title}
                  listingImage={images[0]?.url}
                />
                <ReportIssueButton
                  listingId={listing.id}
                  listingTitle={listing.title}
                  sellerName={listing.profiles.display_name}
                />
              </div>
            </div>
          )}

          {/* Posted, Expiry, and Listing ID */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Posted
                </p>
                <p className="mt-2 text-sm text-slate-900">
                  {new Date(listing.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Expires
                </p>
                <p className="mt-2 text-sm text-slate-900">
                  {listing.expires_at
                    ? new Date(listing.expires_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "No expiry"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Listing ID
                </p>
                <p className="mt-2 font-mono text-xs text-slate-900 break-all">{listing.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
