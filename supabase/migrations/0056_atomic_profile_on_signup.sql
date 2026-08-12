-- Restore atomic profile creation on auth.users insert + add OTP cleanup job
-- This fixes a migration 0032 bug where the profile-creation trigger was lost
-- when auto-subscribe was added. Now handles both in one transaction.

-- Update the function behind on_auth_user_created trigger to handle both
-- profile creation and newsletter subscription atomically
CREATE OR REPLACE FUNCTION subscribe_new_user()
RETURNS TRIGGER AS $$
DECLARE
  plan_id UUID;
BEGIN
  -- Resolve subscription_plan_id from plan_key if present
  IF (NEW.raw_user_meta_data ->> 'plan_key') IS NOT NULL AND
     (NEW.raw_user_meta_data ->> 'plan_key') != 'normal' THEN
    SELECT id INTO plan_id FROM public.subscription_plans
    WHERE key = (NEW.raw_user_meta_data ->> 'plan_key')
    LIMIT 1;
  END IF;

  -- Insert profile row atomically in same transaction as auth.users
  -- (trigger runs AFTER INSERT but still within the transaction)
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
  ON CONFLICT (id) DO NOTHING; -- Safety: should never conflict if trigger runs once

  -- Auto-subscribe to newsletter
  INSERT INTO public.newsletter_subscribers (email, active, categories, subscribed_at)
  VALUES (
    NEW.email,
    true,
    ARRAY['blogs','top_sellers','featured_listings','weekly_digest'],
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Schedule OTP codes cleanup job (hourly deletion of expired codes)
SELECT cron.schedule(
  'cleanup-expired-otp-codes-hourly',
  '0 * * * *',
  $$SELECT public.cleanup_expired_otp_codes();$$
) ON CONFLICT (jobname) DO UPDATE SET schedule = '0 * * * *';
