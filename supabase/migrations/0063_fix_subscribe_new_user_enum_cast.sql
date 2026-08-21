-- Fix business signups failing with "Database error saving new user".
--
-- subscribe_new_user() compared subscription_plans.key (enum subscription_tier)
-- against raw_user_meta_data ->> 'plan_key' (text). Postgres has no implicit
-- enum = text operator, so the lookup raised:
--   operator does not exist: subscription_tier = text
--
-- The branch only runs when plan_key is present and != 'normal', so individual
-- signups were unaffected and business signups failed at the trigger, rolling
-- back the auth.users insert. Introduced in 0056.
--
-- Cast the enum column to text rather than casting the metadata to the enum:
-- an unrecognised plan_key then resolves to NULL instead of raising.

CREATE OR REPLACE FUNCTION subscribe_new_user()
RETURNS TRIGGER AS $$
DECLARE
  plan_id UUID;
  subscribe_newsletter BOOLEAN;
BEGIN
  IF (NEW.raw_user_meta_data ->> 'plan_key') IS NOT NULL AND
     (NEW.raw_user_meta_data ->> 'plan_key') != 'normal' THEN
    SELECT id INTO plan_id FROM public.subscription_plans
    WHERE key::text = (NEW.raw_user_meta_data ->> 'plan_key')
    LIMIT 1;
  END IF;

  subscribe_newsletter := COALESCE(
    (NEW.raw_user_meta_data ->> 'subscribe_newsletter')::BOOLEAN,
    false
  );

  INSERT INTO public.profiles (
    id,
    display_name,
    email,
    phone,
    account_type,
    phone_verified,
    password_set,
    email_confirmed,
    subscription_plan_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'individual'::public.account_type),
    false,
    true,
    false,
    plan_id
  )
  ON CONFLICT (id) DO NOTHING;

  IF subscribe_newsletter THEN
    INSERT INTO public.newsletter_subscribers (email, active, categories, subscribed_at)
    VALUES (
      NEW.email,
      true,
      ARRAY['blogs','top_sellers','featured_listings','weekly_digest'],
      NOW()
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
