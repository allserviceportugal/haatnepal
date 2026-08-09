"use client";

import { useActionState, useMemo, useState } from "react";
import { NEPAL_DISTRICTS } from "@/lib/constants/locations";
import { ImageUploader } from "./image-uploader";
import type { ListingActionState } from "@/lib/actions/listings";
import type { Category, CategoryAttribute, DeliveryCourier, Listing } from "@/lib/supabase/types";

type Props = {
  action: (prevState: ListingActionState, formData: FormData) => Promise<ListingActionState>;
  categories: Category[];
  categoryAttributes: CategoryAttribute[];
  couriers: DeliveryCourier[];
  userId: string;
  defaultValues?: Partial<Listing> & {
    attributeValues?: Record<string, string>;
    courierIds?: string[];
  };
  submitLabel: string;
};

export function ListingForm({
  action,
  categories,
  categoryAttributes,
  couriers,
  userId,
  defaultValues,
  submitLabel,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, {});

  const topLevelCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);

  // Build the initial category path (breadcrumb of IDs from root to leaf).
  const buildCategoryPath = (leafId: string | null) => {
    if (!leafId) return [];
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const path: string[] = [];
    let currentId: string | null = leafId;
    while (currentId) {
      path.unshift(currentId);
      currentId = categoryMap.get(currentId)?.parent_id ?? null;
    }
    return path;
  };

  const initialCategoryPath = buildCategoryPath(defaultValues?.category_id ?? null);

  // Cascade state: array of selected category IDs at each level.
  const [categoryPath, setCategoryPath] = useState<string[]>(initialCategoryPath);

  // Build the cascading levels. For each level, if there are children for the current selection, render a new select.
  const categoryLevels = useMemo(() => {
    const levels: { id: string; options: typeof categories; selected: string }[] = [];
    let currentParentId: string | null = null;

    // Helper: get children of a given parent ID.
    const getChildren = (parentId: string | null) =>
      categories.filter((c) => c.parent_id === parentId);

    // Level 0: top-level categories (no parent)
    const topLevel = getChildren(null);
    levels.push({
      id: "level-0",
      options: topLevel,
      selected: categoryPath[0] ?? "",
    });

    // Level N: walk down the path, adding a level for each selection that has children.
    for (let i = 0; i < categoryPath.length; i++) {
      currentParentId = categoryPath[i];
      const children = getChildren(currentParentId);
      if (children.length === 0) break; // leaf node, no more levels
      levels.push({
        id: `level-${i + 1}`,
        options: children,
        selected: categoryPath[i + 1] ?? "",
      });
    }

    return levels;
  }, [categoryPath, categories]);

  // The effective category is the last selected one in the path.
  const effectiveCategoryId = categoryPath[categoryPath.length - 1] ?? "";

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Walk up from the chosen (sub)category to the nearest ancestor that has
  // attributes defined, so a specific leaf like "Desktop Computers" gets its
  // own fields while a leaf nobody has curated yet (e.g. "Cars") still shows
  // its department's generic fields (Brand/Model/Year/...).
  const resolvedAttributeCategoryId = useMemo(() => {
    let currentId: string | null = effectiveCategoryId || null;
    while (currentId) {
      const hasAttrs = categoryAttributes.some((a) => a.category_id === currentId);
      if (hasAttrs) return currentId;
      currentId = categoriesById.get(currentId)?.parent_id ?? null;
    }
    return null;
  }, [effectiveCategoryId, categoryAttributes, categoriesById]);

  const attributesForCategory = resolvedAttributeCategoryId
    ? categoryAttributes.filter((a) => a.category_id === resolvedAttributeCategoryId)
    : [];
  const sourceCategoryName = resolvedAttributeCategoryId
    ? categoriesById.get(resolvedAttributeCategoryId)?.name
    : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <input type="hidden" name="categoryId" value={effectiveCategoryId} />

      <div>
        <label className="block text-sm font-semibold text-slate-700">Title</label>
        <input
          name="title"
          defaultValue={defaultValues?.title}
          required
          minLength={5}
          maxLength={120}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          placeholder="e.g. Toyota Corolla 2019, automatic, excellent condition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Description</label>
        <textarea
          name="description"
          defaultValue={defaultValues?.description}
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          placeholder="Describe the condition, features, and reason for selling..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Price (NPR)</label>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.price}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          />
        </div>

        {categoryLevels.map((level, levelIndex) => (
          <div key={level.id}>
            <label className="block text-sm font-semibold text-slate-700">
              {levelIndex === 0 ? "Category" : `${levelIndex === 1 ? "Group" : "Subcategory"}`}
            </label>
            <select
              value={level.selected}
              onChange={(e) => {
                // Update the path: keep everything up to this level, replace at this level.
                const newPath = categoryPath.slice(0, levelIndex);
                if (e.target.value) {
                  newPath.push(e.target.value);
                }
                setCategoryPath(newPath);
              }}
              required={levelIndex === 0}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
            >
              <option value="">Select {levelIndex === 0 ? "a category" : "a subcategory"}</option>
              {level.options.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold text-slate-700">Condition</label>
          <select
            name="condition"
            defaultValue={defaultValues?.condition ?? "used"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Listing type</label>
          <select
            name="listingType"
            defaultValue={defaultValues?.listing_type ?? "classified"}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          >
            <option value="classified">Classified (negotiate in chat)</option>
            <option value="fixed_price">Fixed price (buy now)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">District</label>
          <select
            name="district"
            defaultValue={defaultValues?.district ?? ""}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          >
            <option value="">Select a district</option>
            {NEPAL_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">City / area (optional)</label>
          <input
            name="city"
            defaultValue={defaultValues?.city ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
            placeholder="e.g. Baneshwor"
          />
        </div>
      </div>

      {attributesForCategory.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            {sourceCategoryName} details
          </label>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {attributesForCategory.map((attribute) => {
              const fieldName = `attr_${attribute.id}`;
              const defaultValue = defaultValues?.attributeValues?.[attribute.id] ?? "";

              if (attribute.input_type === "select") {
                return (
                  <div key={attribute.id}>
                    <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                      {attribute.label}
                      {attribute.is_required && " *"}
                    </label>
                    <select
                      name={fieldName}
                      defaultValue={defaultValue}
                      required={attribute.is_required}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    >
                      <option value="">Select...</option>
                      {(attribute.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (attribute.input_type === "boolean") {
                return (
                  <label
                    key={attribute.id}
                    className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-1"
                  >
                    <input
                      type="checkbox"
                      name={fieldName}
                      defaultChecked={defaultValue === "true"}
                      value="true"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {attribute.label}
                  </label>
                );
              }

              return (
                <div key={attribute.id}>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    {attribute.label}
                    {attribute.is_required && " *"}
                  </label>
                  <input
                    type={attribute.input_type === "number" ? "number" : "text"}
                    name={fieldName}
                    defaultValue={defaultValue}
                    required={attribute.is_required}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">Delivery</label>
        <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="pickupAvailable"
            defaultChecked={defaultValues?.pickup_available ?? true}
            className="h-4 w-4 rounded border-slate-300"
          />
          Buyer can pick up in person
        </label>
        {couriers.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {couriers.map((courier) => (
              <label key={courier.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="courierIds"
                  value={courier.id}
                  defaultChecked={defaultValues?.courierIds?.includes(courier.id) ?? false}
                  className="h-4 w-4 rounded border-slate-300"
                />
                {courier.name} — NPR {courier.base_cost_npr}
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Photos</label>
        <div className="mt-2">
          <ImageUploader userId={userId} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !effectiveCategoryId}
        className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
