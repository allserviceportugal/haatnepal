-- Featured listings become time-boxed packages instead of a hardcoded 7 days.
--
--   14 days — free (consumes subscription_plans.monthly_featured_quota)
--   14 days — NPR 44   | 30 days — NPR 74   | 45 days — NPR 99   (paid)
--
-- Both the free and paid paths previously wrote `featured_until = now + 7 days`
-- with the duration hardcoded in two places in src/lib/actions/listings.ts.
--
-- listing_feature_purchases becomes the single ledger for *all* feature events,
-- including plan-included ones at amount_npr = 0. Quota was previously counted as
-- "listings whose featured_at falls in this month", which counts listings rather
-- than events: re-featuring the same listing twice consumed one slot, and
-- overwriting featured_at moved the count between months.

ALTER TABLE public.listing_feature_purchases
  ADD COLUMN IF NOT EXISTS package_key text,
  ADD COLUMN IF NOT EXISTS duration_days integer,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'paid';

ALTER TABLE public.listing_feature_purchases
  DROP CONSTRAINT IF EXISTS listing_feature_purchases_source_check;
ALTER TABLE public.listing_feature_purchases
  ADD CONSTRAINT listing_feature_purchases_source_check
  CHECK (source IN ('plan', 'paid', 'admin'));

ALTER TABLE public.listing_feature_purchases
  DROP CONSTRAINT IF EXISTS listing_feature_purchases_package_key_check;
ALTER TABLE public.listing_feature_purchases
  ADD CONSTRAINT listing_feature_purchases_package_key_check
  CHECK (package_key IS NULL OR package_key IN ('free_14', 'paid_14', 'paid_30', 'paid_45'));

-- Counting quota per seller per month.
CREATE INDEX IF NOT EXISTS listing_feature_purchases_seller_created_idx
  ON public.listing_feature_purchases (seller_id, created_at DESC);

-- No payment gateway exists yet, so nothing may claim collected revenue. Any row
-- asserting a completed paid boost was written by the placeholder flow, which
-- featured listings for free while recording NPR 44 as received.
UPDATE public.listing_feature_purchases
SET status = 'failed',
    payment_reference = COALESCE(payment_reference, 'voided: no payment gateway was connected')
WHERE status = 'completed' AND amount_npr > 0 AND payment_reference IS NULL;
