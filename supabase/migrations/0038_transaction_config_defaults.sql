-- haatnepal: Seed transaction model defaults for all categories
-- This configures the default behavior for each category

-- =========================================================================
-- CLASSIFIED CATEGORIES (Contact seller, no checkout)
-- =========================================================================

-- Vehicles
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'classified', true, true, true, false, false, true, true
from public.categories
where slug in (
  'vehicles', 'cars', 'motorcycles-scooters', 'suvs-jeeps', 'trucks',
  'auto-rickshaws', 'bicycles', 'electric-vehicles', 'three-wheelers',
  'tractors-agricultural', 'car-spare-parts', 'motorcycle-spare-parts',
  'commercial-vehicle-parts', 'vehicle-rental-services', 'vehicle-repair-services'
) and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- Real Estate
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'classified', true, true, true, false, false, true, true
from public.categories
where slug in (
  'real-estate', 'apartments', 'houses', 'land', 'commercial',
  'rentals', 'hostel'
) and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- Jobs
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'classified', true, true, false, false, false, true, true
from public.categories
where slug = 'jobs' and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- Services
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'classified', true, true, true, false, false, true, true
from public.categories
where slug = 'services' and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- =========================================================================
-- DIRECT PURCHASE CATEGORIES (Buy now, no contact shown)
-- =========================================================================

-- Fashion
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'direct_purchase', false, false, false, true, true, true, true
from public.categories
where slug like 'fashion%' and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- Electronics
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'direct_purchase', false, false, false, true, true, true, true
from public.categories
where (slug like 'electronics%' or slug in ('phones', 'computers', 'tvs-audio', 'gaming', 'smart-home', 'cameras', 'wearables'))
  and not exists (
    select 1 from public.category_transaction_config ctc
    where ctc.category_id = categories.id
  )
on conflict do nothing;

-- Food & Beverages (packaged items - direct purchase)
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'direct_purchase', false, false, false, true, true, true, true
from public.categories
where parent_id = (select id from public.categories where slug = 'food-beverages')
  and slug not in ('food-fresh-produce', 'food-meat-seafood', 'food-dairy-eggs')
  and not exists (
    select 1 from public.category_transaction_config ctc
    where ctc.category_id = categories.id
  )
on conflict do nothing;

-- Home & Living
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'direct_purchase', false, false, false, true, true, true, true
from public.categories
where slug = 'home-living' and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- Health & Beauty
insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'direct_purchase', false, false, false, true, true, true, true
from public.categories
where (slug like 'health%' or slug like 'beauty%') and not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = categories.id
)
on conflict do nothing;

-- =========================================================================
-- DEFAULT: Classified for all remaining categories
-- =========================================================================

insert into public.category_transaction_config (
  category_id, default_transaction_mode,
  allow_contact, allow_message, allow_offer, allow_cart, allow_checkout,
  hide_contact_from_anonymous, track_leads
)
select id, 'classified', true, true, true, false, false, true, true
from public.categories c
where not exists (
  select 1 from public.category_transaction_config ctc
  where ctc.category_id = c.id
)
on conflict do nothing;
