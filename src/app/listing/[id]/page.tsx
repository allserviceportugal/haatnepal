import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListingById, isDescendantOfSlug } from "@/lib/queries/listings";
import { FavoriteButton } from "@/components/favorite-button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FeatureListingButton } from "@/components/feature-listing-button";
import { deleteListingAction, markListingSoldAction } from "@/lib/actions/listings";
import { startConversationAction } from "@/lib/actions/conversations";
import { withdrawJobApplicationAction } from "@/lib/actions/job-applications";
import { JobApplicationForm } from "@/components/job-application-form";
import { formatPrice, formatSalary, timeAgo } from "@/lib/format";

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

  let canFeature = false;
  if (isOwner) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plans(monthly_featured_quota)")
      .eq("id", user.id)
      .single();
    const plan = (
      profile as unknown as { subscription_plans: { monthly_featured_quota: number | null } | null } | null
    )?.subscription_plans;
    canFeature = !plan || plan.monthly_featured_quota !== 0;
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
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0].url} alt={listing.title} className="h-[420px] w-full object-cover" />
            ) : (
              <div className="flex h-[420px] w-full items-center justify-center text-slate-400">
                No photos yet
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.slice(1).map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={listing.title}
                  className="h-20 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}

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
            <h1 className="mt-2 text-2xl font-black text-slate-900">{listing.title}</h1>
            <p className="mt-2 text-3xl font-black text-orange-600">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>{listing.city ? `${listing.city}, ${listing.district}` : listing.district}</span>
              <span>{timeAgo(listing.created_at)}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <Link
                    href={`/listing/${listing.id}/edit`}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600"
                  >
                    Edit
                  </Link>
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
                    canFeature={canFeature}
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

            {!isOwner && !isJobsListing && listing.listing_type === "fixed_price" && listing.status === "active" && (
              <div className="mt-3">
                <AddToCartButton
                  listingId={listing.id}
                  title={listing.title}
                  price={listing.price}
                  currency={listing.currency}
                  image={images[0]?.url ?? null}
                  sellerId={listing.seller_id}
                  sellerName={listing.profiles?.display_name ?? "Seller"}
                  district={listing.district}
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
