"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";

export function HeaderUserMenu({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 sm:inline-flex hover:border-orange-200 hover:text-orange-600"
      >
        {displayName}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <Link
            href="/dashboard/listings"
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            My listings
          </Link>
          <Link
            href="/dashboard/favorites"
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Favorites
          </Link>
          <Link
            href="/dashboard/profile"
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
