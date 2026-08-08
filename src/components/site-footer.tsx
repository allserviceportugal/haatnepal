export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="text-xl font-black text-slate-900">Haat Nepal</div>
          <p className="mt-3 text-slate-600">
            The online marketplace built for everyday buying, selling, and discovery across Nepal.
          </p>
        </div>
        <div>
          <div className="font-bold uppercase tracking-[0.14em] text-slate-800">Browse</div>
          <ul className="mt-3 space-y-2">
            <li>Vehicles</li>
            <li>Real Estate</li>
            <li>Jobs</li>
            <li>Services</li>
          </ul>
        </div>
        <div>
          <div className="font-bold uppercase tracking-[0.14em] text-slate-800">Company</div>
          <ul className="mt-3 space-y-2">
            <li>About</li>
            <li>Careers</li>
            <li>Advertise</li>
            <li>Support</li>
          </ul>
        </div>
        <div>
          <div className="font-bold uppercase tracking-[0.14em] text-slate-800">Contact</div>
          <ul className="mt-3 space-y-2">
            <li>hello@haatnepal.com</li>
            <li>+977 9800000000</li>
            <li>Kathmandu, Nepal</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
