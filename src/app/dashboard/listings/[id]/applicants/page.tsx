import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { startConversationAction } from "@/lib/actions/conversations";
import type { JobApplicationWithApplicant } from "@/lib/supabase/types";

export default async function ListingApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn&apos;t configured yet</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/listings");
  }

  // Fetch listing and verify it's a jobs listing
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, category_id")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  // Verify this is a jobs listing by checking category ancestry
  const { data: category } = await supabase
    .from("categories")
    .select("slug, parent_id")
    .eq("id", listing.category_id)
    .single();

  if (!category) {
    notFound();
  }

  // Check if category is jobs or under jobs
  let isJobsListing = category.slug === "jobs";
  if (!isJobsListing && category.parent_id) {
    const { data: parentCat } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", category.parent_id)
      .single();
    isJobsListing = parentCat?.slug === "jobs";
  }

  if (!isJobsListing) {
    notFound();
  }

  // Verify ownership
  const { data: listingCheck } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  if (!listingCheck) {
    redirect("/dashboard/listings");
  }

  // Fetch all applications for this job
  const { data: applications } = await supabase
    .from("job_applications")
    .select("*, profiles!applicant_id(id, display_name, avatar_url)")
    .eq("listing_id", id)
    .order("created_at", { ascending: false });

  const typedApplications = applications as unknown as JobApplicationWithApplicant[];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link
          href="/dashboard/listings"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          ← Back to listings
        </Link>
        <h1 className="mt-4 text-3xl font-black text-slate-900">
          Applications for: {listing.title}
        </h1>
        <p className="mt-1 text-slate-600">
          {typedApplications.length} {typedApplications.length === 1 ? "application" : "applications"}
        </p>
      </div>

      {typedApplications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No applications yet. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {typedApplications.map((application) => (
            <div
              key={application.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {application.applicant?.display_name ?? "Anonymous"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Applied{" "}
                    {new Date(application.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {application.cover_note && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                        Cover note
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                        {application.cover_note}
                      </p>
                    </div>
                  )}

                  {application.resume_path && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 mb-2">
                        Resume
                      </p>
                      <ResumeDownloadLink
                        resumePath={application.resume_path}
                        applicantName={application.applicant?.display_name ?? "Applicant"}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <form action={startConversationAction.bind(null, id)}>
                    <input type="hidden" name="applicantId" value={application.applicant_id} />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600 whitespace-nowrap"
                    >
                      Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

async function ResumeDownloadLink({
  resumePath,
  applicantName,
}: {
  resumePath: string;
  applicantName: string;
}) {
  const supabase = await createClient();

  try {
    const { data } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resumePath, 3600);

    if (data?.signedUrl) {
      return (
        <a
          href={data.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-100"
        >
          📄 Download resume
        </a>
      );
    }
  } catch {
    // Fall through to error message
  }

  return (
    <p className="text-sm text-slate-500">Resume file not accessible</p>
  );
}
