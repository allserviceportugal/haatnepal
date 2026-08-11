"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Branding */}
          <div className="lg:col-span-1">
            <div className="text-lg font-black text-orange-600">Haat Nepal</div>
            <p className="mt-2 text-xs text-slate-600">
              Nepal's trusted marketplace for buying, selling, and discovery.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="text-slate-400 hover:text-orange-600">
                <span className="sr-only">Facebook</span>f
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-600">
                <span className="sr-only">Twitter</span>𝕏
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-600">
                <span className="sr-only">Instagram</span>📷
              </a>
            </div>
          </div>

          {/* Browse Categories */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-900">Browse</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/c/vehicles" className="text-slate-600 hover:text-orange-600">Vehicles</Link></li>
              <li><Link href="/c/real-estate" className="text-slate-600 hover:text-orange-600">Real Estate</Link></li>
              <li><Link href="/c/electronics" className="text-slate-600 hover:text-orange-600">Electronics</Link></li>
              <li><Link href="/c/fashion" className="text-slate-600 hover:text-orange-600">Fashion</Link></li>
              <li><Link href="/c/jobs" className="text-slate-600 hover:text-orange-600">Jobs</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-900">Support</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/faq" className="text-slate-600 hover:text-orange-600">FAQ</Link></li>
              <li><Link href="/safety-guidelines" className="text-slate-600 hover:text-orange-600">Safety Tips</Link></li>
              <li><Link href="/contact" className="text-slate-600 hover:text-orange-600">Contact Us</Link></li>
              <li><Link href="/seller-guidelines" className="text-slate-600 hover:text-orange-600">Seller Guide</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-900">Trust & Safety</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/buyer-protection" className="text-slate-600 hover:text-orange-600">Buyer Protection</Link></li>
              <li><Link href="/returns-refunds" className="text-slate-600 hover:text-orange-600">Returns & Refunds</Link></li>
              <li><Link href="/shipping-delivery" className="text-slate-600 hover:text-orange-600">Shipping Policy</Link></li>
              <li><a href="mailto:safety@haatnepal.com" className="text-slate-600 hover:text-orange-600">Report Abuse</a></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-900">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/terms" className="text-slate-600 hover:text-orange-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-slate-600 hover:text-orange-600">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-slate-600 hover:text-orange-600">Cookies Policy</Link></li>
              <li><Link href="/disclaimer" className="text-slate-600 hover:text-orange-600">Disclaimer</Link></li>
            </ul>
          </div>

          {/* About & Company */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="text-slate-600 hover:text-orange-600">About Haat Nepal</Link></li>
              <li><Link href="/blog" className="text-slate-600 hover:text-orange-600">Blog</Link></li>
              <li><Link href="/advertise" className="text-slate-600 hover:text-orange-600">Advertise</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200"></div>

        {/* Contact Section */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <h4 className="font-semibold text-slate-900">📧 Email</h4>
            <p className="mt-1">
              <a href="mailto:hello@haatnepal.com" className="text-sm text-slate-600 hover:text-orange-600">
                hello@haatnepal.com
              </a>
            </p>
            <p className="mt-1">
              <a href="mailto:support@haatnepal.com" className="text-xs text-slate-600 hover:text-orange-600">
                support@haatnepal.com
              </a>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">📞 Phone</h4>
            <p className="mt-1 text-sm text-slate-600">+977 1-4123456</p>
            <p className="mt-1 text-xs text-slate-600">Mon-Fri, 6am-10pm NPT</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">📍 Location</h4>
            <p className="mt-1 text-sm text-slate-600">Kathmandu, Nepal</p>
            <p className="mt-1 text-xs text-slate-600">Serving all of Nepal</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              &copy; 2026 Haat Nepal. All rights reserved. | Compliant with Nepali Consumer Protection Act 2074 BS
            </p>
            <div className="flex gap-4 text-xs">
              <a href="/terms" className="text-slate-600 hover:text-orange-600">Terms</a>
              <a href="/privacy" className="text-slate-600 hover:text-orange-600">Privacy</a>
              <a href="/cookies" className="text-slate-600 hover:text-orange-600">Cookies</a>
              <a href="/disclaimer" className="text-slate-600 hover:text-orange-600">Disclaimer</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
