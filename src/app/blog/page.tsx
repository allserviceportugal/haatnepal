"use client";

import Link from "next/link";
import { useState } from "react";

const categories = [
  { id: "consumer", name: "Consumer", icon: "🛍️", color: "blue" },
  { id: "business", name: "Business", icon: "💼", color: "purple" },
  { id: "shopping-tips", name: "Shopping Tips", icon: "💡", color: "emerald" },
  { id: "selling-guides", name: "Selling Guides", icon: "📦", color: "orange" },
  { id: "market-news", name: "Market News", icon: "📰", color: "red" },
  { id: "safety", name: "Safety & Trust", icon: "🔒", color: "amber" },
];

const articles = [
  {
    id: "buying-guide-smartphones",
    title: "The Ultimate Smartphone Buying Guide for Nepal",
    excerpt: "Learn what to look for when buying smartphones on Haat Nepal. Compare features, check authenticity, and get the best deal.",
    category: "shopping-tips",
    author: "Haat Nepal Team",
    date: "2026-08-11",
    readTime: "7 min",
    featured: true,
  },
  {
    id: "start-ecommerce-business",
    title: "How to Start an E-Commerce Business in Nepal",
    excerpt: "Complete roadmap for entrepreneurs: from product selection to scaling your online store on Haat Nepal.",
    category: "business",
    author: "Business Desk",
    date: "2026-08-11",
    readTime: "10 min",
    featured: true,
  },
  {
    id: "fashion-trends-august",
    title: "Fashion Trends This August: What's Hot in Nepal",
    excerpt: "Discover the latest fashion trends that are dominating Nepal's marketplace. Style tips from local fashion experts.",
    category: "consumer",
    author: "Fashion Editor",
    date: "2026-08-10",
    readTime: "6 min",
    featured: false,
  },
  {
    id: "safe-payment-methods",
    title: "Safe Payment Methods on Haat Nepal",
    excerpt: "Understanding eSewa, Khalti, and bank transfers. Which payment method is safest for you?",
    category: "safety",
    author: "Trust & Safety",
    date: "2026-08-10",
    readTime: "5 min",
    featured: false,
  },
  {
    id: "photography-tips-listings",
    title: "Master Product Photography: Sell 50% More",
    excerpt: "Professional tips for photographing products to attract buyers. Lighting, angles, and editing secrets.",
    category: "selling-guides",
    author: "Seller Experts",
    date: "2026-08-09",
    readTime: "8 min",
    featured: false,
  },
  {
    id: "real-estate-market-nepal",
    title: "Nepal's Real Estate Market Boom: What Investors Should Know",
    excerpt: "Analysis of property market trends in major cities. Price predictions and investment opportunities.",
    category: "market-news",
    author: "Market Analysis",
    date: "2026-08-09",
    readTime: "9 min",
    featured: false,
  },
  {
    id: "negotiate-like-pro",
    title: "Negotiation Skills: Get Better Deals Every Time",
    excerpt: "Psychology-backed negotiation tips for buyers. How to get discounts and best prices on used items.",
    category: "shopping-tips",
    author: "Consumer Tips",
    date: "2026-08-08",
    readTime: "6 min",
    featured: false,
  },
  {
    id: "seller-monthly-income",
    title: "Top Sellers Earning 100K+ Per Month - Their Strategies",
    excerpt: "Real stories from successful Haat Nepal sellers. Learn their inventory management and customer service secrets.",
    category: "business",
    author: "Success Stories",
    date: "2026-08-08",
    readTime: "7 min",
    featured: false,
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribeMessage, setSubscribeMessage] = useState("");

  const filteredArticles = selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  const featuredArticles = articles.filter((a) => a.featured);

  const categoryColorMap = {
    consumer: "blue",
    business: "purple",
    "shopping-tips": "emerald",
    "selling-guides": "orange",
    "market-news": "red",
    safety: "amber",
  };

  const getCategoryColor = (category: string) => {
    return categoryColorMap[category as keyof typeof categoryColorMap] || "slate";
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.icon || "📚";
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-5xl font-black">Haat Nepal Blog</h1>
          <p className="text-xl text-orange-50">Tips, trends, and stories from Nepal's #1 marketplace</p>
        </div>
      </div>

      {/* Featured Articles Carousel */}
      {featuredArticles.length > 0 && (
        <section className="border-b border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-black text-slate-900">✨ Featured Stories</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredArticles.map((article) => {
                const color = getCategoryColor(article.category);
                const colorClasses: Record<string, string> = {
                  blue: "from-blue-500 to-blue-600",
                  purple: "from-purple-500 to-purple-600",
                  emerald: "from-emerald-500 to-emerald-600",
                  orange: "from-orange-500 to-orange-600",
                  red: "from-red-500 to-red-600",
                  amber: "from-amber-500 to-amber-600",
                  slate: "from-slate-500 to-slate-600",
                };

                return (
                  <Link
                    key={article.id}
                    href={`/blog/${article.id}`}
                    className="group overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-lg transition hover:shadow-2xl"
                  >
                    <div className={`bg-gradient-to-br ${colorClasses[color]} p-8 text-white`}>
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-3xl">{getCategoryIcon(article.category)}</span>
                        <div>
                          <p className="text-sm font-semibold opacity-90">
                            {categories.find((c) => c.id === article.category)?.name}
                          </p>
                          <p className="text-xs opacity-75">{article.date}</p>
                        </div>
                      </div>
                      <h3 className="mb-3 text-2xl font-black group-hover:underline">{article.title}</h3>
                      <p className="mb-6 text-sm opacity-90">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold opacity-75">📖 {article.readTime}</span>
                        <span className="text-lg transition group-hover:translate-x-2">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Browse by Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full rounded-lg px-4 py-3 text-left font-semibold transition ${
                      selectedCategory === null
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    }`}
                  >
                    All Articles ({articles.length})
                  </button>

                  {categories.map((cat) => {
                    const count = articles.filter((a) => a.category === cat.id).length;
                    const isSelected = selectedCategory === cat.id;
                    const colorBg = {
                      blue: "bg-blue-50 hover:bg-blue-100",
                      purple: "bg-purple-50 hover:bg-purple-100",
                      emerald: "bg-emerald-50 hover:bg-emerald-100",
                      orange: "bg-orange-50 hover:bg-orange-100",
                      red: "bg-red-50 hover:bg-red-100",
                      amber: "bg-amber-50 hover:bg-amber-100",
                    };

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full rounded-lg px-4 py-3 text-left transition ${
                          isSelected
                            ? "border-2 border-orange-500 bg-orange-50 font-semibold text-orange-900"
                            : `${colorBg[cat.color as keyof typeof colorBg]} font-medium text-slate-700`
                        }`}
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                        <span className="ml-2 text-xs opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : "All Articles"}
              </h2>
              <span className="text-sm font-semibold text-slate-600">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-6">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => {
                  const color = getCategoryColor(article.category);
                  const categoryColors: Record<string, string> = {
                    blue: "text-blue-700 bg-blue-50 border-blue-200",
                    purple: "text-purple-700 bg-purple-50 border-purple-200",
                    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
                    orange: "text-orange-700 bg-orange-50 border-orange-200",
                    red: "text-red-700 bg-red-50 border-red-200",
                    amber: "text-amber-700 bg-amber-50 border-amber-200",
                    slate: "text-slate-700 bg-slate-50 border-slate-200",
                  };

                  return (
                    <Link
                      key={article.id}
                      href={`/blog/${article.id}`}
                      className="group flex gap-6 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-orange-300 hover:shadow-lg"
                    >
                      {/* Icon/Placeholder */}
                      <div className="hidden flex-shrink-0 sm:block">
                        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-4xl">
                          {getCategoryIcon(article.category)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 border text-xs font-semibold ${
                              categoryColors[color] || categoryColors.slate
                            }`}
                          >
                            {getCategoryIcon(article.category)}
                            {categories.find((c) => c.id === article.category)?.name}
                          </span>
                          <span className="text-xs text-slate-500">📅 {article.date}</span>
                          <span className="text-xs text-slate-500">📖 {article.readTime}</span>
                        </div>

                        <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-orange-600">
                          {article.title}
                        </h3>

                        <p className="mb-4 line-clamp-2 text-slate-600">{article.excerpt}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">By {article.author}</span>
                          <span className="text-orange-600 transition group-hover:translate-x-1">
                            Read more →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
                  <p className="text-slate-600">No articles in this category yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-orange-50 to-red-50 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-10 shadow-xl">
            <h2 className="mb-2 text-3xl font-black text-slate-900">📬 Stay in the Loop</h2>
            <p className="mb-8 text-slate-600">
              Get the latest marketplace tips, seller strategies, and shopping hacks delivered to your inbox.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email) return;

                setSubscribeStatus("loading");
                try {
                  const response = await fetch("/api/newsletter/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });

                  const data = await response.json();

                  if (response.ok) {
                    setSubscribeStatus("success");
                    setSubscribeMessage("✓ Successfully subscribed! Check your email.");
                    setEmail("");
                    setTimeout(() => setSubscribeStatus("idle"), 5000);
                  } else {
                    setSubscribeStatus("error");
                    setSubscribeMessage(data.error || "Failed to subscribe. Try again!");
                    setTimeout(() => setSubscribeStatus("idle"), 5000);
                  }
                } catch (error) {
                  setSubscribeStatus("error");
                  setSubscribeMessage("Something went wrong. Please try again!");
                  setTimeout(() => setSubscribeStatus("idle"), 5000);
                }
              }}
              className="flex flex-col gap-3 sm:flex-row sm:gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribeStatus === "loading"}
                className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={subscribeStatus === "loading" || !email}
                className="rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-8 py-3 font-bold text-white transition hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribeStatus === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {subscribeMessage && (
              <p
                className={`mt-3 text-sm font-semibold ${
                  subscribeStatus === "success" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {subscribeMessage}
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">✓ We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
