-- Restore atomic profile creation on auth.users insert + add OTP/signup cleanup jobs
-- Fixes migration 0032 bug where profile-creation trigger was lost
-- Also adds signup rate-limit tracking table

-- Update the function behind on_auth_user_created trigger to handle both
-- profile creation and conditional newsletter subscription atomically
CREATE OR REPLACE FUNCTION subscribe_new_user()
RETURNS TRIGGER AS $$
DECLARE
  plan_id UUID;
  subscribe_newsletter BOOLEAN;
BEGIN
  -- Resolve subscription_plan_id from plan_key if present
  IF (NEW.raw_user_meta_data ->> 'plan_key') IS NOT NULL AND
     (NEW.raw_user_meta_data ->> 'plan_key') != 'normal' THEN
    SELECT id INTO plan_id FROM public.subscription_plans
    WHERE key = (NEW.raw_user_meta_data ->> 'plan_key')
    LIMIT 1;
  END IF;

  -- Check if user opted-in to newsletter
  subscribe_newsletter := COALESCE(
    (NEW.raw_user_meta_data ->> 'subscribe_newsletter')::BOOLEAN,
    false
  );

  -- Insert profile row atomically in same transaction as auth.users
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

  -- Subscribe to newsletter only if user opted-in (respects checkbox state)
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

-- Signup rate-limiting table (IP-based, 100/hour per IP)
CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS signup_attempts_ip_created_idx ON public.signup_attempts(ip, created_at DESC);

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prevent public access to signup_attempts" ON public.signup_attempts
  FOR ALL USING (false)
  FOR ALL WITH CHECK (false);

-- Cleanup old signup attempts (older than 24 hours) daily
CREATE OR REPLACE FUNCTION cleanup_old_signup_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.signup_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Schedule cleanup jobs (via pg_cron)
SELECT cron.unschedule('cleanup-expired-otp-codes-hourly');
SELECT cron.schedule(
  'cleanup-expired-otp-codes-hourly',
  '0 * * * *',
  $$SELECT public.cleanup_expired_otp_codes();$$
);

SELECT cron.unschedule('cleanup-old-signup-attempts-daily');
SELECT cron.schedule(
  'cleanup-old-signup-attempts-daily',
  '0 2 * * *',
  $$SELECT public.cleanup_old_signup_attempts();$$
);
