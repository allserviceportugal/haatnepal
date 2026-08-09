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
  const [registrationYear, setRegistrationYear] = useState<string>((defaultValues?.registration_year as any) ?? "");
  const [manufacturingYear, setManufacturingYear] = useState<string>((defaultValues?.manufacturing_year as any) ?? "");
  const [bluebookStatus, setBluebookStatus] = useState<string>((defaultValues?.bluebook_status as any) ?? "");
  const [importStatus, setImportStatus] = useState<string>((defaultValues?.import_status as any) ?? "");
  const [ownerCount, setOwnerCount] = useState<string>((defaultValues?.owner_count as any) ?? "");
  const [isModified, setIsModified] = useState<boolean>(defaultValues?.is_modified ?? false);
  const [accidentHistory, setAccidentHistory] = useState<boolean>(defaultValues?.accident_history ?? false);
  const [serviceHistory, setServiceHistory] = useState<string>((defaultValues?.service_history as any) ?? "");

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

  // Land area unit system (for real-estate listings)
  const [landUnitSystem, setLandUnitSystem] = useState<
    "ropani_system" | "bigha_system" | "sqft" | "sqm" | ""
  >((defaultValues?.land_unit_system as any) ?? "");

  // Salary period (for jobs)
  const [salaryPeriod, setSalaryPeriod] = useState<"monthly" | "yearly" | "hourly" | "daily" | "">(
    (defaultValues?.salary_period as any) ?? ""
  );

  // The effective category is the last selected one in the path.
  const effectiveCategoryId = categoryPath[categoryPath.length - 1] ?? "";

  // Helper: check if a category (or its ancestors) is in the real-estate tree
  const isRealEstateListing = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    let current = effectiveCategoryId ? categoryMap.get(effectiveCategoryId) : null;
    while (current) {
      if (current.slug === "real-estate") return true;
      current = current.parent_id ? categoryMap.get(current.parent_id) : null;
    }
    return false;
  }, [effectiveCategoryId, categories]);

  // Helper: check if a category (or its ancestors) is in the jobs tree
  const isJobsListing = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    let current = effectiveCategoryId ? categoryMap.get(effectiveCategoryId) : null;
    while (current) {
      if (current.slug === "jobs") return true;
      current = current.parent_id ? categoryMap.get(current.parent_id) : null;
    }
    return false;
  }, [effectiveCategoryId, categories]);

  // Helper: check if a category (or its ancestors) is in the vehicles tree
  const isVehiclesListing = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    let current = effectiveCategoryId ? categoryMap.get(effectiveCategoryId) : null;
    while (current) {
      if (current.slug === "vehicles") return true;
      current = current.parent_id ? categoryMap.get(current.parent_id) : null;
    }
    return false;
  }, [effectiveCategoryId, categories]);

  // Helper: check if a category (or its ancestors) is in the fashion tree
  const isFashionListing = useMemo(() => {
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    let current = effectiveCategoryId ? categoryMap.get(effectiveCategoryId) : null;
    while (current) {
      if (current.slug === "fashion") return true;
      current = current.parent_id ? categoryMap.get(current.parent_id) : null;
    }
    return false;
  }, [effectiveCategoryId, categories]);

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

        {!isJobsListing && (
          <>
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
          </>
        )}

        {isJobsListing && (
          <>
            <input type="hidden" name="condition" value="used" />
            <input type="hidden" name="listingType" value="classified" />
          </>
        )}

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

        {isVehiclesListing && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Registration Year (optional)</label>
              <input
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                value={registrationYear}
                onChange={(e) => setRegistrationYear(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. 2019"
              />
              <input type="hidden" name="registrationYear" value={registrationYear} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Manufacturing Year (optional)</label>
              <input
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                value={manufacturingYear}
                onChange={(e) => setManufacturingYear(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. 2019"
              />
              <input type="hidden" name="manufacturingYear" value={manufacturingYear} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Bluebook Status (optional)</label>
              <select
                value={bluebookStatus}
                onChange={(e) => setBluebookStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              >
                <option value="">Select status...</option>
                <option value="clear">Clear</option>
                <option value="mortgage">Mortgage</option>
                <option value="registered-insurance-claim">Registered Insurance Claim</option>
                <option value="customs-hold">Customs Hold</option>
                <option value="unknown">Unknown</option>
              </select>
              <input type="hidden" name="bluebookStatus" value={bluebookStatus} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Import Status (optional)</label>
              <select
                value={importStatus}
                onChange={(e) => setImportStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              >
                <option value="">Select status...</option>
                <option value="local">Local (Not Imported)</option>
                <option value="imported-used">Imported Used</option>
                <option value="imported-new">Imported New (Unopened)</option>
                <option value="reconditioned">Reconditioned</option>
              </select>
              <input type="hidden" name="importStatus" value={importStatus} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Number of Previous Owners (optional)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={ownerCount}
                onChange={(e) => setOwnerCount(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. 1"
              />
              <input type="hidden" name="ownerCount" value={ownerCount} />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isModified}
                onChange={(e) => setIsModified(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Vehicle has been modified
              <input type="hidden" name="isModified" value={isModified ? "on" : ""} />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={accidentHistory}
                onChange={(e) => setAccidentHistory(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Has accident history
              <input type="hidden" name="accidentHistory" value={accidentHistory ? "on" : ""} />
            </label>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Service History (optional)</label>
              <textarea
                value={serviceHistory}
                onChange={(e) => setServiceHistory(e.target.value)}
                maxLength={500}
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. Regular service, new tires, engine overhaul..."
              />
              <input type="hidden" name="serviceHistory" value={serviceHistory} />
            </div>
          </>
        )}

        {isRealEstateListing && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Municipality / Gaunpalika (optional)</label>
              <input
                type="text"
                name="municipality"
                defaultValue={defaultValues?.municipality ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. Kathmandu Metropolitan City"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Ward number (optional)</label>
              <input
                type="number"
                name="ward_number"
                min={1}
                max={99}
                defaultValue={defaultValues?.ward_number ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. 5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Tole / Neighborhood (optional)</label>
              <input
                type="text"
                name="tole"
                defaultValue={defaultValues?.tole ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. Baneshwor"
              />
            </div>
          </>
        )}

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

      {isRealEstateListing && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Land Area & Price</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Unit system</label>
              <select
                value={landUnitSystem}
                onChange={(e) => setLandUnitSystem(e.target.value as any)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              >
                <option value="">Choose a unit system...</option>
                <option value="ropani_system">Ropani (रोपनी) — Ropani, Aana, Paisa, Daam</option>
                <option value="bigha_system">Bigha (बिघा) — Bigha, Kattha, Dhur</option>
                <option value="sqft">Square Feet (sqft)</option>
                <option value="sqm">Square Meters (sqm)</option>
              </select>
            </div>

            {landUnitSystem === "ropani_system" && (
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Ropani (रोपनी)
                  </label>
                  <input
                    type="number"
                    name="land_ropani"
                    min={0}
                    defaultValue={defaultValues?.land_ropani ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Aana (आना)
                  </label>
                  <input
                    type="number"
                    name="land_aana"
                    min={0}
                    max={15}
                    defaultValue={defaultValues?.land_aana ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Paisa (पैसा)
                  </label>
                  <input
                    type="number"
                    name="land_paisa"
                    min={0}
                    max={3}
                    defaultValue={defaultValues?.land_paisa ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Daam (दाम)
                  </label>
                  <input
                    type="number"
                    name="land_daam"
                    min={0}
                    max={3}
                    defaultValue={defaultValues?.land_daam ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {landUnitSystem === "bigha_system" && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Bigha (बिघा)
                  </label>
                  <input
                    type="number"
                    name="land_bigha"
                    min={0}
                    defaultValue={defaultValues?.land_bigha ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Kattha (कट्ठा)
                  </label>
                  <input
                    type="number"
                    name="land_kattha"
                    min={0}
                    max={19}
                    defaultValue={defaultValues?.land_kattha ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Dhur (धुर)
                  </label>
                  <input
                    type="number"
                    name="land_dhur"
                    min={0}
                    max={19}
                    defaultValue={defaultValues?.land_dhur ?? ""}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {landUnitSystem === "sqft" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Area (sqft)
                </label>
                <input
                  type="number"
                  name="land_area_sqft"
                  min={0}
                  step="0.01"
                  defaultValue={defaultValues?.land_area_sqft ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                  placeholder="e.g. 5000"
                />
              </div>
            )}

            {landUnitSystem === "sqm" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Area (sqm)
                </label>
                <input
                  type="number"
                  name="land_area_sqft"
                  min={0}
                  step="0.01"
                  defaultValue={defaultValues?.land_area_sqft ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                  placeholder="e.g. 464"
                />
              </div>
            )}

            <input type="hidden" name="land_unit_system" value={landUnitSystem} />
          </div>
        </div>
      )}

      {isJobsListing && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Job Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Company / Organization name (optional)</label>
              <input
                type="text"
                name="company_name"
                maxLength={200}
                defaultValue={defaultValues?.company_name ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. Acme Corporation (or leave blank to use your profile name)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Number of vacancies (optional)</label>
              <input
                type="number"
                name="vacancies_count"
                min={1}
                defaultValue={defaultValues?.vacancies_count ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="e.g. 3"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Salary min (optional)</label>
                <input
                  type="number"
                  name="salary_min"
                  min={0}
                  step="0.01"
                  defaultValue={defaultValues?.salary_min ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                  placeholder="e.g. 40000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Salary max (optional)</label>
                <input
                  type="number"
                  name="salary_max"
                  min={0}
                  step="0.01"
                  defaultValue={defaultValues?.salary_max ?? ""}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                  placeholder="e.g. 60000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Salary period (optional)</label>
              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value as any)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              >
                <option value="">Select a period...</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
              <input type="hidden" name="salary_period" value={salaryPeriod} />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="salary_negotiable"
                defaultChecked={defaultValues?.salary_negotiable ?? false}
                className="h-4 w-4 rounded border-slate-300"
              />
              Salary is negotiable
            </label>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Application deadline (optional)</label>
              <input
                type="date"
                name="application_deadline"
                defaultValue={defaultValues?.application_deadline ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">External application URL (optional)</label>
              <input
                type="url"
                name="external_apply_url"
                defaultValue={defaultValues?.external_apply_url ?? ""}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="https://careers.example.com/apply — leave blank to let candidates apply directly on haatnepal"
              />
            </div>
          </div>
        </div>
      )}

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

      {!isRealEstateListing && !isJobsListing && (
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
      )}

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
