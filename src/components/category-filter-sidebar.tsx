import Link from "next/link";
import { NEPAL_DISTRICTS } from "@/lib/constants/locations";
import type { Category, CategoryAttribute } from "@/lib/supabase/types";

type FilterValues = {
  q?: string;
  subcategory?: string;
  district?: string;
  condition?: string;
  sellerType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  [key: string]: string | undefined;
};

export function CategoryFilterSidebar({
  formAction,
  defaultValues,
  categorySlug,
  categoryName,
  subcategories,
  attributes,
}: {
  formAction: string;
  defaultValues: FilterValues;
  categorySlug?: string;
  categoryName?: string;
  subcategories?: Category[];
  attributes?: CategoryAttribute[];
}) {
  const selectAttributes = (attributes ?? []).filter((a) => a.input_type === "select");

  return (
    <aside className="space-y-4">
      {subcategories && subcategories.length > 0 && categorySlug && (
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Subcategories</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link
              href={`/c/${categorySlug}`}
              className={`rounded-md px-2 py-1.5 text-sm transition ${
                !defaultValues.subcategory
                  ? "bg-orange-50 font-semibold text-orange-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              All {categoryName}
            </Link>
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/c/${categorySlug}?subcategory=${subcategory.slug}`}
                className={`rounded-md px-2 py-1.5 text-sm transition ${
                  defaultValues.subcategory === subcategory.slug
                    ? "bg-orange-50 font-semibold text-orange-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {subcategory.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <form
        method="get"
        action={formAction}
        className="space-y-5 rounded-md border border-slate-200 bg-white p-4"
      >
        {defaultValues.subcategory && (
          <input type="hidden" name="subcategory" value={defaultValues.subcategory} />
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Keyword</p>
          <input
            type="text"
            name="q"
            defaultValue={defaultValues.q}
            placeholder="Search listings..."
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
          />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">District</p>
          <select
            name="district"
            defaultValue={defaultValues.district ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
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
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Condition</p>
          <div className="mt-2 space-y-1.5">
            {[
              { value: "", label: "Any" },
              { value: "new", label: "New" },
              { value: "used", label: "Used" },
            ].map((option) => (
              <label key={option.label} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="radio"
                  name="condition"
                  value={option.value}
                  defaultChecked={(defaultValues.condition ?? "") === option.value}
                  className="h-3.5 w-3.5"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Sold by</p>
          <div className="mt-2 space-y-1.5">
            {[
              { value: "", label: "Anyone" },
              { value: "individual", label: "Private person" },
              { value: "business", label: "Business" },
            ].map((option) => (
              <label key={option.label} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="radio"
                  name="sellerType"
                  value={option.value}
                  defaultChecked={(defaultValues.sellerType ?? "") === option.value}
                  className="h-3.5 w-3.5"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Price (NPR)</p>
          <div className="mt-2 flex gap-2">
            <input
              type="number"
              name="minPrice"
              min={0}
              placeholder="Min"
              defaultValue={defaultValues.minPrice}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
            />
            <input
              type="number"
              name="maxPrice"
              min={0}
              placeholder="Max"
              defaultValue={defaultValues.maxPrice}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Sort</p>
          <select
            name="sort"
            defaultValue={defaultValues.sort ?? "newest"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {selectAttributes.map((attribute) => {
          const fieldName = `attr_${attribute.id}`;
          const currentValue = defaultValues[fieldName] ?? "";

          return (
            <div key={attribute.id} className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{attribute.label}</p>
              <div className="mt-2 space-y-1.5">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="radio"
                    name={fieldName}
                    value=""
                    defaultChecked={!currentValue}
                    className="h-3.5 w-3.5"
                  />
                  Any
                </label>
                {(attribute.options ?? []).map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name={fieldName}
                      value={option}
                      defaultChecked={currentValue === option}
                      className="h-3.5 w-3.5"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
        >
          Apply filters
        </button>
      </form>
    </aside>
  );
}
