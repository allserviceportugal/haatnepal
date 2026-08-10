-- Custom OTP codes table for email verification
-- Stores 6-digit codes with 10-minute expiration

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null unique,
  metadata jsonb, -- store user data: display_name, phone, account_type
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  verified_at timestamptz,
  attempts integer not null default 0
);

-- Indexes for fast lookups
create index otp_codes_email_idx on public.otp_codes(email);
create index otp_codes_code_idx on public.otp_codes(code);
create index otp_codes_expires_at_idx on public.otp_codes(expires_at);

-- Auto-clean expired codes
create or replace function public.cleanup_expired_otp_codes()
returns void as $$
begin
  delete from public.otp_codes
  where expires_at < now() and verified_at is null;
end;
$$ language plpgsql;

alter table public.otp_codes enable row level security;

create policy "OTP codes are not publicly readable"
  on public.otp_codes for select
  using (false);

create policy "Service role can manage OTP codes"
  on public.otp_codes for all
  using (auth.role() = 'service_role');
