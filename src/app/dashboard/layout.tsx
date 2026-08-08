import Link from "next/link";

const tabs = [
  { href: "/dashboard/listings", label: "My listings" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/favorites", label: "Favorites" },
  { href: "/dashboard/plan", label: "Plan" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </main>
  );
}
