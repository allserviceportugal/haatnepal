import Link from "next/link";
import { notFound } from "next/navigation";

// Same article data as blog listing - in production, this would come from a database
const articles: Record<
  string,
  {
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
  }
> = {
  "guide-buying-online-safely": {
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
  },
  "selling-electronics-tips": {
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
  },
  "nepal-marketplace-growth": {
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
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} - Haat Nepal Blog`,
    description: article.excerpt,
  };
}

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({
    slug,
  }));
}

function renderContent(content: string) {
  return content.split("\n").map((line, idx) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={idx} className="mb-4 mt-6 text-xl font-bold text-slate-900">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={idx} className="mb-3 mt-4 text-lg font-semibold text-slate-900">
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={idx} className="ml-6 list-disc text-slate-700">
          {line.replace("- ", "")}
        </li>
      );
    }
    if (line.trim() === "") {
      return <div key={idx} className="mb-3" />;
    }
    return (
      <p key={idx} className="mb-4 text-slate-700 leading-relaxed">
        {line}
      </p>
    );
  });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-sm text-orange-600 hover:text-orange-700">
            ← Back to Blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
              {article.category}
            </span>
            <span className="text-sm text-slate-500">{article.date}</span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">{article.readTime}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900">{article.title}</h1>
          <p className="text-lg text-slate-600">{article.excerpt}</p>
          <div className="mt-6 flex items-center justify-between border-t border-b border-slate-200 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">By {article.author}</p>
              <p className="text-xs text-slate-500">Published on {article.date}</p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-slate max-w-none">
          <div className="space-y-4 text-slate-700">{renderContent(article.content)}</div>
        </div>

        {/* Article Footer */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="rounded-lg bg-orange-50 p-6">
            <h3 className="mb-2 font-semibold text-slate-900">Share this article</h3>
            <div className="flex gap-3">
              <button className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
                Share on Facebook
              </button>
              <button className="rounded-md bg-sky-400 px-4 py-2 text-sm text-white hover:bg-sky-500">
                Share on Twitter
              </button>
              <button className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800">
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="mb-6 text-2xl font-bold text-slate-900">More from the Blog</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(articles)
              .filter(([articleSlug]) => articleSlug !== slug)
              .slice(0, 2)
              .map(([articleSlug, art]) => (
                <Link
                  key={articleSlug}
                  href={`/blog/${articleSlug}`}
                  className="group rounded-lg border border-slate-200 p-6 transition hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block text-xs font-semibold text-slate-600">{art.category}</span>
                    <span className="text-xs text-slate-500">{art.date}</span>
                  </div>
                  <h4 className="mb-2 font-bold text-slate-900 group-hover:text-orange-600">{art.title}</h4>
                  <p className="text-sm text-slate-600">{art.excerpt}</p>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </main>
  );
}
