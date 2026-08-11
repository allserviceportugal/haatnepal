export const metadata = {
  title: "Contact Us - Haat Nepal",
  description: "Get in touch with Haat Nepal team. We're here to help.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Contact Us</h1>
          <p className="text-lg text-slate-600">We're here to help. Reach out anytime.</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">📧 Email</h2>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-slate-900">General Inquiries</p>
                  <a href="mailto:hello@haatnepal.com" className="text-orange-600 hover:underline">
                    hello@haatnepal.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Customer Support</p>
                  <a href="mailto:support@haatnepal.com" className="text-orange-600 hover:underline">
                    support@haatnepal.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Seller Support</p>
                  <a href="mailto:seller@haatnepal.com" className="text-orange-600 hover:underline">
                    seller@haatnepal.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Safety & Abuse</p>
                  <a href="mailto:safety@haatnepal.com" className="text-orange-600 hover:underline">
                    safety@haatnepal.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Legal & Disputes</p>
                  <a href="mailto:disputes@haatnepal.com" className="text-orange-600 hover:underline">
                    disputes@haatnepal.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Privacy Questions</p>
                  <a href="mailto:privacy@haatnepal.com" className="text-orange-600 hover:underline">
                    privacy@haatnepal.com
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">📞 Phone</h2>
              <div>
                <p className="text-lg font-semibold text-slate-900">+977 1-4123456</p>
                <p className="mt-1 text-slate-600">Monday - Friday: 6am - 10pm NPT</p>
                <p className="text-slate-600">Saturday - Sunday: 8am - 8pm NPT</p>
                <p className="mt-3 text-sm text-slate-600">Response time: Typically within 2-4 hours during business hours.</p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">📍 Office Location</h2>
              <div>
                <p className="text-slate-900">Haat Nepal</p>
                <p className="text-slate-600">Kathmandu, Nepal</p>
                <p className="mt-3 text-sm text-slate-600">
                  We currently operate as a digital-first marketplace with team members across Nepal. Visit our office by appointment.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">🌐 Social Media</h2>
              <div className="flex gap-4">
                <a href="#" className="text-slate-600 hover:text-orange-600">Facebook</a>
                <a href="#" className="text-slate-600 hover:text-orange-600">Twitter/X</a>
                <a href="#" className="text-slate-600 hover:text-orange-600">Instagram</a>
                <a href="#" className="text-slate-600 hover:text-orange-600">LinkedIn</a>
              </div>
            </section>
          </div>

          {/* Contact Form */}
          <div>
            <div className="rounded-lg bg-orange-50 p-8">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Send us a message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-900">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-900">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none"
                    placeholder="+977 9800000000"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-900">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select a topic</option>
                    <option value="buyer_support">Buyer Support</option>
                    <option value="seller_support">Seller Support</option>
                    <option value="dispute">Dispute/Return</option>
                    <option value="safety">Safety Issue</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-900">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-orange-500 focus:outline-none"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-md bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 focus:outline-none"
                >
                  Send Message
                </button>
              </form>

              <p className="mt-4 text-xs text-slate-600">
                We'll respond within 24 hours during business days. For urgent issues, call us directly.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-12 rounded-lg bg-slate-50 p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="mb-6 text-slate-600">
            Before contacting us, check our <a href="/faq" className="font-semibold text-orange-600 hover:underline">FAQ page</a> — you might find the answer you're looking for.
          </p>
          <div className="space-y-3">
            <a href="/faq" className="block text-orange-600 hover:underline">
              How do I create an account and start buying/selling?
            </a>
            <a href="/faq" className="block text-orange-600 hover:underline">
              What should I do if I have a problem with my order?
            </a>
            <a href="/faq" className="block text-orange-600 hover:underline">
              How does Buyer Protection work?
            </a>
            <a href="/faq" className="block text-orange-600 hover:underline">
              What payment methods do you accept?
            </a>
          </div>
        </div>

        {/* Support Channels */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-6">
            <h3 className="mb-2 text-lg font-bold text-slate-900">💬 Live Chat</h3>
            <p className="text-sm text-slate-600">
              Chat with our support team directly on the website during business hours.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-6">
            <h3 className="mb-2 text-lg font-bold text-slate-900">📱 In-App Support</h3>
            <p className="text-sm text-slate-600">
              Use the help button in your account for quick access to support and FAQs.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-6">
            <h3 className="mb-2 text-lg font-bold text-slate-900">🔗 Social Media</h3>
            <p className="text-sm text-slate-600">
              Message us on Facebook or Twitter for quick responses during business hours.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
