-- otp_codes had two problems that compound as the user base grows.
--
-- 1. `code` was globally UNIQUE. Verification always looks a code up by
--    email + code (see verifyCodeAction), so global uniqueness buys nothing and
--    means two different users can never hold the same 6-digit number at the
--    same time. With only 900k possible codes and insertOtpCodeWithRetry giving
--    up after 3 attempts, signups would start failing as rows accumulated.
--
-- 2. cleanup_expired_otp_codes() only ever deleted *unverified* expired rows and
--    was never scheduled, so nothing was deleted at all - every code ever issued
--    stayed in the table holding its number hostage.
--
-- Scope uniqueness to the rows that actually matter (an email's live codes) and
-- schedule real cleanup.

-- pg_cron was not installed, which is also why the jobs in 0047 never ran.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Global uniqueness on the code itself is the collision source: drop it.
ALTER TABLE public.otp_codes DROP CONSTRAINT IF EXISTS otp_codes_code_key;

-- Prevent the same email holding two identical *live* codes. Verified and
-- expired rows are excluded, so old codes never block a new one.
DROP INDEX IF EXISTS public.otp_codes_email_code_active_idx;
CREATE UNIQUE INDEX otp_codes_email_code_active_idx
  ON public.otp_codes (email, code)
  WHERE verified_at IS NULL;

-- Delete anything expired (verified or not) and verified rows past a short
-- retention window. Nothing reads a code after it has been used.
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.otp_codes
  WHERE expires_at < now()
     OR (verified_at IS NOT NULL AND verified_at < now() - interval '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Run it every 15 minutes. Unschedule first so re-running is idempotent.
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-expired-otp-codes');
EXCEPTION WHEN OTHERS THEN
  NULL; -- not scheduled yet
END $$;

SELECT cron.schedule(
  'cleanup-expired-otp-codes',
  '*/15 * * * *',
  $$SELECT public.cleanup_expired_otp_codes()$$
);

-- Clear the backlog immediately.
SELECT public.cleanup_expired_otp_codes();
