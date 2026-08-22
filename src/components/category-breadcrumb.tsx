import Link from "next/link";
import type { CategoryCrumb } from "@/lib/queries/listings";

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-slate-300"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

type Props = {
  path: CategoryCrumb[];
  /**
   * When true the last crumb is rendered as plain text (you are already there).
   * Listing pages leave it false so the leaf category stays clickable.
   */
  currentIsLeaf?: boolean;
  className?: string;
};

export function CategoryBreadcrumb({ path, currentIsLeaf = false, className = "" }: Props) {
  if (path.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-xs font-semibold text-slate-500">
        <li className="shrink-0">
          <Link href="/" className="transition hover:text-orange-600">
            Home
          </Link>
        </li>
        {path.map((crumb, index) => {
          const isLast = index === path.length - 1;
          return (
            <li key={crumb.id} className="flex shrink-0 items-center gap-1.5">
              <ChevronIcon />
              {isLast && currentIsLeaf ? (
                <span aria-current="page" className="text-slate-900">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={`/c/${crumb.slug}`}
                  className={
                    isLast
                      ? "text-orange-600 transition hover:text-orange-700"
                      : "transition hover:text-orange-600"
                  }
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
