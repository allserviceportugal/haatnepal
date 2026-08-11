export const metadata = {
  title: "Shipping & Delivery Policy - Haat Nepal",
  description: "Shipping, delivery, and courier policies for Haat Nepal marketplace.",
};

export default function ShippingDeliveryPage() {
  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Shipping & Delivery Policy</h1>
          <p className="text-slate-600">Last updated: August 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">1. Overview</h2>
            <p>
              Haat Nepal works with trusted local couriers and delivery partners to ensure safe, timely delivery of items across Nepal. Both sellers and buyers are responsible for following these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">2. Delivery Options</h2>
            <p className="font-semibold">Sellers may offer:</p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Pickup (In-person):</strong> Buyer collects from seller's location</li>
              <li>• <strong>Courier Delivery:</strong> Nationwide delivery via Haat Nepal partner couriers</li>
              <li>• <strong>Local Delivery:</strong> Hand delivery within Kathmandu Valley or specific districts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">3. Delivery Timeline</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">Standard Delivery</h3>
                <p className="mt-2">3-7 business days within Kathmandu Valley; 5-10 days for other districts</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Express Delivery (where available)</h3>
                <p className="mt-2">Next-day delivery within Kathmandu Valley (surcharge applies)</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Remote Areas</h3>
                <p className="mt-2">15+ days; some very remote areas may not be serviceable</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">4. Delivery Costs</h2>
            <p>
              Sellers set delivery costs or may offer free delivery. Costs are clearly displayed before checkout. Common rates:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Kathmandu Valley: NPR 100-300</li>
              <li>• Nearby districts (Bhaktapur, Lalitpur): NPR 200-500</li>
              <li>• Central Nepal (Pokhara, Janakpur): NPR 500-1,500</li>
              <li>• Far/Remote areas: NPR 1,500-5,000+</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">5. Seller Responsibilities</h2>
            <p>Sellers must:</p>
            <ul className="mt-3 space-y-2">
              <li>• Pack items securely to prevent damage in transit</li>
              <li>• Use original or appropriate packaging for fragile items</li>
              <li>• Include packing slip or invoice inside the package</li>
              <li>• Provide accurate address and contact information</li>
              <li>• Hand over item to courier within 2 days of confirmed order</li>
              <li>• Provide buyer with tracking number via Platform or SMS</li>
              <li>• Keep proof of courier handover (receipt/photo)</li>
              <li>• For valuable items, consider insurance (at additional cost)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">6. Buyer Responsibilities</h2>
            <p>Buyers must:</p>
            <ul className="mt-3 space-y-2">
              <li>• Provide accurate, complete delivery address</li>
              <li>• Be available or designate someone to receive delivery</li>
              <li>• Inspect item immediately upon delivery (if possible)</li>
              <li>• Report damage or loss within 24 hours</li>
              <li>• Retain courier receipt and tracking number</li>
              <li>• Ensure address is reachable by courier (valid phone number, clear directions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">7. Tracking & Status</h2>
            <p>
              Buyers will receive tracking numbers and can monitor delivery status via:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Haat Nepal Platform (notifications)</li>
              <li>• SMS from courier partner</li>
              <li>• Courier's tracking website or app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">8. Lost or Damaged Items</h2>
            <p>
              If your item is lost or damaged in transit:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Report to Haat Nepal support within 24 hours with evidence</li>
              <li>Provide tracking number and courier receipt</li>
              <li>Haat Nepal will file a claim with the courier</li>
              <li>Courier investigation typically takes 5-10 business days</li>
              <li>If approved, compensation will be issued (up to declared item value, typically max NPR 50,000)</li>
            </ol>
            <p className="mt-3">
              Note: Couriers are not liable for unmarked, undeclared, or improperly packed items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">9. Special Items</h2>
            <p className="font-semibold">Electronics & Fragile Items:</p>
            <ul className="mt-3 space-y-2">
              <li>• Must be original box or sturdy packaging</li>
              <li>• Consider optional courier insurance</li>
              <li>• Document condition before shipping (photos)</li>
            </ul>
            <p className="mt-4 font-semibold">Oversized Items (Furniture, Appliances):</p>
            <ul className="mt-3 space-y-2">
              <li>• May require special pickup and delivery</li>
              <li>• Quote obtained from courier before acceptance</li>
              <li>• Higher costs and longer timelines typical</li>
            </ul>
            <p className="mt-4 font-semibold">Temperature-Sensitive (Food, Medicines):</p>
            <ul className="mt-3 space-y-2">
              <li>• Expedited/insulated packaging required</li>
              <li>• Express delivery recommended</li>
              <li>• Higher courier costs apply</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">10. Partner Couriers</h2>
            <p>
              Haat Nepal works with established couriers including Bikalpa Courier, DHL, FedEx, and local partners. Seller chooses courier at listing creation based on availability in buyer's area.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">11. Cancellation & Returns for Delivery</h2>
            <p>
              Once handed to courier, cancellation is difficult. Contact Haat Nepal support immediately if needed. Returns are governed by our Return & Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">12. Non-Delivery or Refusal</h2>
            <p>
              If buyer refuses or cannot receive delivery after 2-3 courier attempts:
            </p>
            <ul className="mt-3 space-y-2">
              <li>• Item returns to seller at buyer's cost</li>
              <li>• Seller may retain purchase amount or relist item</li>
              <li>• Haat Nepal will mediate if dispute arises</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">13. Contact & Support</h2>
            <p>
              For shipping issues or courier concerns, contact Haat Nepal support:
            </p>
            <div className="mt-3 space-y-1">
              <p>Email: <span className="font-semibold">support@haatnepal.com</span></p>
              <p>Phone: <span className="font-semibold">+977 1-4123456</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
