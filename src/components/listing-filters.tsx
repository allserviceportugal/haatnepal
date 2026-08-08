import { NEPAL_DISTRICTS } from "@/lib/constants/locations";

export function ListingFilters({
  formAction,
  defaultValues,
}: {
  formAction: string;
  defaultValues: {
    q?: string;
    subcategory?: string;
    district?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
}) {
  return (
    <form
      method="get"
      action={formAction}
      className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
    >
      {defaultValues.subcategory && (
        <input type="hidden" name="subcategory" value={defaultValues.subcategory} />
      )}
      <div className="lg:col-span-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Keyword
        </label>
        <input
          type="text"
          name="q"
          defaultValue={defaultValues.q}
          placeholder="Search listings..."
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          District
        </label>
        <select
          name="district"
          defaultValue={defaultValues.district ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
        >
          <option value="">All districts</option>
          {NEPAL_DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Condition
        </label>
        <select
          name="condition"
          defaultValue={defaultValues.condition ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
        >
          <option value="">Any</option>
          <option value="new">New</option>
          <option value="used">Used</option>
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Min NPR
          </label>
          <input
            type="number"
            name="minPrice"
            min={0}
            defaultValue={defaultValues.minPrice}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Max NPR
          </label>
          <input
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={defaultValues.maxPrice}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
          />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Sort
          </label>
          <select
            name="sort"
            defaultValue={defaultValues.sort ?? "newest"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
