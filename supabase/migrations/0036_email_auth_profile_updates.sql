-- haatnepal: Email-only authentication + Phone in profiles
-- Migrate from password auth to email OTP, add phone as compulsory field

-- Add email column to profiles (for reference, will sync with auth.users)
alter table public.profiles
add column if not exists email text unique,
add column if not exists phone_verified boolean default false;

-- Make phone compulsory (it's required for seller contact in classified listings)
alter table public.profiles
alter column phone set not null;

-- Migrate email from auth.users (one-time operation)
update public.profiles p
set email = (select email from auth.users where id = p.id)
where email is null;

-- Create index for email lookups
create index if not exists profiles_email_idx on public.profiles(email);

-- Create index for phone lookups (for contact visibility)
create index if not exists profiles_phone_verified_idx on public.profiles(phone_verified);
