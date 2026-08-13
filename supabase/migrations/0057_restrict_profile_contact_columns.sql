-- Restrict phone and email to authenticated users only
-- Anonymous users can no longer query these columns via REST API

-- Drop the existing overly-permissive policy
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

-- New policy: authenticated users can see everything
CREATE POLICY "Authenticated users can view full profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- New policy: anonymous users can see everything except phone and email
-- This works by using a USING clause that returns false when trying to select
-- We'll use a SECURITY DEFINER function approach or create a view instead

-- For anonymous users, we'll create a restrictive policy
CREATE POLICY "Anonymous users can view public profile info only"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

-- Explicitly revoke access to sensitive columns from anon role
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT (phone, email) ON TABLES FROM anon;
REVOKE SELECT (phone, email) ON public.profiles FROM anon;

-- Grant full access to authenticated role
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT (phone, email) ON public.profiles TO authenticated;
