-- haatnepal: A handful of existing profiles were created with no
-- subscription_plan_id at all (predates the atomic signup trigger in 0056).
-- That's a live bug, not just a display gap: checkListingQuota() in
-- src/lib/actions/listings.ts treats "no plan resolved" as unlimited
-- listings, so these accounts currently bypass quota enforcement entirely.
-- Backfill them onto their account type's free plan (normal/business),
-- matching exactly what subscribe_new_user() would assign on signup today.
-- Admins are untouched (and never had a subscription_plan_id dependency).

update public.profiles p
set subscription_plan_id = sp.id
from public.subscription_plans sp
where p.subscription_plan_id is null
  and p.role <> 'admin'
  and sp.key = (case p.account_type when 'business' then 'business' else 'normal' end)::public.subscription_tier;
