import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function DashboardProfilePage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to manage your profile.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/profile");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/login");

  const { data: planRow } = await supabase
    .from("profiles")
    .select("subscription_plans(allows_storefront_branding)")
    .eq("id", user.id)
    .single();
  const plan = (
    planRow as unknown as { subscription_plans: { allows_storefront_branding: boolean } | null } | null
  )?.subscription_plans;
  const canBrand = plan?.allows_storefront_branding ?? false;

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Profile</h1>
      <div className="mt-8 max-w-xl rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <ProfileForm profile={profile} canBrand={canBrand} />
      </div>
    </div>
  );
}
