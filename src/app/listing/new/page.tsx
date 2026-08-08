import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingForm } from "@/components/listing-form";
import { createListingAction } from "@/lib/actions/listings";

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

  const [{ data: categories }, { data: categoryAttributes }, { data: couriers }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("category_attributes").select("*").order("sort_order"),
    supabase.from("delivery_couriers").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-slate-900">Post a listing</h1>
      <p className="mt-2 text-slate-600">Reach buyers across Nepal in minutes.</p>
      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ListingForm
          action={createListingAction}
          categories={categories ?? []}
          categoryAttributes={categoryAttributes ?? []}
          couriers={couriers ?? []}
          userId={user.id}
          submitLabel="Publish listing"
        />
      </div>
    </main>
  );
}
