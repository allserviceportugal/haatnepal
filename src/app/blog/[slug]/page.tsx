import Link from "next/link";
import { notFound } from "next/navigation";

const articles: Record<
  string,
  {
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    category: "consumer" | "business" | "shopping-tips" | "selling-guides" | "market-news" | "safety";
    readTime: string;
  }
> = {
  "buying-guide-smartphones": {
    title: "The Ultimate Smartphone Buying Guide for Nepal",
    excerpt:
      "Learn what to look for when buying smartphones on Haat Nepal. Compare features, check authenticity, and get the best deal.",
    content: `When buying a smartphone on Haat Nepal, there are several important factors to consider to ensure you get the best value and quality.

## Check the Device Condition

Look for clear descriptions of physical condition. Minor cosmetic damage might not affect functionality. Ask sellers about screen condition, battery health, and any hardware issues.

## Verify Authenticity

Request original box and accessories. Check IMEI numbers and serial numbers on manufacturer websites. Be wary of unusually cheap prices.

## Battery Health

For used phones, battery health is critical. Ask for battery percentage degradation. A phone with 80%+ battery health is ideal.

## Compare Specifications

Research the model's specs online. Compare processor, RAM, storage capacity, and camera quality. Newer models often have better value.

## Price Research

Check prices of the same model from multiple sellers. Don't rush into a deal - negotiate politely and compare offers.

## Payment & Safety

Use Haat Nepal's secure payment options. Meet sellers in public places. Test the phone thoroughly before completing the transaction.

## Return Policy

Understand Haat Nepal's buyer protection. Ask about return windows in case of defects.

By following these guidelines, you'll find the perfect smartphone within your budget!`,
    author: "Tech Expert",
    date: "2026-08-11",
    category: "shopping-tips",
    readTime: "7 min",
  },
  "start-ecommerce-business": {
    title: "How to Start an E-Commerce Business in Nepal",
    excerpt:
      "Complete roadmap for entrepreneurs: from product selection to scaling your online store on Haat Nepal.",
    content: `Starting an e-commerce business in Nepal has never been easier. Here's your complete roadmap to success.

## Step 1: Choose Your Niche

Select products you're passionate about and that have demand. Research trending categories on Haat Nepal. Consider your expertise and available capital.

## Step 2: Source Products

Find reliable suppliers. Build relationships with manufacturers or wholesalers. Start with products you can quality-check personally.

## Step 3: Set Up Your Haat Nepal Shop

Create a professional seller account. Write compelling product descriptions. Take high-quality photos. Set competitive prices.

## Step 4: Master Photography

Good photos increase sales by 50%. Use natural lighting. Show products from multiple angles. Include size comparisons and in-use photos.

## Step 5: Customer Service Excellence

Respond to inquiries within 2 hours. Be honest about product condition. Process orders quickly. Handle complaints professionally.

## Step 6: Build Your Brand

Develop consistent branding. Offer quality consistently. Get positive reviews and ratings. Create a memorable seller profile.

## Step 7: Scale Your Business

Once you have consistent sales, invest in inventory. Consider expanding to multiple categories. Use Haat Nepal's sponsored listings to boost visibility.

## Initial Investment

You can start with as little as 10,000-50,000 NPR depending on your product category. Focus on inventory that sells quickly.

## Common Mistakes to Avoid

Don't oversell inventory you don't have. Don't ignore customer messages. Don't compromise on quality to increase profits. Don't ignore reviews and feedback.

Success in e-commerce requires consistency, quality, and excellent customer service. Start small, learn, and scale gradually!`,
    author: "Entrepreneurship Coach",
    date: "2026-08-11",
    category: "business",
    readTime: "10 min",
  },
  "fashion-trends-august": {
    title: "Fashion Trends This August: What's Hot in Nepal",
    excerpt: "Discover the latest fashion trends that are dominating Nepal's marketplace. Style tips from local fashion experts.",
    content: `August fashion in Nepal blends comfort with style. Here are the trends setting the marketplace on fire.

## Oversized Everything

Oversized shirts, blazers, and sweaters are ruling the fashion world. They're comfortable and versatile. Pair them with fitted accessories for balance.

## Minimalist Whites

Neutral tones are timeless. White t-shirts, cream trousers, and beige sweaters are bestsellers. They work for any occasion.

## Vintage & Thrifted Pieces

Sustainable fashion is trending. Vintage jeans, classic leather jackets, and retro band tees are highly sought.

## Summer Pastels

Light pink, lavender, and mint green are perfect for Nepal's weather. These colors bring freshness to any wardrobe.

## Statement Accessories

Bold belts, chunky jewelry, and colorful scarves can transform basic outfits. Accessories are the quickest trend to shop.

## Comfort Footwear

Sneakers and loafers are dominating. Flip-flops and slides are great for casual outings. Comfort is no longer compromised.

## Layering Techniques

Layering adds depth to outfits. T-shirt over shirts, tank tops under dresses - mixing and matching is key.

## Where to Shop on Haat Nepal

Look for sellers specializing in sustainable fashion. Check ratings and photos carefully. Many boutique sellers offer unique pieces not found elsewhere.

Fashion is personal. Experiment with trends and find what makes you feel confident!`,
    author: "Fashion Blogger",
    date: "2026-08-10",
    category: "consumer",
    readTime: "6 min",
  },
  "safe-payment-methods": {
    title: "Safe Payment Methods on Haat Nepal",
    excerpt: "Understanding eSewa, Khalti, and bank transfers. Which payment method is safest for you?",
    content: `Choosing the right payment method protects your money. Here's your guide to safe payments on Haat Nepal.

## eSewa

eSewa is Nepal's most popular digital wallet. It's secure, convenient, and widely accepted. You can load money easily through banks or cash agents.

Pros: Fast transactions, cashback offers, good customer support
Cons: Must maintain minimum balance

## Khalti

Khalti is another major digital payment platform. It's user-friendly and offers rewards for frequent users.

Pros: Easy registration, good for quick payments, promotional offers
Cons: Smaller merchant network than eSewa

## Bank Transfer

Direct bank-to-bank transfer is safest for large purchases. It leaves a clear audit trail. However, it's slower.

Pros: Most secure, clear records, works for all amounts
Cons: Takes 1-2 days, requires account details

## Cash on Delivery

Perfect for local transactions. Meet in public places, inspect items thoroughly, and pay only after satisfaction.

Pros: See product before paying, complete control
Cons: Can't be used for shipping items nationwide

## Payment Safety Tips

- Always use Haat Nepal's payment gateway
- Never share OTPs or passwords
- Verify seller reputation before payment
- Keep transaction receipts
- Use trusted payment methods

## Disputed Payments

Haat Nepal's buyer protection covers most transactions. If issues arise, report immediately through the platform.

Choose the payment method that best suits your comfort level. All Haat Nepal-endorsed methods are secure!`,
    author: "Trust & Safety",
    date: "2026-08-10",
    category: "safety",
    readTime: "5 min",
  },
  "photography-tips-listings": {
    title: "Master Product Photography: Sell 50% More",
    excerpt: "Professional tips for photographing products to attract buyers. Lighting, angles, and editing secrets.",
    content: `Professional product photos can increase sales significantly. Here's how to master this essential skill.

## Lighting is Everything

Natural light is best. Shoot near windows during daytime. Avoid harsh shadows. Diffuse strong sunlight with thin white fabric. On cloudy days, natural light is perfectly diffused.

## Background Matters

Use simple, clean backgrounds. White, grey, or light backgrounds work best. They keep focus on the product. Avoid busy or distracting backgrounds.

## Multiple Angles

Show your product from all sides. Include close-ups of details. Show size context with a hand or common object. For clothing, show it on a model or mannequin.

## Use a Good Camera

Smartphone cameras are good enough. Clean the lens. Use portrait mode for depth. Avoid digital zoom; move closer instead.

## Composition Principles

Rule of thirds: Place objects off-center for better composition. Don't center everything. Create visual flow.

## Highlight Features

For electronics, show screens, buttons, and conditions clearly. For fashion, show texture and fabric quality. For furniture, show scale and details.

## Editing Basics

Adjust brightness and contrast. Crop unnecessary space. Enhance colors slightly but keep realism. Avoid over-editing.

## Video Content

Include 10-15 second videos. Show products from different angles. Demonstrate functionality. Videos increase buyer confidence.

## Common Mistakes

Don't use blurry photos. Don't oversaturate colors. Don't hide defects with angles. Don't use filters that misrepresent products.

Great photos directly translate to more inquiries and faster sales. Invest time in mastering this skill!`,
    author: "Seller Experts",
    date: "2026-08-09",
    category: "selling-guides",
    readTime: "8 min",
  },
  "real-estate-market-nepal": {
    title: "Nepal's Real Estate Market Boom: What Investors Should Know",
    excerpt:
      "Analysis of property market trends in major cities. Price predictions and investment opportunities.",
    content: `Nepal's real estate market is experiencing unprecedented growth. Here's what every investor should know.

## Market Overview

Property prices in Kathmandu have increased 20-30% over the past year. Affordable locations like Pokhara and Chitwan are emerging as hotspots. Commercial properties are gaining attention.

## Price Trends by Location

Kathmandu: Already expensive, steady appreciation. Look for properties outside Kathmandu valley for better ROI.

Pokhara: Rapid growth, tourism driving demand. Affordable compared to Kathmandu.

Chitwan: Agricultural land to residential conversion. Huge potential for long-term investment.

## Investment Types

Residential: Stable, steady returns, good for long-term holding.
Commercial: Higher returns, higher risk. Requires location analysis.
Agricultural: Long-term investment, often converted to residential.

## Key Factors for Investment

Location: Proximity to schools, hospitals, markets matters. Infrastructure development drives prices.

Connectivity: Good road access increases value. Proximity to highways is crucial.

Documentation: Always verify ownership documents. Be cautious of land disputes.

## Future Predictions

Urban development will continue. Satellite cities will grow. Infrastructure investment in province capitals will boost property values.

## Risks to Consider

Market saturation in some areas. Unclear property laws in certain regions. Natural disaster risks. Political instability affecting projects.

## Investment Strategy

Start with properties under development. Location is more important than size. Look for areas with infrastructure development planned. Be patient; real estate is long-term investment.

## Listing on Haat Nepal

Use clear descriptions with location details. Include photos of the surroundings. Mention proximity to key landmarks and amenities. Update prices regularly.

Now is a good time to invest in Nepal's real estate. Do thorough research before committing capital!`,
    author: "Real Estate Analyst",
    date: "2026-08-09",
    category: "market-news",
    readTime: "9 min",
  },
  "negotiate-like-pro": {
    title: "Negotiation Skills: Get Better Deals Every Time",
    excerpt:
      "Psychology-backed negotiation tips for buyers. How to get discounts and best prices on used items.",
    content: `Negotiation is an art. Master these skills to get better deals on every purchase.

## Do Your Research

Know the item's market value. Check multiple listings on Haat Nepal. Understand what similar items are selling for. This knowledge gives you negotiation power.

## Start with a Fair Offer

Don't insult sellers with unrealistic offers. Start 10-15% below asking price. This leaves room for negotiation while showing respect.

## Build Rapport

Be polite and respectful. Show genuine interest in the item. Compliment the condition if deserved. People give discounts to people they like.

## Ask Smart Questions

Ask about defects and honest condition issues. Ask why they're selling. Understanding motivation helps negotiations. Is the seller in a hurry?

## Provide Value Arguments

"If I buy today, you don't have to list again." "I'm a serious buyer." "Can you offer a discount for quick sale?"

## Bundle Products

Buying multiple items? Ask for bulk discounts. Sellers often reduce prices for multiple purchases.

## Use Silence

After making an offer, stay quiet. Silence creates pressure. The first person to speak often loses. Be patient.

## Know When to Walk Away

If the seller won't negotiate, move on. There are always other options. Walking away sometimes brings better offers.

## Payment Flexibility

Offering cash on spot increases negotiating power. Digital payments can also be leveraged: "I can pay immediately via eSewa."

## Common Negotiation Mistakes

Don't be rude or aggressive. Don't reveal your maximum price. Don't negotiate over text; voice/in-person is more effective.

## Practice Makes Perfect

Start negotiating on small purchases. Build confidence. Negotiation skills improve with practice.

Remember: Most sellers expect negotiation. It's part of the marketplace culture. Be respectful but confident!`,
    author: "Consumer Tips",
    date: "2026-08-08",
    category: "shopping-tips",
    readTime: "6 min",
  },
  "seller-monthly-income": {
    title: "Top Sellers Earning 100K+ Per Month - Their Strategies",
    excerpt:
      "Real stories from successful Haat Nepal sellers. Learn their inventory management and customer service secrets.",
    content: `What separates successful sellers from average ones? We interviewed top earners to find out.

## Strategy 1: Specialization

Successful sellers don't sell everything. They pick one category and become experts. "I focus only on electronics," says one 6-figure earner. "This builds trust and expertise."

## Strategy 2: Quality Over Quantity

Volume matters, but not at expense of quality. Top sellers maintain 4.8+ ratings. They'd rather make less profit per sale but get repeat customers.

## Strategy 3: Responsive Customer Service

"I reply to messages within 15 minutes," says a fashion seller earning 80K monthly. "Response time directly impacts conversion."

## Strategy 4: Professional Photography

One successful seller: "I invested in a good camera setup. Sales increased 40%." Professional photos convert browsers into buyers.

## Strategy 5: Inventory Management

Successful sellers maintain inventory of trending items. They monitor what's selling and adjust stock accordingly. They don't overstock slow items.

## Strategy 6: Competitive Pricing

"I price slightly below market average," shares a electronics seller. "Volume makes up for lower margins." This creates high velocity.

## Strategy 7: Understanding Seasons

Fashion sellers prep for seasons in advance. Electronics sales spike during festivals. Smart sellers anticipate demand and stock accordingly.

## Strategy 8: Building a Reputation

Consistent quality builds a personal brand. Sellers get repeat customers. Loyal customers buy multiple times, increasing lifetime value.

## Strategy 9: Sponsored Listings

High earners use Haat Nepal's promotional tools strategically. They test different strategies and scale what works. Ad spend is 5-10% of revenue.

## Strategy 10: Continuous Learning

Top sellers stay updated on market trends. They improve photography, product descriptions, and customer communication continuously.

## Common Mistakes to Avoid

Starting with too many categories. Compromising on quality for profit. Ignoring customer feedback. Not reinvesting profits into inventory growth.

## Starting Position

Most top sellers didn't reach 100K monthly overnight. They started small, learned, and scaled. Average time to 50K monthly: 6-12 months of consistent effort.

## Your Takeaway

Success comes from focus, quality, customer service, and consistency. Pick your category, master it, and scale systematically. Hard work and smart strategy create success on Haat Nepal!`,
    author: "Success Stories",
    date: "2026-08-08",
    category: "business",
    readTime: "7 min",
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
        <h2 key={idx} className="mb-4 mt-8 text-2xl font-bold text-slate-900">
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={idx} className="mb-3 mt-6 text-lg font-semibold text-slate-900">
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

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  consumer: { bg: "from-blue-500 to-blue-600", text: "text-blue-700 bg-blue-50", icon: "🛍️" },
  business: { bg: "from-purple-500 to-purple-600", text: "text-purple-700 bg-purple-50", icon: "💼" },
  "shopping-tips": { bg: "from-emerald-500 to-emerald-600", text: "text-emerald-700 bg-emerald-50", icon: "💡" },
  "selling-guides": { bg: "from-orange-500 to-orange-600", text: "text-orange-700 bg-orange-50", icon: "📦" },
  "market-news": { bg: "from-red-500 to-red-600", text: "text-red-700 bg-red-50", icon: "📰" },
  safety: { bg: "from-amber-500 to-amber-600", text: "text-amber-700 bg-amber-50", icon: "🔒" },
};

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];

  if (!article) {
    notFound();
  }

  const colors = categoryColors[article.category];
  const otherArticles = Object.entries(articles)
    .filter(([s]) => s !== slug && articles[s].category === article.category)
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            ← Back to Blog
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full ${colors.text} px-4 py-2 text-sm font-bold`}>
              {colors.icon} {article.category.replace(/-/g, " ").toUpperCase()}
            </span>
            <span className="text-sm font-semibold text-slate-500">📅 {article.date}</span>
            <span className="text-sm font-semibold text-slate-500">📖 {article.readTime}</span>
          </div>

          <h1 className="mb-4 text-5xl font-black text-slate-900">{article.title}</h1>
          <p className="text-xl text-slate-600">{article.excerpt}</p>

          <div className="mt-8 flex items-center gap-4 border-t border-b border-slate-200 py-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{article.author}</p>
              <p className="text-sm text-slate-500">Published {article.date}</p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-slate max-w-none mb-12">
          <div className="space-y-4 text-slate-700">{renderContent(article.content)}</div>
        </div>

        {/* Share Section */}
        <div className={`rounded-xl p-8 mb-12 bg-gradient-to-r ${colors.bg} text-white`}>
          <h3 className="mb-4 font-bold text-lg">Share this article</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://facebook.com/sharer/sharer.php?u=haatnepal.com/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white bg-opacity-20 px-4 py-2 font-semibold transition hover:bg-opacity-30"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=haatnepal.com/blog/${slug}&text=${article.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white bg-opacity-20 px-4 py-2 font-semibold transition hover:bg-opacity-30"
            >
              Twitter
            </a>
            <button
              onClick={() =>
                navigator.clipboard.writeText(`https://haatnepal.com/blog/${slug}`).then(() =>
                  alert("Link copied!")
                )
              }
              className="rounded-lg bg-white bg-opacity-20 px-4 py-2 font-semibold transition hover:bg-opacity-30"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {otherArticles.length > 0 && (
          <div className="border-t border-slate-200 pt-12">
            <h3 className="mb-8 text-3xl font-bold text-slate-900">More in {article.category.replace(/-/g, " ")}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {otherArticles.map(([articleSlug, art]) => (
                <Link
                  key={articleSlug}
                  href={`/blog/${articleSlug}`}
                  className="group rounded-lg border border-slate-200 p-6 transition hover:shadow-lg bg-white"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`inline-block ${colors.text} rounded px-2 py-1 text-xs font-bold`}>
                      {colors.icon} {article.category.replace(/-/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500">{art.date}</span>
                  </div>
                  <h4 className="mb-2 font-bold text-slate-900 group-hover:text-orange-600">{art.title}</h4>
                  <p className="line-clamp-2 text-sm text-slate-600">{art.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
