import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getConversationsForUser } from "@/lib/queries/conversations";
import { timeAgo } from "@/lib/format";

export default async function DashboardMessagesPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to see your messages.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/messages");

  const conversations = await getConversationsForUser(supabase, user.id);

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Messages</h1>

      {conversations.length === 0 ? (
        <p className="mt-8 text-slate-500">No conversations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {conversations.map((conversation) => {
            const otherParty =
              conversation.buyer_id === user.id ? conversation.seller : conversation.buyer;

            return (
              <Link
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-orange-200"
              >
                <div>
                  <p className="font-bold text-slate-900">{conversation.listings?.title ?? "Listing"}</p>
                  <p className="text-sm text-slate-500">with {otherParty?.display_name ?? "User"}</p>
                </div>
                <span className="text-xs text-slate-400">{timeAgo(conversation.created_at)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
