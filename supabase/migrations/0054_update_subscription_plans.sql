-- Update subscription plan quotas and add Premium plan tier

-- Step 1: Add 'premium' to subscription_tier enum
alter type public.subscription_tier add value 'premium' before 'custom';

-- Step 2: Update Plus plan: 100 listings, 10 featured
update public.subscription_plans
set monthly_listing_quota = 100, monthly_featured_quota = 10
where key = 'plus';

-- Step 3: Update Pro plan: 200 listings, 20 featured
update public.subscription_plans
set monthly_listing_quota = 200, monthly_featured_quota = 20
where key = 'pro';

-- Step 4: Insert Premium plan: 500 listings, 50 featured, NPR 4999/month
insert into public.subscription_plans
(name, key, monthly_listing_quota, monthly_featured_quota, price_npr, is_paid, allows_storefront_branding, description)
values ('Premium', 'premium', 500, 50, 4999, true, true, 'Premium tier with 500 listings and 50 featured per month')
on conflict (key) do nothing;
