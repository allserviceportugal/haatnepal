import Link from "next/link";

export const metadata = {
  title: "Blog - Haat Nepal",
  description: "Latest news, articles, and insights from Haat Nepal marketplace.",
};

// Sample blog articles - can be replaced with database queries
const articles = [
  {
    id: "guide-buying-online-safely",
    title: "Complete Guide to Buying Online Safely on Haat Nepal",
    excerpt: "Learn best practices for protecting yourself while shopping online. From verifying sellers to secure payment methods.",
    content: `Online shopping is convenient, but safety should always come first. Here are essential tips to protect yourself on Haat Nepal:

## Verify Seller Information
Always check seller ratings, response time, and reviews before making a purchase. Look for the verification badge.

## Use Secure Payment Methods
Choose payment options provided by Haat Nepal (eSewa, Khalti, bank transfer). Never send money outside the platform.

## Inspect Items Carefully
For local pickups, meet in public places and inspect items thoroughly. Test electronics and verify authenticity.

## Check Buyer Protection
Every transaction is covered by Buyer Protection. Understand what's covered and how to file claims if needed.

## Communication Best Practices
Keep all communication on Haat Nepal. This creates a record if disputes arise. Ask detailed questions about items.

By following these guidelines, you can shop confidently and safely on Haat Nepal.`,
    author: "Haat Nepal Team",
    date: "2026-08-11",
    category: "Safety",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: "selling-electronics-tips",
    title: "5 Tips for Selling Electronics Successfully",
    excerpt: "Best practices for photographing, describing, and pricing electronics to attract serious buyers.",
    content: `Selling electronics requires attention to detail. Here's how to maximize your sales:

## 1. High-Quality Photos
Use good lighting and show the device from multiple angles. Include close-ups of the screen, buttons, and any damage.

## 2. Accurate Descriptions
Clearly state the model, age, condition, and any defects. Include original box and accessories if available.

## 3. Fair Pricing
Research similar items to price competitively. Price slightly lower than retail for used items.

## 4. Quick Response
Answer buyer questions within 2 hours. This builds trust and increases sales.

## 5. Secure Packaging
Use appropriate padding and bubble wrap. Include IMEI or serial numbers for verification.

Electronics sell faster when presented professionally and honestly.`,
    author: "Seller Tips",
    date: "2026-08-10",
    category: "Selling",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: "nepal-marketplace-growth",
    title: "Nepal's Online Marketplace is Growing - Here's Why",
    excerpt: "E-commerce in Nepal is booming. Discover the trends driving marketplace growth and what it means for buyers and sellers.",
    content: `Nepal's digital marketplace is experiencing unprecedented growth. Here are the key drivers:

## Increased Internet Access
More Nepali people have smartphones and internet access, making online shopping more accessible.

## Convenience Factor
Online shopping saves time and effort compared to traditional shopping methods.

## Trust in Digital Payments
eSewa and Khalti adoption has made online payments safer and more convenient for Nepalis.

## Local Alternatives
Platforms like Haat Nepal offer Nepal-specific features and support, preferred over foreign platforms.

## Economic Opportunity
Marketplace selling provides income opportunities for individuals and small businesses.

The future of commerce in Nepal is digital. Haat Nepal is leading this transformation.`,
    author: "Market Analysis",
    date: "2026-08-09",
    category: "News",
    readTime: "6 min read",
    featured: true,
  },
];

export default function BlogPage() {
  const featuredArticles = articles.filter((a) => a.featured);
  const recentArticles = articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Haat Nepal Blog</h1>
          <p className="text-lg text-slate-600">News, tips, and insights for buyers and sellers on Nepal's marketplace</p>
        </div>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-slate-900">Featured Articles</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.id}`}
                  className="group overflow-hidden rounded-lg border border-slate-200 transition hover:shadow-lg"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                        {article.category}
                      </span>
                      <span className="text-xs text-slate-500">{article.date}</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-orange-600">
                      {article.title}
                    </h3>
                    <p className="mb-4 text-slate-600">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{article.readTime}</span>
                      <span className="text-orange-600 transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">Latest Articles</h2>
          <div className="space-y-6">
            {recentArticles.map((article) => (
              <article
                key={article.id}
                className="flex gap-6 rounded-lg border border-slate-200 p-6 transition hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-500">{article.date}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{article.readTime}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    <Link href={`/blog/${article.id}`} className="hover:text-orange-600">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mb-3 text-slate-600">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">By {article.author}</span>
                    <Link href={`/blog/${article.id}`} className="text-orange-600 hover:text-orange-700">
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-orange-50 py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-slate-900">Stay Updated</h2>
            <p className="mb-6 text-slate-600">Subscribe to our newsletter for tips, marketplace news, and exclusive offers.</p>
            <form className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">We respect your privacy. No spam, ever.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
