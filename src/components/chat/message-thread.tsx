import { formatPrice } from "@/lib/format";
import { respondToOfferAction } from "@/lib/actions/conversations";
import type { TimelineEntry } from "@/lib/supabase/types";

export function MessageThread({
  entries,
  currentUserId,
}: {
  entries: TimelineEntry[];
  currentUserId: string;
}) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No messages yet — say hello!</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        if (entry.kind === "message") {
          const isMine = entry.message.sender_id === currentUserId;
          return (
            <div key={entry.message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {entry.message.body}
              </div>
            </div>
          );
        }

        const { offer } = entry;
        const isMine = offer.created_by === currentUserId;
        const canRespond = !isMine && offer.status === "pending";

        return (
          <div key={offer.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%] rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm">
              <p className="font-bold text-slate-900">Offer: {formatPrice(offer.amount)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {offer.status}
              </p>
              {canRespond && (
                <div className="mt-3 flex gap-2">
                  <form action={respondToOfferAction.bind(null, offer.id, "accepted")}>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                    >
                      Accept
                    </button>
                  </form>
                  <form action={respondToOfferAction.bind(null, offer.id, "rejected")}>
                    <button
                      type="submit"
                      className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
