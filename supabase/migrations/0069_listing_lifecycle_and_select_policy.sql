-- Listing lifecycle (auto-archive on expiry) + tighten the listings SELECT policy.
--
-- Migration 0047 never applied (invalid `select cron.schedule(...) on conflict`),
-- so none of this exists in production: no audit columns, no expire_listings(),
-- no cron job. The lazy-expiry write in src/lib/queries/listings.ts has therefore
-- always failed silently, because it sets status_reason on a column that is absent.
--
-- 0047's seller_stats half is deliberately NOT revived: nothing in src/ reads
-- seller_stats, response_rate or avg_response_minutes, so it is dead weight.

-- ---------------------------------------------------------------- audit columns
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS status_changed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS status_reason text;

CREATE OR REPLACE FUNCTION public.track_listing_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS listings_track_status_change ON public.listings;
CREATE TRIGGER listings_track_status_change
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.track_listing_status_change();

-- ------------------------------------------------------------- archive on expiry
-- Expiry archives rather than "expires": one terminal state the seller can
-- republish from, and it keeps the listing in their dashboard.
CREATE OR REPLACE FUNCTION public.archive_expired_listings()
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET status = 'archived',
      status_reason = 'auto: expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fold the legacy 'expired' status into 'archived' so there is only one.
UPDATE public.listings SET status = 'archived' WHERE status = 'expired';

DO $$
BEGIN
  PERFORM cron.unschedule('archive-expired-listings');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'archive-expired-listings',
  '*/15 * * * *',
  $$SELECT public.archive_expired_listings()$$
);

-- Clear any backlog immediately.
SELECT public.archive_expired_listings();

-- ------------------------------------------------------------- SELECT policy fix
-- 0049 created "Admins can view all listings" as
--   using (<admin check>) or status in ('active','sold','expired') or true
-- Permissive policies are ORed, so the trailing `or true` would expose every
-- listing of every status. It did not survive into the live policy, but the file
-- would reopen the hole on any fresh deploy. Replace both SELECT policies with one
-- explicit rule: the public sees active and sold listings; owners and admins see
-- all of their own / everything. Archived and draft listings are never public.
DROP POLICY IF EXISTS "Active listings are publicly readable" ON public.listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON public.listings;

CREATE POLICY "Listings are readable by public, owner or admin"
  ON public.listings FOR SELECT
  USING (
    status IN ('active', 'sold')
    OR seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ------------------------------------------------------------------- plan data
-- premium had listing_duration_days NULL, silently falling back to the `?? 60`
-- default in application code; custom likewise.
UPDATE public.subscription_plans SET listing_duration_days = 365 WHERE key = 'premium';
UPDATE public.subscription_plans SET listing_duration_days = 365 WHERE key = 'custom';

-- Description contradicted monthly_featured_quota (10).
UPDATE public.subscription_plans
SET description = 'For active sellers who outgrew the free plans — 100 listings a month plus 10 featured boosts to get noticed.'
WHERE key = 'plus';

-- ------------------------------------------------------------------- dead code
-- user_monthly_usage and its RPCs have no callers; the only writer upserted a
-- literal 1 instead of incrementing, so the data was wrong anyway. All live quota
-- counting reads the listings table directly.
DROP FUNCTION IF EXISTS public.get_user_monthly_usage(uuid);
DROP FUNCTION IF EXISTS public.increment_user_usage(uuid, text);
DROP FUNCTION IF EXISTS public.can_user_create_listing(uuid);
DROP FUNCTION IF EXISTS public.can_user_feature_listing(uuid);
DROP TABLE IF EXISTS public.user_monthly_usage;
