-- marketplace-nepal: buyer<->seller chat with structured offers/negotiation

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create index conversations_buyer_id_idx on public.conversations (buyer_id);
create index conversations_seller_id_idx on public.conversations (seller_id);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers can start a conversation with a seller"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id);

alter table public.messages enable row level security;

create policy "Participants can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

create policy "Participants can send messages in their conversations"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

create type public.offer_status as enum ('pending', 'accepted', 'rejected', 'countered');

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  status public.offer_status not null default 'pending',
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index offers_conversation_id_idx on public.offers (conversation_id);

alter table public.offers enable row level security;

create policy "Participants can view offers in their conversations"
  on public.offers for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = offers.conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

create policy "Participants can create offers in their conversations"
  on public.offers for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.conversations
      where conversations.id = offers.conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );

create policy "Participants can update offer status in their conversations"
  on public.offers for update
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = offers.conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = offers.conversation_id
        and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
    )
  );
