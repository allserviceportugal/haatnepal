export const metadata = {
  title: "FAQ - Haat Nepal",
  description: "Frequently asked questions about Haat Nepal marketplace.",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account on Haat Nepal?",
          a: "Click 'Sign Up' at the top of the page. Enter your email, phone number, and password. Verify your email via the link sent to your inbox. You're ready to browse and list!"
        },
        {
          q: "Is it free to join Haat Nepal?",
          a: "Yes! Creating an account is completely free. Individual sellers get 5 free listings per month. Business sellers can upgrade to Pro or Custom plans for more features."
        },
        {
          q: "Do I need to provide my ID to join?",
          a: "No, not required to join. However, to sell or participate in transactions, you may need to verify your phone number. For high-value items or seller verification, government ID may be requested."
        },
        {
          q: "Can I use Haat Nepal on my phone?",
          a: "Yes! Haat Nepal works on desktop, tablet, and mobile browsers. We're also developing native apps for iOS and Android (coming soon)."
        }
      ]
    },
    {
      category: "Buying",
      questions: [
        {
          q: "How do I search for items?",
          a: "Use the search bar at the top, or browse categories. You can filter by price, condition, location, and delivery method. Save searches to get notified of new matching listings."
        },
        {
          q: "Can I negotiate the price?",
          a: "Yes! Message the seller to discuss price. Many sellers are open to negotiation, especially for higher-value items. Agree on a final price before confirming payment."
        },
        {
          q: "What payment methods are accepted?",
          a: "We accept eSewa, Khalti, bank transfers, and Cash on Delivery (COD) where available. All payments are processed securely through Haat Nepal."
        },
        {
          q: "What if I receive a damaged or wrong item?",
          a: "Report to Haat Nepal support within 24 hours with photos. File a claim through 'Open Dispute' on your order. We'll help recover your money or arrange a replacement."
        },
        {
          q: "Can I return an item I don't like?",
          a: "Return eligibility depends on the listing. Check the seller's return policy before buying. If item is damaged or misrepresented, you can return it. We cover returns for damaged items."
        },
        {
          q: "How long does delivery take?",
          a: "Typical delivery is 3-7 days in Kathmandu Valley, 5-10 days for other districts. Remote areas may take 15+ days. Check estimated delivery before confirming purchase."
        }
      ]
    },
    {
      category: "Selling",
      questions: [
        {
          q: "How do I list an item for sale?",
          a: "Log in, click 'Sell' or 'Post Listing', add photos, title, description, price, and delivery options. Review and publish. Your item goes live immediately."
        },
        {
          q: "How much does it cost to list items?",
          a: "Free! Individual accounts get 5 free listings per month. Business accounts get 10-100+ listings/month depending on plan. Premium listings cost extra for higher visibility."
        },
        {
          q: "What's the best way to take photos?",
          a: "Use good lighting, show item from multiple angles, zoom in on details/damage, show size reference, and use original packaging if applicable. Authentic photos get more inquiries."
        },
        {
          q: "What details should I include in my listing?",
          a: "Include condition, age, original price, any defects, dimensions, warranty status, and anything unique. Be honest — buyers trust detailed, transparent sellers."
        },
        {
          q: "Can I raise the price after listing?",
          a: "Yes, you can edit price anytime before item sells. Lower prices increase interest. Sudden large price increases may turn buyers away."
        },
        {
          q: "How do I handle shipping?",
          a: "Choose courier delivery, local delivery, or in-person pickup. Haat Nepal partners with couriers; we manage the logistics. You pack securely and hand to courier."
        },
        {
          q: "What if a buyer doesn't pay after agreeing?",
          a: "Contact the buyer through Haat Nepal messaging. If no response after 3 days, cancel the sale. Report repeated no-shows to support for action."
        },
        {
          q: "How do I get paid?",
          a: "Payments are held for 5 days after delivery to allow returns. Then funds are transferred to your registered bank account or eSewa/Khalti wallet."
        }
      ]
    },
    {
      category: "Safety & Trust",
      questions: [
        {
          q: "Is Haat Nepal safe?",
          a: "Yes. We use SSL encryption, vet sellers, enforce policies, mediate disputes, and provide Buyer Protection. Still, use common sense: meet in public, verify items, and avoid payment outside Haat Nepal."
        },
        {
          q: "What is Buyer Protection?",
          a: "Automatic coverage for every transaction. Covers items not delivered, counterfeit/fraud, damaged items, and misrepresentation. File claims through your order if issues occur."
        },
        {
          q: "How do I verify a seller?",
          a: "Check seller's feedback score, number of sales, response time, and reviews. Verified sellers have a badge. Avoid new sellers with no history for high-value items."
        },
        {
          q: "What should I do if I suspect fraud?",
          a: "Click 'Report Abuse' on listing/profile, or email safety@haatnepal.com with details. Include messages, photos, and transaction info. We investigate all reports."
        },
        {
          q: "How is my personal data protected?",
          a: "We use industry-standard encryption, secure servers, and comply with Nepali data protection laws. Never share passwords or OTP. Enable two-factor authentication."
        },
        {
          q: "Can I make purchases anonymously?",
          a: "Not fully, but we protect your privacy. Sellers see only name, phone, and address needed for delivery. Your email and payment info are protected."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I change my password?",
          a: "Go to Account Settings → Security → Change Password. Enter old password, then new password twice. Save changes."
        },
        {
          q: "How do I enable two-factor authentication (2FA)?",
          a: "Go to Account Settings → Security → Enable 2FA. Choose SMS or authenticator app. You'll need a code each time you sign in."
        },
        {
          q: "How do I delete my account?",
          a: "Go to Account Settings → Delete Account. You'll be asked to confirm. Active orders must be completed first. Your data will be retained per our Privacy Policy."
        },
        {
          q: "Can I have multiple accounts?",
          a: "Not recommended. Multiple accounts violate Terms of Service and may result in suspension. One account per person/business."
        },
        {
          q: "How do I upgrade to a Business seller account?",
          a: "Go to Account Settings → Seller Account → Upgrade. Choose Pro or Custom plan, complete payment, and gain business features."
        }
      ]
    },
    {
      category: "Categories & Listings",
      questions: [
        {
          q: "What categories are available?",
          a: "We have 15+ main categories: Vehicles, Real Estate, Electronics, Fashion, Business & Industrial, Health & Beauty, Education, Home & Garden, Hobbies, Pets, Jobs, Services, Food, Entertainment, and Free & Giveaways."
        },
        {
          q: "Can I list restricted items?",
          a: "No. Weapons, explosives, drugs, stolen goods, counterfeit items, and anything illegal are prohibited. Violators face account suspension and legal action."
        },
        {
          q: "How long does a listing stay active?",
          a: "Listings stay active for 90 days, then expire. You can re-list or renew anytime. Sold items are marked 'Sold' and archived."
        },
        {
          q: "Can I list items across multiple categories?",
          a: "Each listing is in one primary category. Choose the best fit. You can create separate listings for different items."
        }
      ]
    },
    {
      category: "Disputes & Returns",
      questions: [
        {
          q: "How long can I open a dispute after delivery?",
          a: "30 days from delivery date. Report immediately if issues occur (photos, messages). Delays make resolution harder."
        },
        {
          q: "What happens if seller and buyer can't agree?",
          a: "Haat Nepal mediates. Both submit evidence (photos, messages, proof). Our manager reviews and makes a binding decision based on policy and facts."
        },
        {
          q: "How long does dispute resolution take?",
          a: "Typically 5-10 business days. Negotiation takes 3 days, then Haat Nepal reviews. Complex cases may take longer."
        },
        {
          q: "Can I appeal a Haat Nepal decision?",
          a: "Yes, within 7 days with new evidence. A senior manager reviews appeals. If still unsatisfied, you can pursue legal remedies through Nepal Consumer Council."
        }
      ]
    },
    {
      category: "Payments & Refunds",
      questions: [
        {
          q: "When do I get refunded?",
          a: "Refunds are issued 5-7 business days after Haat Nepal approves your claim. Banks may take 1-3 days more to post."
        },
        {
          q: "What if my refund doesn't arrive?",
          a: "Contact your bank or payment provider first. If still missing after 10 days, email Haat Nepal support with transaction ID."
        },
        {
          q: "Can I cancel an order after payment?",
          a: "If item hasn't shipped, contact seller immediately to cancel. If already shipped, you can return it per the Return & Refund Policy."
        },
        {
          q: "Are there any transaction fees?",
          a: "Buyers don't pay fees. Sellers may pay a small commission on sales (varies by plan). Fees are clearly stated before listing."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          q: "Why can't I log in?",
          a: "Check your email/password spelling. Reset password if forgotten (click 'Forgot Password'). Verify email in inbox. Clear browser cache. Contact support if still stuck."
        },
        {
          q: "Why is my listing not showing?",
          a: "Listings need 5+ minutes to appear. Check category is correct. Verify you're logged in. If still hidden, it may violate policies — check email for details."
        },
        {
          q: "The site is loading slowly — what do I do?",
          a: "Refresh page, clear cache, try different browser. Check your internet connection. If issue persists, report to support@haatnepal.com."
        },
        {
          q: "I found a bug — how do I report it?",
          a: "Email support@haatnepal.com with details: what you were doing, what went wrong, device/browser, and screenshots. We'll investigate and fix."
        }
      ]
    },
    {
      category: "Contact & Support",
      questions: [
        {
          q: "How do I contact Haat Nepal support?",
          a: "Email support@haatnepal.com or call +977 1-4123456. Message us through the Platform's help section. We respond within 24 hours."
        },
        {
          q: "What are support hours?",
          a: "We provide support 6am-10pm Nepal time, 7 days a week. Urgent issues (fraud, unauthorized access) are prioritized 24/7."
        },
        {
          q: "Do you have a physical office?",
          a: "Yes! Visit us in Kathmandu. Address in footer. Call ahead to schedule a visit."
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Frequently Asked Questions</h1>
          <p className="text-slate-600">Find answers to common questions about Haat Nepal</p>
        </div>

        <div className="space-y-12">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="mb-6 text-2xl font-bold text-slate-900">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((item, idx) => (
                  <details key={idx} className="group rounded-lg border border-slate-200 p-4">
                    <summary className="cursor-pointer font-semibold text-slate-900 hover:text-orange-600">
                      {item.q}
                    </summary>
                    <p className="mt-3 text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-orange-50 p-6">
          <h2 className="mb-3 font-semibold text-slate-900">Didn't find your answer?</h2>
          <p className="text-slate-600">
            Our support team is here to help. Email <span className="font-semibold">support@haatnepal.com</span> or call{" "}
            <span className="font-semibold">+977 1-4123456</span> — we'll get back to you within 24 hours.
          </p>
        </div>
      </div>
    </main>
  );
}
