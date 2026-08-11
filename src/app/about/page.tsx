export const metadata = {
  title: "About Haat Nepal",
  description: "Learn about Haat Nepal, a modern marketplace for Nepal.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">About Haat Nepal</h1>
          <p className="text-lg text-slate-600">Connecting buyers and sellers across Nepal</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p>
              Haat Nepal is a modern digital marketplace built to empower individuals and businesses across Nepal. We combine the simplicity of peer-to-peer classifieds with the trust, safety, and convenience of structured e-commerce — enabling everyday Nepali people to buy, sell, and discover products and services easily.
            </p>
            <p className="mt-3">
              "Haat" (हाट) is the traditional Nepali word for a bazaar or marketplace — a place where communities gather to exchange goods and ideas. We've brought that community spirit to the digital age.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">What We Offer</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">For Buyers</h3>
                <ul className="mt-2 space-y-1">
                  <li>• Browse millions of listings across 15+ categories</li>
                  <li>• Discover everything from electronics to real estate</li>
                  <li>• Compare prices and find the best deals</li>
                  <li>• Shop with Buyer Protection for every transaction</li>
                  <li>• Track shipments and communicate securely with sellers</li>
                  <li>• Access free and verified sellers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">For Sellers</h3>
                <ul className="mt-2 space-y-1">
                  <li>• Reach millions of potential buyers across Nepal</li>
                  <li>• List items for free (individual accounts)</li>
                  <li>• Grow your business with tools and analytics</li>
                  <li>• Courier integration for easy shipping</li>
                  <li>• Build reputation through ratings and reviews</li>
                  <li>• Access professional seller tools and support</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Our Categories</h2>
            <p>
              Haat Nepal covers the full spectrum of commerce:
            </p>
            <ul className="mt-3 space-y-2">
              <li>🚗 <strong>Vehicles</strong> — Cars, motorcycles, bicycles, parts</li>
              <li>🏠 <strong>Real Estate</strong> — Property, land, apartments, rentals</li>
              <li>📱 <strong>Electronics</strong> — Phones, laptops, appliances, gadgets</li>
              <li>👕 <strong>Fashion</strong> — Clothing, shoes, accessories, jewelry</li>
              <li>💼 <strong>Business & Industrial</strong> — Equipment, tools, supplies</li>
              <li>🏥 <strong>Health & Beauty</strong> — Cosmetics, supplements, wellness</li>
              <li>📚 <strong>Education & Classes</strong> — Courses, tutoring, learning materials</li>
              <li>🛋️ <strong>Home & Garden</strong> — Furniture, decor, household items</li>
              <li>🎮 <strong>Hobbies & Sports</strong> — Games, books, sports equipment</li>
              <li>🐾 <strong>Pets & Animals</strong> — Pets, pet supplies, veterinary services</li>
              <li>💼 <strong>Jobs</strong> — Employment opportunities across Nepal</li>
              <li>🔧 <strong>Services</strong> — Professional services, freelance work</li>
              <li>🍔 <strong>Food & Beverages</strong> — Local foods, restaurants, catering</li>
              <li>🎵 <strong>Entertainment</strong> — Events, performances, media</li>
              <li>🆓 <strong>Free & Giveaways</strong> — Community sharing and giveaways</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Why Choose Haat Nepal?</h2>
            <div className="mt-4 space-y-3">
              <div className="flex gap-4">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Built for Nepal</h3>
                  <p className="text-slate-600">Designed specifically for the Nepali market, with local payment methods (eSewa, Khalti), Nepali courier partners, and support for Nepali languages.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">🛡️</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Buyer Protection</h3>
                  <p className="text-slate-600">Every transaction is protected by our Buyer Protection program, covering fraud, non-delivery, and misrepresentation.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">🔐</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Secure & Safe</h3>
                  <p className="text-slate-600">Industry-standard encryption, verified sellers, secure payment processing, and community moderation keep you safe.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Direct Communication</h3>
                  <p className="text-slate-600">Message sellers and buyers directly through the platform — no phone swapping or sketchy arrangements needed.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">🚚</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Nationwide Shipping</h3>
                  <p className="text-slate-600">Partner with trusted couriers across Nepal for reliable delivery to your doorstep.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-2xl">⭐</div>
                <div>
                  <h3 className="font-semibold text-slate-900">Community & Trust</h3>
                  <p className="text-slate-600">Build reputation through ratings, reviews, and verified seller badges — trust is our foundation.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Our Commitment</h2>
            <ul className="mt-3 space-y-3">
              <li>
                <strong>Fairness:</strong> We treat all users fairly, enforce clear rules, and resolve disputes impartially based on facts and policy.
              </li>
              <li>
                <strong>Transparency:</strong> Our terms, policies, and processes are clear and publicly available. You always know how Haat Nepal works.
              </li>
              <li>
                <strong>Security:</strong> We invest in technology and processes to protect your personal data, payments, and transactions.
              </li>
              <li>
                <strong>Community:</strong> We foster a positive, respectful community where millions of Nepali buyers and sellers can thrive.
              </li>
              <li>
                <strong>Innovation:</strong> We continuously improve our platform to make buying and selling easier, safer, and more rewarding.
              </li>
              <li>
                <strong>Compliance:</strong> We comply with all applicable Nepali laws and regulations, including consumer protection, data privacy, and telecommunications laws.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
            <div className="mt-4 space-y-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-slate-900">For Buyers</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Create a free account or sign in</li>
                  <li>Browse or search for items you want</li>
                  <li>Review listing details, photos, and seller info</li>
                  <li>Message seller if you have questions</li>
                  <li>Make payment through Haat Nepal securely</li>
                  <li>Track shipment or arrange pickup</li>
                  <li>Receive item and confirm satisfaction</li>
                  <li>Rate seller and leave review</li>
                </ol>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-slate-900">For Sellers</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Create a free account (individual) or paid account (business)</li>
                  <li>Add item details, photos, price, and condition</li>
                  <li>Set delivery options and shipping costs</li>
                  <li>Wait for interested buyers to message</li>
                  <li>Answer questions and negotiate if needed</li>
                  <li>Receive payment through Haat Nepal</li>
                  <li>Pack item securely and hand to courier</li>
                  <li>Share tracking number with buyer</li>
                  <li>Receive buyer rating and build reputation</li>
                </ol>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Our Team</h2>
            <p>
              Haat Nepal is built by a team of passionate entrepreneurs and engineers focused on creating a world-class marketplace for Nepal. We believe in the power of digital commerce to lift communities and create opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Get in Touch</h2>
            <p>
              Have questions, feedback, or want to partner with us?
            </p>
            <div className="mt-3 space-y-1">
              <p>Email: <span className="font-semibold">hello@haatnepal.com</span></p>
              <p>Phone: <span className="font-semibold">+977 1-4123456</span></p>
              <p>Address: <span className="font-semibold">Kathmandu, Nepal</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
