"use client";

import { useActionState } from "react";
import {
  makeOfferAction,
  sendMessageAction,
  type ChatActionState,
} from "@/lib/actions/conversations";

export function MessageComposer({
  conversationId,
  listingId,
}: {
  conversationId: string;
  listingId: string;
}) {
  const [messageState, messageFormAction, messagePending] = useActionState(
    sendMessageAction.bind(null, conversationId),
    {} as ChatActionState
  );
  const [offerState, offerFormAction, offerPending] = useActionState(
    makeOfferAction.bind(null, conversationId, listingId),
    {} as ChatActionState
  );

  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <form action={messageFormAction} className="flex gap-2">
        <input
          name="body"
          required
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-300"
        />
        <button
          type="submit"
          disabled={messagePending}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-60"
        >
          Send
        </button>
      </form>
      {messageState.error && <p className="text-sm text-red-600">{messageState.error}</p>}

      <form action={offerFormAction} className="flex gap-2">
        <input
          type="number"
          name="amount"
          min={0}
          step="0.01"
          required
          placeholder="Offer amount (NPR)"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-300"
        />
        <button
          type="submit"
          disabled={offerPending}
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          Make offer
        </button>
      </form>
      {offerState.error && <p className="text-sm text-red-600">{offerState.error}</p>}
    </div>
  );
}
