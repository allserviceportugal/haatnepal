"use client";

import { useState } from "react";
import { approveVerificationRequestAction, rejectVerificationRequestAction } from "@/lib/actions/admin-verifications";

export default function AdminVerificationActions({ requestId }: { requestId: string }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleApprove() {
    setIsLoading(true);
    try {
      await approveVerificationRequestAction(requestId);
    } catch (error) {
      alert("Error approving request: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setIsLoading(true);
    try {
      await rejectVerificationRequestAction(requestId, rejectReason);
    } catch (error) {
      alert("Error rejecting request: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-slate-900">Actions</h3>

      <div className="space-y-3">
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className="w-full rounded-lg bg-green-500 px-4 py-3 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "✓ Approve"}
        </button>

        {!showRejectForm ? (
          <button
            onClick={() => setShowRejectForm(true)}
            className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            ✗ Reject
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={isLoading || !rejectReason.trim()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason("");
                }}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
