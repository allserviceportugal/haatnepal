"use client";

import { useActionState } from "react";
import { submitJobApplicationAction, type JobApplicationActionState } from "@/lib/actions/job-applications";
import { ResumeUploader } from "./resume-uploader";

type Props = {
  listingId: string;
  userId: string;
};

export function JobApplicationForm({ listingId, userId }: Props) {
  const [state, formAction, isPending] = useActionState(
    (_prevState: JobApplicationActionState, formData: FormData) => submitJobApplicationAction(listingId, _prevState, formData),
    {} as JobApplicationActionState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Cover note (optional)
        </label>
        <textarea
          name="coverNote"
          maxLength={2000}
          rows={4}
          disabled={isPending}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 disabled:bg-slate-50"
          placeholder="Tell the employer why you're interested in this position..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Resume
        </label>
        <ResumeUploader userId={userId} listingId={listingId} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:bg-slate-300"
      >
        {isPending ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
