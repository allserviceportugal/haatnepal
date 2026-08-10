import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListings, getFeaturedListings, getPopularListings, getTopSellingListings, getTopRatedSellers } from "@/lib/queries/listings";
import { ListingCard } from "@/components/listing-card";
import { SellerCard } from "@/components/seller-card";
import { PremiumAdsCarousel } from "@/components/premium-ads-carousel";
import type { Category } from "@/lib/supabase/types";

const CATEGORY_ICONS: Record<string, string> = {
  vehicles: "🚗",
  "real-estate": "🏠",
  electronics: "📱",
  "home-living": "🛋️",
  fashion: "👕",
  jobs: "💼",
  services: "🛠️",
  "hobbies-sports": "🤾",
  pets: "🐾",
  agriculture: "🌾",
  "health-beauty": "💄",
  "business-industrial": "🏭",
  "antiques-collectibles": "🏺",
  "free-stuff": "🎁",
};

const trustBadges = [
  { icon: "🆓", label: "Free listings" },
  { icon: "✅", label: "Verified sellers" },
  { icon: "🛡️", label: "Buyer protection" },
  { icon: "🚚", label: "Courier delivery" },
  { icon: "💬", label: "In-app negotiation" },
];

const benefits = [
  { title: "Fast local selling", text: "List in minutes and reach buyers in Kathmandu, Pokhara, and beyond." },
  { title: "Secure payments", text: "Built-in trust tools for verified deals and safer transactions." },
  { title: "Nepal-first categories", text: "Tailored for vehicles, properties, jobs, agriculture, and small business needs." },
];

const stats = [
  { value: "120K+", label: "active buyers" },
  { value: "32K+", label: "new listings" },
  { value: "4.8/5", label: "seller rating" },
  { value: "24/7", label: "support" },
];

export default async function Home() {
  const configured = isSupabaseConfigured();
  let categories: Category[] = [];
  let recentListings: Awaited<ReturnType<typeof getListings>> = [];
  let featuredListings: Awaited<ReturnType<typeof getFeaturedListings>> = [];
  let popularListings: Awaited<ReturnType<typeof getPopularListings>> = [];
  let topSellingListings: Awaited<ReturnType<typeof getTopSellingListings>> = [];
  let topSellers: Awaited<ReturnType<typeof getTopRatedSellers>> = [];

  if (configured) {
    const supabase = await createClient();
    const [{ data: categoryRows }, recent, featured, popular, topSelling, sellers] = await Promise.all([
      supabase.from("categories").select("*").is("parent_id", null).order("name"),
      getListings(supabase, { sort: "newest", limit: 12 }),
      getFeaturedListings(supabase, 12),
      getPopularListings(supabase, 12),
      getTopSellingListings(supabase, 12),
      getTopRatedSellers(supabase, 6),
    ]);
    categories = categoryRows ?? [];
    recentListings = recent;
    featuredListings = featured;
    popularListings = popular;
    topSellingListings = topSelling;
    topSellers = sellers;
  }

  const displayCategories =
    categories.length > 0
      ? categories
      : Object.keys(CATEGORY_ICONS).map((slug, i) => ({
          id: String(i),
          slug,
          name: slug,
          parent_id: null,
          icon: null,
        }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      {!configured && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase isn&apos;t connected yet — showing placeholder content. Add{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code>.env.local</code> to go live.
        </div>
      )}

      <section className="grid gap-0 overflow-hidden rounded-md bg-gradient-to-r from-orange-600 to-orange-500 text-white sm:grid-cols-2 sm:min-h-[300px]">
        <div className="flex flex-col justify-center gap-4 px-6 py-10 sm:px-10">
          <span className="inline-flex w-fit items-center rounded bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
            Nepal&apos;s marketplace
          </span>
          <h1 className="max-w-md text-3xl font-black leading-tight sm:text-4xl">
            Buy, sell, and negotiate — all in one place.
          </h1>
          <p className="max-w-md text-sm text-orange-50">
            Classifieds, business listings, and courier delivery built for Nepal.
          </p>
          <Link
            href="/listing/new"
            className="mt-2 inline-flex w-fit items-center rounded-md bg-white px-5 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
          >
            Start selling
          </Link>
        </div>
        <div className="relative w-full min-h-[220px] sm:min-h-full">
          <PremiumAdsCarousel />
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {trustBadges.map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700"
          >
            <span className="text-base">{badge.icon}</span>
            {badge.label}
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-black text-slate-900">Browse by category</h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {displayCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/c/${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-md border border-slate-200 bg-white p-4 text-center transition hover:border-orange-300 hover:shadow-sm"
            >
              <span className="text-2xl">{CATEGORY_ICONS[category.slug] ?? "🏷️"}</span>
              <span className="text-xs font-semibold leading-tight text-slate-700">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-900">
              ⭐ Featured listings
            </h2>
            <Link href="/search?featured=true" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              See all
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="w-40 shrink-0 sm:w-48">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Listings */}
      {popularListings.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-900">
              🔥 Popular now
            </h2>
            <Link href="/search?sort=popular" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              See all
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {popularListings.map((listing) => (
              <div key={listing.id} className="w-40 shrink-0 sm:w-48">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Selling */}
      {topSellingListings.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-900">
              📦 Top selling
            </h2>
            <Link href="/search?sort=sales" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              See all
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {topSellingListings.map((listing) => (
              <div key={listing.id} className="w-40 shrink-0 sm:w-48">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fresh Listings */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-slate-900">
            {configured ? "✨ Latest listings" : "Example listings"}
          </h2>
          <Link href="/search" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            See all
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {recentListings.map((listing) => (
              <div key={listing.id} className="w-40 shrink-0 sm:w-48">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-6 text-slate-500">
            {configured
              ? "No listings yet — be the first to post one!"
              : "Connect Supabase to see real listings here."}
          </p>
        )}
      </section>

      {/* Top Sellers */}
      {topSellers.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-900">
              👥 Top-rated sellers
            </h2>
            <Link href="/search?sellerType=business" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              See all sellers
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topSellers.map((seller) => (
              <SellerCard
                key={seller.id}
                id={seller.id}
                displayName={seller.display_name}
                avatarUrl={seller.avatar_url}
                district={seller.district}
                ratingAvg={seller.rating_avg}
                ratingCount={seller.rating_count}
                accountType={seller.account_type}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md bg-slate-900 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
            Business growth
          </p>
          <h2 className="mt-3 text-2xl font-black">Sell smarter with a business-ready marketplace.</h2>
          <p className="mt-4 text-slate-300">
            From product sellers to local brands, Haat Nepal helps businesses present offers,
            build trust, and move inventory with the speed of a digital storefront.
          </p>
          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-md border border-white/10 bg-white/5 p-4">
                <h3 className="text-base font-bold text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-white p-6">
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-md bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 ring-1 ring-orange-100 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Built for Nepal
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              A marketplace shaped for local discovery.
            </h2>
          </div>
          <Link
            href="/listing/new"
            className="rounded-md bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-orange-500"
          >
            Start selling today
          </Link>
        </div>
      </section>
    </main>
  );
}
