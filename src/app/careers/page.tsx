import Link from "next/link";

export const metadata = {
  title: "Careers - Haat Nepal",
  description: "Join the Haat Nepal team. We're hiring talented people to build Nepal's marketplace.",
};

const openPositions = [
  {
    id: 1,
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "We're looking for an experienced backend engineer to help scale our marketplace infrastructure.",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Lead product strategy for Nepal's fastest-growing marketplace. Drive features that matter to our users.",
  },
  {
    id: 3,
    title: "Customer Support Lead",
    department: "Support",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Build and lead our world-class customer support team. Champion the voice of our users.",
  },
  {
    id: 4,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Drive growth through creative marketing campaigns. Build brand awareness across Nepal.",
  },
  {
    id: 5,
    title: "Frontend Engineer (React/Next.js)",
    department: "Engineering",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Build beautiful, fast, and accessible user interfaces. Shape the marketplace experience.",
  },
  {
    id: 6,
    title: "Data Analyst",
    department: "Analytics",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Turn data into insights. Help us understand our marketplace and make data-driven decisions.",
  },
];

export default function CareersPage() {
  const departments = Array.from(new Set(openPositions.map((p) => p.department)));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-bold">Join the Haat Nepal Team</h1>
          <p className="mb-8 text-lg">Help us build Nepal's marketplace platform. We're looking for talented, passionate people.</p>
          <a
            href="#positions"
            className="inline-block rounded-md bg-white px-6 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            View Open Positions
          </a>
        </div>
      </div>

      {/* Why Join Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Why Work at Haat Nepal?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-8">
              <div className="mb-4 text-4xl">🚀</div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Impact & Growth</h3>
              <p className="text-slate-600">
                Work on a platform that's transforming how Nepali people buy and sell online. Your work directly impacts millions.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-8">
              <div className="mb-4 text-4xl">🌟</div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Talented Team</h3>
              <p className="text-slate-600">
                Work alongside experienced professionals from top tech companies. Learn, grow, and build amazing products together.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-8">
              <div className="mb-4 text-4xl">💰</div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Competitive Benefits</h3>
              <p className="text-slate-600">
                Competitive salary, health insurance, flexible working hours, professional development budget, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Open Positions</h2>

          {/* Filter by Department */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button className="rounded-full border-2 border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
              All ({openPositions.length})
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                className="rounded-full border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-500 hover:text-orange-600"
              >
                {dept} ({openPositions.filter((p) => p.department === dept).length})
              </button>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {openPositions.map((position) => (
              <div key={position.id} className="rounded-lg border border-slate-200 bg-white p-6 transition hover:shadow-md">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">{position.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>📍 {position.location}</span>
                      <span>•</span>
                      <span>{position.type}</span>
                      <span>•</span>
                      <span>{position.department}</span>
                    </div>
                  </div>
                  <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    Hiring
                  </span>
                </div>
                <p className="mb-4 text-slate-700">{position.description}</p>
                <button className="rounded-md bg-orange-600 px-6 py-2 font-semibold text-white transition hover:bg-orange-700">
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          {/* No More Positions Text */}
          <div className="mt-12 rounded-lg bg-white p-8 text-center">
            <p className="mb-4 text-slate-600">Don't see your dream role listed?</p>
            <a href="mailto:careers@haatnepal.com" className="text-orange-600 hover:text-orange-700">
              Send us your resume and we'll keep you in mind →
            </a>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Our Culture</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">We're Mission-Driven</h3>
              <p className="mb-6 text-slate-600">
                Everything we do is focused on our mission: making buying and selling safe, easy, and accessible for all Nepali people.
              </p>
              <h3 className="mb-4 text-xl font-bold text-slate-900">We Value Integrity</h3>
              <p className="text-slate-600">
                We build on trust. We're transparent, honest, and hold ourselves to high standards. This extends to everything we do.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">We Embrace Learning</h3>
              <p className="mb-6 text-slate-600">
                We invest in professional development. We want you to grow and take on new challenges. We support that journey.
              </p>
              <h3 className="mb-4 text-xl font-bold text-slate-900">We Celebrate Teamwork</h3>
              <p className="text-slate-600">
                Big problems require collaboration. We celebrate our wins together and support each other through challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-orange-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">Ready to Join Us?</h2>
          <p className="mb-8 text-lg text-slate-600">
            Send us your resume and tell us why you'd be a great fit for Haat Nepal.
          </p>
          <a
            href="mailto:careers@haatnepal.com"
            className="inline-block rounded-md bg-orange-600 px-8 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            Apply Today
          </a>
        </div>
      </section>
    </main>
  );
}
