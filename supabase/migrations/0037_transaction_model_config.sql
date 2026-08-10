-- haatnepal: Transaction Model Configuration
-- Determines which transaction model (classified, direct_purchase, hybrid) each category uses
-- Controls CTAs, seller contact visibility, and lead tracking

-- =========================================================================
-- CATEGORY-LEVEL TRANSACTION CONFIGURATION
-- =========================================================================

create table public.category_transaction_config (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,

  -- Primary transaction model for this category
  default_transaction_mode text not null default 'classified'
    check (default_transaction_mode in ('classified', 'direct_purchase', 'hybrid')),

  -- Which CTAs are allowed by default in this category
  allow_contact boolean default true,           -- Show phone/email contact
  allow_message boolean default true,           -- Show "Message Seller" button
  allow_offer boolean default false,            -- Show "Make Offer" button
  allow_cart boolean default false,             -- Show "Add to Cart" button
  allow_checkout boolean default false,         -- Show "Buy Now" button
  allow_phone_call boolean default false,       -- Show direct call button

  -- Contact privacy: hide contact from anonymous users
  hide_contact_from_anonymous boolean default true,

  -- Lead tracking: track contact reveals, messages, offers
  track_leads boolean default true,

  updated_at timestamptz default now(),
  unique(category_id)
);

create index category_transaction_config_category_id_idx
  on public.category_transaction_config(category_id);

alter table public.category_transaction_config enable row level security;

create policy "Config is publicly readable"
  on public.category_transaction_config for select using(true);

-- =========================================================================
-- SELLER-LEVEL TRANSACTION PREFERENCES (OVERRIDES CATEGORY DEFAULTS)
-- =========================================================================

create table public.seller_transaction_preferences (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,

  -- Seller can override category defaults
  default_transaction_mode text
    check (default_transaction_mode in ('classified', 'direct_purchase', 'hybrid')),

  allow_contact boolean,
  allow_message boolean,
  allow_offer boolean,
  allow_cart boolean,
  allow_checkout boolean,

  -- Preferred contact method
  contact_phone_visible boolean default true,
  contact_email_visible boolean default true,

  updated_at timestamptz default now(),
  unique(seller_id, category_id)
);

create index seller_transaction_preferences_seller_id_idx
  on public.seller_transaction_preferences(seller_id);

alter table public.seller_transaction_preferences enable row level security;

create policy "Sellers can view their own preferences"
  on public.seller_transaction_preferences for select
  using(seller_id = auth.uid());

create policy "Sellers can update their own preferences"
  on public.seller_transaction_preferences for update
  using(seller_id = auth.uid())
  with check(seller_id = auth.uid());

-- =========================================================================
-- LISTING-LEVEL TRANSACTION CONFIG (OVERRIDES SELLER & CATEGORY)
-- =========================================================================

alter table public.listings
add column if not exists transaction_mode text default 'default'
  check (transaction_mode in ('classified', 'direct_purchase', 'hybrid', 'default')),
add column if not exists allow_offers boolean,
add column if not exists allow_checkout boolean,
add column if not exists allow_contact boolean,
add column if not exists allow_messaging boolean;

-- Ensure all listings have 'default' mode so they use category config
update public.listings set transaction_mode = 'default'
where transaction_mode is null;

-- =========================================================================
-- LEADS TRACKING (CONTACT REVEALS, MESSAGES, OFFERS)
-- =========================================================================

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,

  lead_type text not null
    check (lead_type in (
      'contact_revealed',   -- Phone/email shown to buyer
      'phone_click',        -- Buyer clicked phone number
      'email_click',        -- Buyer clicked email
      'message_started',    -- Conversation created
      'offer_made',         -- Offer sent
      'favorite'            -- Listing favorited
    )),

  conversation_id uuid references public.conversations(id),
  offer_id uuid references public.offers(id),

  created_at timestamptz default now()
);

create index leads_listing_id_idx on public.leads(listing_id);
create index leads_seller_id_idx on public.leads(seller_id);
create index leads_buyer_id_idx on public.leads(buyer_id);
create index leads_lead_type_idx on public.leads(lead_type);
create index leads_created_at_idx on public.leads(created_at desc);

alter table public.leads enable row level security;

create policy "Sellers can view leads on their listings"
  on public.leads for select
  using(
    exists(
      select 1 from public.listings l
      where l.id = leads.listing_id
        and l.seller_id = auth.uid()
    )
  );

create policy "System can insert leads"
  on public.leads for insert
  with check(true);

-- =========================================================================
-- HELPER FUNCTION: TRACK LEAD (IDEMPOTENT)
-- =========================================================================

create or replace function public.track_lead(
  p_listing_id uuid,
  p_seller_id uuid,
  p_buyer_id uuid,
  p_lead_type text,
  p_conversation_id uuid default null,
  p_offer_id uuid default null
)
returns void as $$
declare
  existing_id uuid;
begin
  -- For contact_revealed, only track once per (listing, buyer)
  if p_lead_type = 'contact_revealed' then
    select id into existing_id
    from public.leads
    where listing_id = p_listing_id
      and buyer_id = p_buyer_id
      and lead_type = 'contact_revealed'
    limit 1;

    if existing_id is not null then
      return; -- Already tracked
    end if;
  end if;

  insert into public.leads (
    listing_id, seller_id, buyer_id, lead_type, conversation_id, offer_id
  ) values (
    p_listing_id, p_seller_id, p_buyer_id, p_lead_type, p_conversation_id, p_offer_id
  );
exception when unique_violation then
  null; -- Duplicate, ignore
end;
$$ language plpgsql;

-- =========================================================================
-- HELPER FUNCTION: GET LEAD METRICS FOR A LISTING
-- =========================================================================

create or replace function public.get_listing_lead_metrics(p_listing_id uuid)
returns table(
  total_views bigint,
  contact_reveals bigint,
  phone_clicks bigint,
  email_clicks bigint,
  messages bigint,
  offers bigint,
  favorites bigint
) as $$
begin
  return query
  select
    (select count(*) from listing_views where listing_id = p_listing_id)::bigint,
    (select count(*) from leads where listing_id = p_listing_id and lead_type = 'contact_revealed')::bigint,
    (select count(*) from leads where listing_id = p_listing_id and lead_type = 'phone_click')::bigint,
    (select count(*) from leads where listing_id = p_listing_id and lead_type = 'email_click')::bigint,
    (select count(*) from leads where listing_id = p_listing_id and lead_type = 'message_started')::bigint,
    (select count(*) from leads where listing_id = p_listing_id and lead_type = 'offer_made')::bigint,
    (select count(*) from favorites where listing_id = p_listing_id)::bigint;
end;
$$ language plpgsql;
