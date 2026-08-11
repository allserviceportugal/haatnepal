export const metadata = {
  title: "Cookies Policy - Haat Nepal",
  description: "Cookie policy and cookie management for Haat Nepal.",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Cookies Policy</h1>
          <p className="text-slate-600">Last updated: August 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device (computer, phone, tablet) when you visit a website. They contain information about your browsing activity and preferences. Cookies help websites remember you and improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">2. Why Haat Nepal Uses Cookies</h2>
            <p>
              We use cookies to:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Authenticate You:</strong> Remember your login so you don't have to enter credentials repeatedly</li>
              <li>• <strong>Store Preferences:</strong> Save your language, theme, and notification settings</li>
              <li>• <strong>Improve Experience:</strong> Track your activity to personalize recommendations and features</li>
              <li>• <strong>Analyze Usage:</strong> Understand how users browse Haat Nepal to make improvements</li>
              <li>• <strong>Security:</strong> Detect and prevent fraud or unauthorized access</li>
              <li>• <strong>Payment Processing:</strong> Maintain secure payment sessions</li>
              <li>• <strong>Advertising:</strong> Show relevant ads and measure advertising effectiveness (optional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">3. Types of Cookies We Use</h2>
            <p className="font-semibold">Session Cookies (Temporary)</p>
            <p className="mt-2">
              Deleted when you close your browser. Used to maintain your login session and temporary preferences.
            </p>
            <p className="mt-4 font-semibold">Persistent Cookies (Permanent)</p>
            <p className="mt-2">
              Stored on your device for weeks or months. Used to remember your preferences, saved searches, and login details.
            </p>
            <p className="mt-4 font-semibold">First-Party Cookies</p>
            <p className="mt-2">
              Set by Haat Nepal directly. Used for core functionality like authentication and preferences.
            </p>
            <p className="mt-4 font-semibold">Third-Party Cookies</p>
            <p className="mt-2">
              Set by partners (analytics, payment providers, ad networks). Used to improve services and track performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">4. Specific Cookies</h2>
            <p>
              Here are the main cookies Haat Nepal uses:
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Essential Cookies</h3>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>auth_token:</strong> Keeps you logged in (session cookie)</li>
                  <li>• <strong>csrf_token:</strong> Prevents unauthorized requests (security)</li>
                  <li>• <strong>session_id:</strong> Maintains your browsing session</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Functional Cookies</h3>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>language:</strong> Remembers your language preference (Nepali/English)</li>
                  <li>• <strong>theme:</strong> Stores light/dark mode preference</li>
                  <li>• <strong>search_history:</strong> Saves recent searches for quick access</li>
                  <li>• <strong>cart:</strong> Maintains your shopping cart during checkout</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Analytics Cookies</h3>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>google_analytics:</strong> Tracks usage patterns and page views</li>
                  <li>• <strong>visitor_id:</strong> Identifies unique visitors (anonymized)</li>
                  <li>• <strong>session_duration:</strong> Measures time spent on the site</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Advertising Cookies (Optional)</h3>
                <ul className="mt-2 space-y-1">
                  <li>• <strong>ad_preferences:</strong> Personalizes ads based on your interests</li>
                  <li>• <strong>campaign_id:</strong> Tracks which ads you see and click</li>
                  <li>• <strong>third_party_ads:</strong> Partners like Google show relevant ads</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">5. Managing Your Cookies</h2>
            <p className="font-semibold">Browser Settings</p>
            <p className="mt-2">
              Most browsers allow you to control cookies. You can:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Accept all cookies</li>
              <li>• Block all cookies</li>
              <li>• Allow only certain types of cookies</li>
              <li>• Clear existing cookies</li>
              <li>• Set specific sites to always block/allow cookies</li>
            </ul>
            <p className="mt-4">
              To manage cookies in your browser:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
              <li>• <strong>Safari:</strong> Preferences → Privacy → Manage Cookies</li>
              <li>• <strong>Edge:</strong> Settings → Privacy → Clear browsing data</li>
            </ul>
            <p className="mt-4 font-semibold">Haat Nepal Cookie Preferences</p>
            <p className="mt-2">
              When you first visit Haat Nepal, you're asked about cookie preferences. Click "Manage Preferences" anytime in Account Settings to change your choices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">6. Impact of Blocking Cookies</h2>
            <p>
              If you block cookies, some Haat Nepal features may not work:
            </p>
            <ul className="mt-3 space-y-2">
              <li>❌ You'll need to log in repeatedly</li>
              <li>❌ Your preferences won't be saved</li>
              <li>❌ Search history and favorites may not persist</li>
              <li>❌ Checkout may not function properly</li>
              <li>❌ Messaging and notifications may be affected</li>
            </ul>
            <p className="mt-3">
              <strong>Essential cookies cannot be disabled</strong> — they're needed for security and basic functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">7. Third-Party Cookies</h2>
            <p>
              Third-party services we use may set their own cookies:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Google Analytics:</strong> Measures traffic and user behavior</li>
              <li>• <strong>eSewa/Khalti:</strong> Process payments securely</li>
              <li>• <strong>Facebook Pixel:</strong> Tracks conversions for ads</li>
              <li>• <strong>Courier APIs:</strong> Track shipments</li>
            </ul>
            <p className="mt-3">
              We can't control third-party cookies. Review their privacy policies for details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">8. Data Privacy & Cookies</h2>
            <p>
              Cookies may contain personal information (like your user ID). We protect this data:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Cookies are encrypted during transmission</li>
              <li>• We never store passwords in cookies</li>
              <li>• Payment info is never stored in cookies</li>
              <li>• Sensitive data is kept on secure servers, not in cookies</li>
              <li>• Session tokens expire automatically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">9. Do Not Track (DNT)</h2>
            <p>
              Some browsers have a "Do Not Track" feature. Haat Nepal respects DNT signals:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• If DNT is enabled, we limit tracking cookies</li>
              <li>• Essential cookies still apply (login, security)</li>
              <li>• Analytics and advertising cookies are minimized</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">10. Cookie Retention</h2>
            <ul className="mt-3 space-y-2">
              <li>• Session cookies: Deleted when you close browser</li>
              <li>• Login cookies: 30 days (or until logout)</li>
              <li>• Preference cookies: 1 year</li>
              <li>• Analytics cookies: 13 months</li>
              <li>• Advertising cookies: Per partner's policy (typically 30-90 days)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">11. Your Cookie Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Consent to cookies before they're set (except essential)</li>
              <li>• Change your mind and withdraw consent anytime</li>
              <li>• Access what cookies are stored on your device</li>
              <li>• Delete cookies at any time</li>
              <li>• Request information about cookies used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">12. Changes to This Policy</h2>
            <p>
              We may update this Cookies Policy as technology or practices change. Changes become effective upon posting. Using Haat Nepal after changes means you accept them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">13. Contact Us</h2>
            <p>
              For questions about cookies or privacy:
            </p>
            <div className="mt-3 space-y-1">
              <p>Email: <span className="font-semibold">privacy@haatnepal.com</span></p>
              <p>Phone: <span className="font-semibold">+977 1-4123456</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
