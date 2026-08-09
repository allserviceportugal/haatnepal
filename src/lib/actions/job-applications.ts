"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { jobApplicationSchema } from "@/lib/validations/job-application";

export type JobApplicationActionState = { error?: string };

async function isJobsListing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string
): Promise<boolean> {
  const { data: listing } = await supabase
    .from("listings")
    .select("categories!inner(slug, parent_id)")
    .eq("id", listingId)
    .single();

  if (!listing?.categories) return false;

  // Walk up the category tree checking if any ancestor is "jobs"
  const categoryMap = new Map<string, { id: string; slug: string; parent_id: string | null }>();
  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, slug, parent_id");

  if (allCategories) {
    allCategories.forEach((c: { id: string; slug: string; parent_id: string | null }) => categoryMap.set(c.id, c));
  }

  let current = (listing.categories as unknown) as { slug: string; parent_id: string | null } | null;
  while (current) {
    if (current.slug === "jobs") return true;
    if (!current.parent_id) break;
    current = categoryMap.get(current.parent_id) || null;
  }

  return false;
}

export async function submitJobApplicationAction(
  listingId: string,
  _prevState: JobApplicationActionState,
  formData: FormData
): Promise<JobApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/");
  }

  // Fetch listing
  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, application_deadline")
    .eq("id", listingId)
    .single();

  if (!listing) {
    return { error: "Job posting not found." };
  }

  // Prevent self-application
  if (listing.seller_id === user.id) {
    return { error: "You can't apply to your own job posting." };
  }

  // Check if listing is in Jobs category tree
  const isJobs = await isJobsListing(supabase, listingId);
  if (!isJobs) {
    return { error: "This listing is not a job posting." };
  }

  // Check application deadline
  if (listing.application_deadline) {
    const deadline = new Date(listing.application_deadline);
    if (new Date() > deadline) {
      return { error: "Applications for this job have closed." };
    }
  }

  // Parse form
  const parsed = jobApplicationSchema.safeParse({
    coverNote: formData.get("coverNote"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { coverNote } = parsed.data;
  const resumePath = formData.get("resumePath") as string | null;

  // Insert application
  const { error } = await supabase.from("job_applications").insert({
    listing_id: listingId,
    applicant_id: user.id,
    cover_note: coverNote || null,
    resume_path: resumePath || null,
  });

  if (error) {
    // Check for unique constraint violation (already applied)
    if (error.code === "23505") {
      return { error: "You've already applied to this job." };
    }
    return { error: error.message ?? "Could not submit application." };
  }

  revalidatePath(`/listing/${listingId}`);
  return {};
}

export async function withdrawJobApplicationAction(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch application first to get listing_id and verify ownership
  const { data: app } = await supabase
    .from("job_applications")
    .select("id, listing_id")
    .eq("id", applicationId)
    .eq("applicant_id", user.id)
    .single();

  if (!app) {
    throw new Error("Application not found.");
  }

  const { error } = await supabase
    .from("job_applications")
    .delete()
    .eq("id", applicationId)
    .eq("applicant_id", user.id);

  if (error) {
    throw new Error(error.message ?? "Could not withdraw application.");
  }

  revalidatePath(`/listing/${app.listing_id}`);
}
