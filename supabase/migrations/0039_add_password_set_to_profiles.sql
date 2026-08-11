-- Add password_set flag to profiles table
-- This tracks whether a user has set a real password (vs OTP-only during signup)
alter table public.profiles
  add column password_set boolean not null default false;

-- Existing users (if any before this migration) are all password_set=false by default
-- They'll be prompted to set a password on next login, or use forgot password to set one
