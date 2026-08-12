"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function convertToBusinessAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/profile");
  }

  // Update account type to business
  const { error } = await supabase
    .from("profiles")
    .update({ account_type: "business" })
    .eq("id", user.id);

  if (error) {
    console.error("Error converting to business account:", error);
    // Still redirect but with error state handled by the UI
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/plan");
}
