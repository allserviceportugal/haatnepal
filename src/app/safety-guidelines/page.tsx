export const metadata = {
  title: "Safety Guidelines - Haat Nepal",
  description: "Safety tips and guidelines for buying and selling safely on Haat Nepal.",
};

export default function SafetyGuidelinesPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Safety Guidelines</h1>
          <p className="text-slate-600">Protect yourself while buying and selling on Haat Nepal</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">🛡️ For All Users</h2>
            <p className="font-semibold">Account Security:</p>
            <ul className="mt-3 space-y-2">
              <li>• Use a strong, unique password (at least 12 characters, mix of letters, numbers, symbols)</li>
              <li>• Never share your password, recovery codes, or OTP with anyone</li>
              <li>• Enable two-factor authentication (2FA) on your account</li>
              <li>• Log out after using Haat Nepal, especially on shared devices</li>
              <li>• Beware of phishing emails asking for passwords or bank info (Haat Nepal never asks for these)</li>
              <li>• Use a secure, updated browser and device</li>
              <li>• Keep your email address and phone number up-to-date</li>
            </ul>
            <p className="mt-4 font-semibold">Personal Information:</p>
            <ul className="mt-3 space-y-2">
              <li>• Share phone number and address only during checkout or delivery</li>
              <li>• Never share government ID details before transaction is confirmed</li>
              <li>• Be cautious about sharing full address on public listings</li>
              <li>• Avoid posting personal details (SSN, passport number) in messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">👤 For Buyers</h2>
            <p className="font-semibold">Before You Buy:</p>
            <ul className="mt-3 space-y-2">
              <li>• Review seller's rating and feedback history</li>
              <li>• Check if seller is verified (check for verification badge)</li>
              <li>• Read listing carefully; check photos, description, and condition</li>
              <li>• Ask questions in the Platform (messages are recorded)</li>
              <li>• Be skeptical of prices too good to be true</li>
              <li>• Check seller's other listings for consistency</li>
              <li>• Avoid messages asking you to pay outside Haat Nepal</li>
            </ul>
            <p className="mt-4 font-semibold">Payment Safety:</p>
            <ul className="mt-3 space-y-2">
              <li>• Always pay through Haat Nepal (eSewa, Khalti, bank transfer, COD when available)</li>
              <li>• Never send cash, mobile money, or hawala without protection</li>
              <li>• Avoid deposits or advance payments unless you trust the seller</li>
              <li>• Never send payment for delivery; couriers collect upon delivery</li>
              <li>• Use Buyer Protection — it covers your payment</li>
              <li>• Report unauthorized charges to your payment provider immediately</li>
            </ul>
            <p className="mt-4 font-semibold">For Local Pickup:</p>
            <ul className="mt-3 space-y-2">
              <li>• Meet in safe, public locations (busy markets, police stations, malls)</li>
              <li>• Bring a trusted friend or family member</li>
              <li>• Inspect item thoroughly before handing over money</li>
              <li>• Verify items are working (test electronics, check vehicles)</li>
              <li>• Don't meet late at night or in isolated areas</li>
              <li>• Use mobile banking or digital payments if possible (leaves record)</li>
              <li>• Inform someone about the meeting location and time</li>
              <li>• Trust your instincts; if something feels off, walk away</li>
            </ul>
            <p className="mt-4 font-semibold">For Courier Delivery:</p>
            <ul className="mt-3 space-y-2">
              <li>• Verify tracking number and keep proof of delivery</li>
              <li>• Inspect item upon delivery (open package safely)</li>
              <li>• Report damage or wrong item within 24 hours</li>
              <li>• Don't sign for items you haven't verified</li>
              <li>• Keep courier receipt for claims</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">📦 For Sellers</h2>
            <p className="font-semibold">Listing Best Practices:</p>
            <ul className="mt-3 space-y-2">
              <li>• Use photos of actual items (not stock photos)</li>
              <li>• Show item from multiple angles and zoom details</li>
              <li>• Disclose all defects, damage, or wear honestly</li>
              <li>• Avoid misleading or false descriptions</li>
              <li>• State clearly if item is used, refurbished, or "as-is"</li>
              <li>• Don't list prohibited items (weapons, drugs, stolen goods)</li>
              <li>• Include condition, age, and original box if applicable</li>
              <li>• Set realistic prices based on market value</li>
            </ul>
            <p className="mt-4 font-semibold">Communicating with Buyers:</p>
            <ul className="mt-3 space-y-2">
              <li>• Respond to messages promptly (within 24 hours)</li>
              <li>• Keep all communication on Haat Nepal (shows good faith)</li>
              <li>• Be honest about condition, defects, and shipping times</li>
              <li>• Agree on terms (price, delivery, condition) before confirming</li>
              <li>• Don't ask buyers to pay outside Haat Nepal</li>
              <li>• Document agreements in messages for dispute protection</li>
            </ul>
            <p className="mt-4 font-semibold">Handling Payments:</p>
            <ul className="mt-3 space-y-2">
              <li>• Only accept payment through Haat Nepal platform</li>
              <li>• Confirm payment received before shipping item</li>
              <li>• Keep transaction records for disputes</li>
              <li>• Be aware of payment fraud and confirm funds are cleared</li>
              <li>• Don't ship without confirmed payment</li>
            </ul>
            <p className="mt-4 font-semibold">Shipping & Packing:</p>
            <ul className="mt-3 space-y-2">
              <li>• Pack securely to prevent damage in transit</li>
              <li>• Use original boxes or sturdy alternatives</li>
              <li>• Add padding for fragile items</li>
              <li>• Include packing slip with order details inside</li>
              <li>• Ship within 2 days of confirmed payment</li>
              <li>• Use Haat Nepal partner couriers for protection</li>
              <li>• Keep proof of courier handover (receipt, photo)</li>
              <li>• Provide tracking number to buyer immediately</li>
            </ul>
            <p className="mt-4 font-semibold">Handling Returns & Disputes:</p>
            <ul className="mt-3 space-y-2">
              <li>• Be fair to buyers with legitimate complaints</li>
              <li>• Document item condition before shipping (photos, videos)</li>
              <li>• Respond to return requests within 3 days</li>
              <li>• Accept reasonable returns to build trust and ratings</li>
              <li>• Provide evidence if you believe a claim is false</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">🚨 Red Flags to Avoid</h2>
            <p className="font-semibold">Potential Scams:</p>
            <ul className="mt-3 space-y-2">
              <li>❌ Seller asking for payment outside Haat Nepal</li>
              <li>❌ Price extremely below market value (too good to be true)</li>
              <li>❌ Seller with no history or ratings</li>
              <li>❌ Seller asking for deposit to reserve item (not standard)</li>
              <li>❌ Photos that look copied or from internet (reverse image search)</li>
              <li>❌ Seller asking you to pay return shipping upfront</li>
              <li>❌ Urgent pressure to complete transaction ("Last one, decide now")</li>
              <li>❌ Seller asking for your bank details directly</li>
              <li>❌ Messages from "representatives" asking for passwords or OTP</li>
              <li>❌ Seller offers to ship before payment clears</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">📞 High-Risk Items</h2>
            <p>
              Exercise extra caution with these categories:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Electronics:</strong> Verify IMEI, serial numbers, authenticity before accepting</li>
              <li>• <strong>Vehicles:</strong> Check registration, test drive, inspect with mechanic, verify ownership</li>
              <li>• <strong>Property:</strong> Verify legal documents, land title, ownership, no encumbrances</li>
              <li>• <strong>Gold/Jewelry:</strong> Verify purity (hallmark), weight, authenticity by professional</li>
              <li>• <strong>Branded Goods:</strong> Check authenticity tags, serial numbers, holograms</li>
              <li>• <strong>Medicines:</strong> Verify expiry date, packaging, prescription items legal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">🆘 Report Safety Issues</h2>
            <p>
              If you encounter suspicious activity, fraud, or safety concerns:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Click "Report Abuse" on the listing or user profile</li>
              <li>• Email abuse details to <span className="font-semibold">safety@haatnepal.com</span></li>
              <li>• Include messages, photos, and transaction details</li>
              <li>• Haat Nepal will investigate and take action</li>
              <li>• Report to police if criminal activity (fraud, theft, threats)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">💡 General Safety Tips</h2>
            <ul className="mt-3 space-y-2">
              <li>• Trust your gut feeling — if something seems wrong, it probably is</li>
              <li>• Always communicate through Haat Nepal (leaves a record)</li>
              <li>• Use Buyer Protection for every transaction</li>
              <li>• Keep screenshots and records of important messages</li>
              <li>• Never share OTP, passwords, or recovery codes</li>
              <li>• Use secure payments and avoid cash for high-value items</li>
              <li>• Verify seller identity and history before large transactions</li>
              <li>• Be especially careful with first-time sellers</li>
              <li>• Report suspicious sellers to help protect community</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">📋 Dispute Resolution</h2>
            <p>
              If you experience a scam or fraud:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Contact Haat Nepal support immediately with evidence</li>
              <li>Open a Buyer Protection claim on your order</li>
              <li>Provide messages, transaction records, and proof</li>
              <li>Haat Nepal will investigate and help recover your money</li>
              <li>Report to police if amount is significant or crime is involved</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">Contact for Safety Issues</h2>
            <div className="mt-3 space-y-1">
              <p>Email: <span className="font-semibold">safety@haatnepal.com</span></p>
              <p>Phone: <span className="font-semibold">+977 1-4123456</span></p>
              <p>Or use the "Report Abuse" button on any listing</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
