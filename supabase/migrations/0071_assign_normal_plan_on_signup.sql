-- Every profile must reference a subscription plan.
--
-- subscribe_new_user() skipped the plan lookup whenever plan_key was 'normal':
--
--   IF (raw_user_meta_data ->> 'plan_key') IS NOT NULL AND
--      (raw_user_meta_data ->> 'plan_key') != 'normal' THEN ...
--
-- so every free signup landed with subscription_plan_id = NULL and no plan row to
-- join. Application code then had to guess, and guessed inconsistently — the
-- listing form offered a 60-day duration to free users whose real cap is 30,
-- because the "no plan resolved" fallback was 60. Migration 0062 backfilled the
-- profiles that already existed but left the trigger creating new ones.

CREATE OR REPLACE FUNCTION subscribe_new_user()
RETURNS TRIGGER AS $$
DECLARE
  plan_id UUID;
  requested_plan text;
  subscribe_newsletter BOOLEAN;
BEGIN
  requested_plan := COALESCE(NEW.raw_user_meta_data ->> 'plan_key', 'normal');

  -- Always resolve a plan, including 'normal'. Cast the enum column to text so an
  -- unrecognised key yields NULL instead of raising (see 0063).
  SELECT id INTO plan_id FROM public.subscription_plans
  WHERE key::text = requested_plan
  LIMIT 1;

  IF plan_id IS NULL THEN
    SELECT id INTO plan_id FROM public.subscription_plans WHERE key::text = 'normal' LIMIT 1;
  END IF;

  subscribe_newsletter := COALESCE(
    (NEW.raw_user_meta_data ->> 'subscribe_newsletter')::BOOLEAN,
    false
  );

  INSERT INTO public.profiles (
    id, display_name, email, phone, account_type,
    phone_verified, password_set, email_confirmed, subscription_plan_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'individual'::public.account_type),
    false, true, false,
    plan_id
  )
  ON CONFLICT (id) DO NOTHING;

  IF subscribe_newsletter THEN
    INSERT INTO public.newsletter_subscribers (email, active, categories, subscribed_at)
    VALUES (NEW.email, true, ARRAY['blogs','top_sellers','featured_listings','weekly_digest'], NOW())
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill anyone still without a plan.
UPDATE public.profiles
SET subscription_plan_id = (SELECT id FROM public.subscription_plans WHERE key::text = 'normal')
WHERE subscription_plan_id IS NULL;
