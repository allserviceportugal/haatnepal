alter table public.profiles
  add column email_confirmed boolean not null default false;

-- Index for quick lookups
create index idx_profiles_email_confirmed on public.profiles(email_confirmed);

-- Table to store email confirmation tokens
create table public.email_confirmation_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  email text not null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default now() + interval '24 hours',
  used_at timestamp with time zone
);

create index idx_confirmation_tokens_token on public.email_confirmation_tokens(token);
create index idx_confirmation_tokens_expires on public.email_confirmation_tokens(expires_at);
