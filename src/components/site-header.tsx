import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { HeaderUserMenu } from "./header-user-menu";
import { CartIcon } from "./cart-icon";
import type { Category } from "@/lib/supabase/types";

const quickLinks = [
  { label: "Vehicles", href: "/c/vehicles" },
  { label: "Real Estate", href: "/c/real-estate" },
  { label: "Electronics", href: "/c/electronics" },
  { label: "Fashion", href: "/c/fashion" },
  { label: "Jobs", href: "/c/jobs" },
  { label: "Services", href: "/c/services" },
  { label: "Free Stuff", href: "/c/free-stuff" },
];

export async function SiteHeader() {
  let displayName: string | null = null;
  let categories: Category[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: profileRow }, { data: categoryRows }] = await Promise.all([
      (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { data: null };
        return supabase.from("profiles").select("display_name").eq("id", user.id).single();
      })(),
      supabase.from("categories").select("*").is("parent_id", null).order("name"),
    ]);

    if (profileRow) displayName = profileRow.display_name;
    categories = categoryRows ?? [];
  }

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-base font-black text-white">
            H
          </div>
          <span className="hidden text-lg font-black tracking-tight text-slate-900 sm:inline">
            haat<span className="text-orange-500">nepal</span>
          </span>
        </Link>

        <form
          method="get"
          action="/search"
          className="flex flex-1 items-center overflow-hidden rounded-md border-2 border-slate-900"
        >
          <input
            name="q"
            aria-label="Search products"
            placeholder="What are you looking for?"
            className="min-w-0 flex-1 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <select
            name="category"
            defaultValue=""
            aria-label="Category"
            className="hidden border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none sm:block"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            aria-label="Search"
            className="flex h-full items-center bg-orange-500 px-5 py-2.5 text-white transition hover:bg-orange-600"
          >
            <SearchIcon />
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/dashboard/favorites"
            aria-label="Favorites"
            className="hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-orange-600 sm:inline-flex"
          >
            <HeartIcon />
          </Link>
          <Link
            href="/dashboard/messages"
            aria-label="Messages"
            className="hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-orange-600 sm:inline-flex"
          >
            <ChatIcon />
          </Link>
          <CartIcon />
          <Link
            href="/listing/new"
            className="rounded-md bg-orange-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-orange-600 sm:px-4"
          >
            Sell
          </Link>
          {displayName ? (
            <HeaderUserMenu displayName={displayName} />
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 sm:px-4"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      <div className="border-y border-slate-200 bg-white">
        <nav className="no-scrollbar mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-sm font-medium text-slate-600 sm:px-6 lg:px-8">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap transition hover:text-orange-600"
            >
              {item.label}
            </Link>
          ))}
          <span className="ml-auto hidden shrink-0 items-center gap-1 whitespace-nowrap text-orange-600 sm:inline-flex">
            <SparkleIcon />
            Free listings for individuals
          </span>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M12 20s-7.5-4.6-9.9-9.1C.6 7.5 2 4 5.6 4c2 0 3.5 1.1 4.4 2.5C10.9 5.1 12.4 4 14.4 4 18 4 19.4 7.5 17.9 10.9 15.5 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M4 5.5h16v10.5H8.5L4 20V5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M10 2l1.8 5.2L17 9l-5.2 1.8L10 16l-1.8-5.2L3 9l5.2-1.8L10 2Z" />
    </svg>
  );
}
