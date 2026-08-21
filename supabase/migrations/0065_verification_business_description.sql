-- Upgrade applicants (Plus/Pro/Premium) now supply a description shown on their
-- public profile at /u/[userId].
--
-- Stored on the request so the submitted text is part of the application record
-- an admin reviews, and copied onto profiles.business_description at submit time
-- so it is live on the profile straight away. profiles.business_description is
-- already rendered by the public profile page and is already user-editable from
-- the dashboard profile form, so writing it here grants no new capability.

ALTER TABLE public.business_verification_requests
  ADD COLUMN IF NOT EXISTS business_description text;

ALTER TABLE public.business_verification_requests
  DROP CONSTRAINT IF EXISTS business_verification_requests_business_description_check;

ALTER TABLE public.business_verification_requests
  ADD CONSTRAINT business_verification_requests_business_description_check
  CHECK (business_description IS NULL OR char_length(business_description) <= 2000);

COMMENT ON COLUMN public.business_verification_requests.business_description IS
  'Public-facing description supplied with the upgrade application; mirrored to profiles.business_description.';
