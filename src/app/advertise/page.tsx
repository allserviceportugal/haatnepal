export const metadata = {
  title: "Advertise on Haat Nepal",
  description: "Reach millions of buyers and sellers on Nepal's fastest-growing marketplace.",
};

const adOptions = [
  {
    id: 1,
    title: "Sponsored Listings",
    icon: "📍",
    description: "Boost your listing visibility with sponsored placement",
    features: ["Higher visibility in search", "Featured badge", "Priority placement", "Flexible campaign duration"],
  },
  {
    id: 2,
    title: "Category Banner Ads",
    icon: "🎯",
    description: "Advertise directly on category pages",
    features: ["High-traffic placement", "Targeted audience", "Custom creative", "Performance tracking"],
  },
  {
    id: 3,
    title: "Seller Storefront Featured",
    icon: "🏪",
    description: "Get your seller profile featured prominently",
    features: ["Featured seller badge", "Homepage placement", "Increased visibility", "Flexible campaign duration"],
  },
  {
    id: 4,
    title: "Keyword Bidding",
    icon: "🔍",
    description: "Bid on popular search terms",
    features: ["Targeted traffic", "Performance-based", "Real-time tracking", "Performance analytics"],
  },
  {
    id: 5,
    title: "Homepage Featured",
    icon: "⭐",
    description: "Featured placement on Haat Nepal homepage",
    features: ["Maximum visibility", "All Nepal audience", "Premium placement", "Performance guaranteed"],
  },
  {
    id: 6,
    title: "Email Newsletter Ads",
    icon: "📧",
    description: "Reach active users via our email newsletter",
    features: ["Subscriber targeting", "High engagement", "Custom creative", "Performance tracking"],
  },
];

const successStories = [
  {
    name: "Tech Hub Nepal",
    category: "Electronics",
    result: "300% increase in sales",
    description: "Used sponsored listings and homepage ads to reach more buyers",
  },
  {
    name: "Fashion Forward",
    category: "Fashion",
    result: "500+ new customers",
    description: "Category banner ads helped establish brand presence",
  },
  {
    name: "Real Estate Pro",
    category: "Real Estate",
    result: "40% faster sales",
    description: "Keyword bidding strategy attracted serious buyers",
  },
];

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold">Reach Millions on Haat Nepal</h1>
          <p className="mb-8 text-lg">Grow your business with targeted advertising on Nepal's #1 marketplace</p>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-md bg-white px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-50">
              Get Started
            </button>
            <button className="rounded-md border-2 border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:bg-opacity-10">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">5M+</div>
              <p className="text-slate-600">Monthly Visitors</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">50K+</div>
              <p className="text-slate-600">Active Sellers</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">500K+</div>
              <p className="text-slate-600">Listings</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-orange-600">15+</div>
              <p className="text-slate-600">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advertising Options */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Advertising Options</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {adOptions.map((option) => (
              <div key={option.id} className="flex flex-col rounded-lg border border-slate-200 p-8 transition hover:shadow-lg">
                <div className="mb-4 text-5xl">{option.icon}</div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{option.title}</h3>
                <p className="mb-4 text-slate-600">{option.description}</p>
                <ul className="mb-6 flex-1 space-y-2">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-orange-600">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-slate-200 pt-4">
                  <a
                    href="mailto:advertising@haatnepal.com"
                    className="block w-full rounded-md bg-orange-600 px-4 py-2 text-center font-semibold text-white transition hover:bg-orange-700"
                  >
                    Contact for Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                1
              </div>
              <h3 className="mb-2 font-bold text-slate-900">Choose Plan</h3>
              <p className="text-slate-600">Select the advertising option that fits your goals</p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                2
              </div>
              <h3 className="mb-2 font-bold text-slate-900">Create Campaign</h3>
              <p className="text-slate-600">Set your budget, targeting, and creative assets</p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                3
              </div>
              <h3 className="mb-2 font-bold text-slate-900">Go Live</h3>
              <p className="text-slate-600">Your ads appear across Haat Nepal platform</p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                4
              </div>
              <h3 className="mb-2 font-bold text-slate-900">Track Results</h3>
              <p className="text-slate-600">Monitor performance and ROI in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Success Stories</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {successStories.map((story, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100 p-8">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900">{story.name}</h3>
                  <p className="text-sm text-slate-600">{story.category}</p>
                </div>
                <p className="mb-4 text-2xl font-bold text-orange-600">{story.result}</p>
                <p className="text-slate-700">{story.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">Ready to Grow Your Business?</h2>
          <p className="mb-8 text-lg text-slate-600">
            Contact our advertising team to discuss the right strategy for your goals.
          </p>
          <a
            href="mailto:advertising@haatnepal.com"
            className="inline-block rounded-md bg-orange-600 px-8 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            Contact advertising@haatnepal.com
          </a>
        </div>
      </section>
    </main>
  );
}
