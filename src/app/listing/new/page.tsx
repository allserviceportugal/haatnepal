import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingForm } from "@/components/listing-form";
import { createListingAction } from "@/lib/actions/listings";
import { checkListingLimits } from "@/lib/actions/check-listing-limits";

export default async function NewListingPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Connect Supabase to post a listing</h1>
        <p className="mt-2 text-slate-600">
          Add your Supabase project URL and anon key to <code>.env.local</code>, then restart the
          dev server.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/listing/new");
  }

  const [{ data: categories }, { data: categoryAttributes }, { data: couriers }, limits] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("category_attributes").select("*").order("sort_order"),
    supabase.from("delivery_couriers").select("*").eq("is_active", true).order("sort_order"),
    checkListingLimits(),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-slate-900">Post a listing</h1>
      <p className="mt-2 text-slate-600">Reach buyers across Nepal in minutes.</p>

      {!limits.canCreate && (
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <p className="font-semibold">Listing quota reached</p>
          <p className="mt-1">You've used all {limits.listingsLimit} of your free listings this month on the {limits.currentPlan} plan.</p>
          <Link
            href="/dashboard/plan"
            className="mt-3 inline-block rounded-full bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700"
          >
            Upgrade your plan
          </Link>
        </div>
      )}

      {limits.canCreate && limits.listingsRemaining <= 1 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">{limits.listingsRemaining} listing remaining</p>
          <p className="mt-1">You have {limits.listingsRemaining} listing{limits.listingsRemaining === 1 ? '' : 's'} left this month on your {limits.currentPlan} plan.</p>
          <Link
            href="/dashboard/plan"
            className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
          >
            View plans
          </Link>
        </div>
      )}

      {limits.canCreate && limits.listingsRemaining > 1 && (
        <div className="mt-6 text-sm text-slate-600">
          <p>{limits.listingsUsed} of {limits.listingsLimit} free listings used this month</p>
        </div>
      )}

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {!limits.canCreate ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center">
            <p className="text-slate-700 font-semibold">Upgrade your plan to post more listings</p>
            <p className="mt-2 text-sm text-slate-600">Your {limits.currentPlan} plan limit has been reached.</p>
            <Link
              href="/dashboard/plan"
              className="mt-4 inline-block rounded-full bg-orange-500 px-6 py-2 text-sm font-bold text-white hover:bg-orange-600"
            >
              See plans
            </Link>
          </div>
        ) : (
          <ListingForm
            action={createListingAction}
            categories={categories ?? []}
            categoryAttributes={categoryAttributes ?? []}
            couriers={couriers ?? []}
            userId={user.id}
            submitLabel="Publish listing"
          />
        )}
      </div>
    </main>
  );
}
