-- Upgrade applications now branch on who is applying.
--
-- An individual applying for Plus/Pro/Premium supplies citizenship + PAN details;
-- a business supplies business name, representative, business PAN and registration
-- number. Both supply contact details, an address and a supporting document.
--
-- business_name becomes nullable because it does not apply to individuals; the
-- per-type requirements are enforced by a CHECK instead, so a malformed row can
-- never be written regardless of which code path inserts it.

ALTER TABLE public.business_verification_requests
  ADD COLUMN IF NOT EXISTS applicant_type public.account_type NOT NULL DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS citizenship_number text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS business_registration_number text;

-- Individuals have no business name.
ALTER TABLE public.business_verification_requests
  ALTER COLUMN business_name DROP NOT NULL;

-- The pre-existing length check assumed business_name was always present.
ALTER TABLE public.business_verification_requests
  DROP CONSTRAINT IF EXISTS business_verification_requests_business_name_check;

ALTER TABLE public.business_verification_requests
  ADD CONSTRAINT business_verification_requests_business_name_check
  CHECK (business_name IS NULL OR char_length(business_name) >= 1);

-- Enforce the per-applicant-type required fields.
ALTER TABLE public.business_verification_requests
  DROP CONSTRAINT IF EXISTS business_verification_requests_applicant_fields_check;

ALTER TABLE public.business_verification_requests
  ADD CONSTRAINT business_verification_requests_applicant_fields_check
  CHECK (
    CASE applicant_type
      WHEN 'business' THEN
        business_name IS NOT NULL AND char_length(business_name) >= 1
        AND business_registration_number IS NOT NULL AND char_length(business_registration_number) >= 1
        AND pan_number IS NOT NULL AND char_length(pan_number) >= 1
      WHEN 'individual' THEN
        citizenship_number IS NOT NULL AND char_length(citizenship_number) >= 1
        AND pan_number IS NOT NULL AND char_length(pan_number) >= 1
      ELSE false
    END
  );

COMMENT ON COLUMN public.business_verification_requests.applicant_type IS
  'Account type at time of application; decides which fields are required.';
COMMENT ON COLUMN public.business_verification_requests.contact_person_name IS
  'Individual: full name. Business: authorised representative.';
COMMENT ON COLUMN public.business_verification_requests.business_address IS
  'Individual: residential address. Business: registered business address.';
