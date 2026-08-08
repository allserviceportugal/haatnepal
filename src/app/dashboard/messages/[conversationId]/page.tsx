import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getConversation, getConversationTimeline } from "@/lib/queries/conversations";
import { MessageThread } from "@/components/chat/message-thread";
import { MessageComposer } from "@/components/chat/message-composer";
import { formatPrice } from "@/lib/format";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to see this conversation.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/dashboard/messages/${conversationId}`);

  const conversation = await getConversation(supabase, conversationId);
  if (!conversation) notFound();
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
    redirect("/dashboard/messages");
  }

  const entries = await getConversationTimeline(supabase, conversationId);
  const otherParty = conversation.buyer_id === user.id ? conversation.seller : conversation.buyer;
  const listingImage = conversation.listings?.listing_images?.[0]?.url;

  return (
    <div>
      <Link href="/dashboard/messages" className="text-sm font-semibold text-orange-600">
        &larr; Back to messages
      </Link>

      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        {listingImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listingImage} alt="" className="h-14 w-14 rounded-xl object-cover" />
        )}
        <div className="flex-1">
          {conversation.listings && (
            <Link
              href={`/listing/${conversation.listings.id}`}
              className="font-bold text-slate-900 hover:text-orange-600"
            >
              {conversation.listings.title}
            </Link>
          )}
          <p className="text-sm text-slate-500">
            with {otherParty?.display_name ?? "User"}
            {conversation.listings?.price !== undefined &&
              ` · Listed at ${formatPrice(conversation.listings.price, conversation.listings.currency)}`}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <MessageThread entries={entries} currentUserId={user.id} />
        <MessageComposer conversationId={conversationId} listingId={conversation.listing_id} />
      </div>
    </div>
  );
}
