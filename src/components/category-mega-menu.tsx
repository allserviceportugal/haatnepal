"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/supabase/types";

export function CategoryMegaMenu({
  topLevelCategories,
  childrenByParent,
  quickLinks,
}: {
  topLevelCategories: Category[];
  childrenByParent: Record<string, Category[]>;
  quickLinks: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(topLevelCategories[0]?.id ?? null);
  const [hoverCategoryId, setHoverCategoryId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Categories to show subcategories on hover
  const hoverCategories = ["vehicles", "real-estate", "electronics"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChildren = activeId ? (childrenByParent[activeId] ?? []) : [];
  const groups = activeChildren.filter((c) => (childrenByParent[c.id]?.length ?? 0) > 0);
  const flatItems = activeChildren.filter((c) => !(childrenByParent[c.id]?.length ?? 0));

  return (
    <div className="relative" ref={containerRef}>
      <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-sm font-medium text-slate-600 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="flex shrink-0 items-center gap-1.5 font-bold text-slate-900"
        >
          Categories
          <svg viewBox="0 0 12 8" fill="none" className="h-2.5 w-2.5" aria-hidden>
            <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        {quickLinks.map((category) => {
          const hasHoverSubcategories = hoverCategories.includes(category.slug);
          const subcategories = childrenByParent[category.id] ?? [];
          const isHovered = hoverCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="relative shrink-0"
              onMouseEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                if (hasHoverSubcategories) {
                  setHoverCategoryId(category.id);
                }
              }}
              onMouseLeave={() => {
                hoverTimerRef.current = setTimeout(() => {
                  setHoverCategoryId(null);
                }, 200);
              }}
            >
              <Link
                href={`/c/${category.slug}`}
                className={`whitespace-nowrap transition ${
                  isHovered ? "text-orange-600 font-medium" : "hover:text-orange-600"
                }`}
              >
                {category.name}
              </Link>

              {hasHoverSubcategories && isHovered && subcategories.length > 0 && (
                <div
                  className="absolute left-0 top-full z-40 mt-1 min-w-max rounded-md border border-slate-200 bg-white shadow-lg"
                  onMouseEnter={() => {
                    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                  }}
                  onMouseLeave={() => {
                    hoverTimerRef.current = setTimeout(() => {
                      setHoverCategoryId(null);
                    }, 200);
                  }}
                >
                  <div className="max-h-96 overflow-y-auto p-3">
                    <ul className="space-y-1">
                      {subcategories.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/c/${sub.slug}`}
                            onClick={() => setHoverCategoryId(null)}
                            className="block rounded px-3 py-2 text-sm text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-30 border-t border-slate-200 bg-white shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
            <div className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 p-2 md:w-56 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-3">
              {topLevelCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/c/${category.slug}`}
                  onMouseEnter={() => setActiveId(category.id)}
                  onClick={() => setIsOpen(false)}
                  className={`shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
                    activeId === category.id
                      ? "bg-orange-50 font-semibold text-orange-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="min-w-0 flex-1 overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] p-5">
              {groups.length === 0 && flatItems.length === 0 ? (
                <p className="text-sm text-slate-500">Browse this category from the sidebar link.</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                  {flatItems.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Browse</p>
                      <ul className="mt-2 space-y-1.5">
                        {flatItems.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/c/${item.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="text-sm text-slate-600 transition hover:text-orange-600"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {groups.map((group) => (
                    <div key={group.id}>
                      <Link
                        href={`/c/${group.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-bold text-slate-900 transition hover:text-orange-600"
                      >
                        {group.name}
                      </Link>
                      <ul className="mt-2 space-y-1.5">
                        {(childrenByParent[group.id] ?? []).map((leaf) => (
                          <li key={leaf.id}>
                            <Link
                              href={`/c/${leaf.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="text-sm text-slate-600 transition hover:text-orange-600"
                            >
                              {leaf.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
