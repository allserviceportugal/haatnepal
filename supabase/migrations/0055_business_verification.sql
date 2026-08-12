-- haatnepal: Business verification workflow for plan upgrades
-- Adds business_verification_requests table for tracking admin-reviewed upgrades
-- to Plus, Pro, and Premium tiers; allows instant downgrades without re-verification

-- =========================================================================
-- 1. BUSINESS VERIFICATION REQUESTS TABLE
-- =========================================================================

create table public.business_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  requested_plan_key public.subscription_tier not null check (requested_plan_key in ('plus', 'pro', 'premium')),
  business_name text not null check (char_length(business_name) >= 1),
  contact_person_name text not null check (char_length(contact_person_name) >= 1),
  contact_email text not null,
  contact_phone text not null,
  business_address text not null check (char_length(business_address) >= 1),
  registration_certificate_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text check (status = 'rejected' or rejection_reason is null),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial unique index: users can't have multiple pending requests at once
create unique index business_verification_requests_user_pending_idx
  on public.business_verification_requests (user_id)
  where status = 'pending';

create index business_verification_requests_status_idx on public.business_verification_requests (status);
create index business_verification_requests_created_at_idx on public.business_verification_requests (created_at desc);

alter table public.business_verification_requests enable row level security;

-- Users can insert their own verification requests
create policy "Users can create their own verification requests"
  on public.business_verification_requests for insert
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

-- Users can see their own verification requests
create policy "Users can see their own verification requests"
  on public.business_verification_requests for select
  using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- Admins can select all verification requests
create policy "Admins can view all verification requests"
  on public.business_verification_requests for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admins can update verification requests
create policy "Admins can update verification requests"
  on public.business_verification_requests for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (true);

-- =========================================================================
-- 2. VERIFICATION DOCUMENTS STORAGE BUCKET
-- =========================================================================

insert into storage.buckets (id, name, public) values ('verification-documents', 'verification-documents', false);

-- Authenticated users can upload documents to their own folder
create policy "Users upload verification documents to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can see their own documents; admins can see all
create policy "Users and admins can read verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

-- Users can delete their own documents
create policy "Users delete their own verification documents"
  on storage.objects for delete
  using (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
