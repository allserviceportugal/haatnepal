"use client";

import { useState } from "react";
import { useActionState } from "react";
import { reportListingIssueAction } from "@/lib/actions/report-issue";

type Props = {
  listingId: string;
  listingTitle: string;
  sellerName: string;
};

export function ReportIssueButton({ listingId, listingTitle, sellerName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(reportListingIssueAction, {});
  const [issueType, setIssueType] = useState("inappropriate-content");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("listingId", listingId);
    formData.append("listingTitle", listingTitle);
    formData.append("sellerName", sellerName);
    formData.append("issueType", issueType);
    formData.append("message", message);

    await formAction(formData);

    if (!state.error) {
      setIsOpen(false);
      setMessage("");
      setIssueType("inappropriate-content");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700"
        type="button"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.82 1.573l-7 10A1 1 0 08 15H5a3 3 0 01-3-3V6zm14.06-2.751a.75.75 0 00-1.06 1.06L17.06 5.5H15a.75.75 0 000 1.5h2.06l-1.06 1.061a.75.75 0 101.06 1.06l2.5-2.5a.75.75 0 000-1.06l-2.5-2.5z" clipRule="evenodd" />
        </svg>
        Report Issue
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">Report an Issue</h2>
            <p className="mt-2 text-sm text-slate-600">
              Help us maintain a safe marketplace by reporting problems with this listing.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="inappropriate-content">Inappropriate Content</option>
                  <option value="fake-listing">Fake or Misleading Listing</option>
                  <option value="spam">Spam</option>
                  <option value="scam">Suspected Scam</option>
                  <option value="harassment">Harassment</option>
                  <option value="illegal">Illegal Item</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Details
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                  rows={4}
                />
              </div>

              {state.error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {state.error}
                </div>
              )}

              {state.success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  ✅ Thank you! We&apos;ve received your report.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !message.trim()}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Sending..." : "Send Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
