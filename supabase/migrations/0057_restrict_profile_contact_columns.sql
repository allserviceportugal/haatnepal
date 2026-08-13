-- Restrict phone and email to authenticated users only
-- Anonymous users can no longer query these columns via REST API

-- Revoke SELECT access to phone/email from anonymous (anon) role
-- This closes the direct-API PII leak while keeping other columns public
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT (phone, email) ON TABLES FROM anon;
REVOKE SELECT (phone, email) ON public.profiles FROM anon;

-- Explicitly grant authenticated users access (for logged-in users)
GRANT SELECT (phone, email) ON public.profiles TO authenticated;
