import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingForm } from "@/components/listing-form";
import { updateListingAction } from "@/lib/actions/listings";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn&apos;t configured yet</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/listing/${id}/edit`);
  }

  const [
    { data: listing },
    { data: categories },
    { data: categoryAttributes },
    { data: couriers },
    { data: attributeValues },
    { data: deliveryOptions },
  ] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
    supabase.from("category_attributes").select("*").order("sort_order"),
    supabase.from("delivery_couriers").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("listing_attribute_values").select("attribute_id, value").eq("listing_id", id),
    supabase.from("listing_delivery_options").select("courier_id").eq("listing_id", id),
  ]);

  if (!listing) notFound();
  if (listing.seller_id !== user.id) redirect(`/listing/${id}`);

  const boundUpdateAction = updateListingAction.bind(null, id);

  const attributeValueMap = Object.fromEntries(
    (attributeValues ?? []).map((row) => [row.attribute_id, row.value])
  );
  const courierIds = (deliveryOptions ?? []).map((row) => row.courier_id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-black text-slate-900">Edit listing</h1>
      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ListingForm
          action={boundUpdateAction}
          categories={categories ?? []}
          categoryAttributes={categoryAttributes ?? []}
          couriers={couriers ?? []}
          userId={user.id}
          defaultValues={{ ...listing, attributeValues: attributeValueMap, courierIds }}
          submitLabel="Save changes"
        />
      </div>
    </main>
  );
}
