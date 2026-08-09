-- haatnepal: Jobs category overhaul — praca.pl/Indeed-grade job board with on-site
-- applications, CV/resume upload, salary range filtering, application deadlines, and
-- employer dashboard.

-- =========================================================================
-- PART 1: Extended job categories (16 new leaves under 'jobs' top-level)
-- =========================================================================

-- Keep all 12 existing Jobs leaves (it-software, sales-marketing, driver-jobs, etc.).
-- Add 16 new leaves for comprehensive industry coverage.
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'jobs'), name, slug
from (values
  ('HR & Recruitment', 'hr-recruitment'),
  ('Banking, Finance & Insurance', 'banking-insurance'),
  ('Engineering', 'engineering'),
  ('Manufacturing & Production', 'manufacturing-production'),
  ('Logistics & Warehouse', 'logistics-warehouse'),
  ('Administrative & Office Support', 'admin-office-support'),
  ('Legal', 'legal-jobs'),
  ('Agriculture & Farming', 'agriculture-jobs'),
  ('Security Services', 'security-jobs'),
  ('Beauty & Wellness', 'beauty-wellness-jobs'),
  ('Media, Design & Creative', 'media-design-creative'),
  ('NGO & Social Work', 'ngo-social-work'),
  ('Government & Public Sector', 'government-jobs'),
  ('Telecommunications', 'telecom-jobs'),
  ('Management & Executive', 'management-executive'),
  ('Freelance & Remote Work', 'freelance-remote')
) as t(name, slug);

-- =========================================================================
-- PART 2: Expanded department-level Jobs attributes (inherited by all leaves)
-- =========================================================================

-- Broaden employment_type: add Temporary, Freelance, Volunteer to existing options
delete from public.category_attributes
where category_id = (select id from public.categories where slug = 'jobs')
and key = 'employment_type';

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'jobs'), 'employment_type', 'Employment Type',
  'select'::public.attribute_input_type,
  '["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Freelance", "Volunteer"]'::jsonb,
  true, 1;

-- Add education_level
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'jobs'), 'education_level', 'Education Level',
  'select'::public.attribute_input_type,
  '["No requirement", "SEE/SLC", "+2/Intermediate", "Bachelor\'s", "Master\'s", "PhD", "Vocational/Diploma"]'::jsonb,
  false, 5;

-- Add required_skills
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'jobs'), 'required_skills', 'Required Skills',
  'text'::public.attribute_input_type,
  null,
  false, 6;

-- Delete old free-text salary_range attribute and cascade its values
delete from public.listing_attribute_values
where attribute_id in (select id from public.category_attributes where key = 'salary_range' and category_id = (select id from public.categories where slug = 'jobs'));

delete from public.category_attributes
where category_id = (select id from public.categories where slug = 'jobs')
and key = 'salary_range';

-- =========================================================================
-- PART 3: Dedicated typed salary/job columns on listings
-- =========================================================================

alter table public.listings
  add column company_name text,
  add column salary_min numeric,
  add column salary_max numeric,
  add column salary_period text check (salary_period in ('monthly','yearly','hourly','daily')),
  add column salary_negotiable boolean not null default false,
  add column vacancies_count integer,
  add column application_deadline date,
  add column external_apply_url text;

-- =========================================================================
-- PART 4: Job applications table (structured applications with resume upload)
-- =========================================================================

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  cover_note text check (cover_note is null or (char_length(cover_note) >= 1 and char_length(cover_note) <= 2000)),
  resume_path text,
  created_at timestamptz not null default now(),
  unique (listing_id, applicant_id)
);

alter table public.job_applications enable row level security;

-- Applicants can insert, select, and delete their own applications
create policy "Applicants can submit their own applications"
  on public.job_applications for insert
  with check (auth.role() = 'authenticated' and auth.uid() = applicant_id);

create policy "Applicants can see their own applications"
  on public.job_applications for select
  using (
    auth.role() = 'authenticated' and auth.uid() = applicant_id
  );

create policy "Applicants can withdraw their own applications"
  on public.job_applications for delete
  using (auth.role() = 'authenticated' and auth.uid() = applicant_id);

-- Listing owners (employers) can see applications for their jobs
create policy "Employers can see applications to their jobs"
  on public.job_applications for select
  using (
    auth.role() = 'authenticated' and exists (
      select 1 from public.listings
      where id = listing_id and seller_id = auth.uid()
    )
  );

create index job_applications_listing_id_idx on public.job_applications (listing_id);
create index job_applications_applicant_id_idx on public.job_applications (applicant_id);

-- =========================================================================
-- PART 5: Resumes storage bucket (private, not public)
-- =========================================================================

insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);

-- Authenticated users can upload resumes to their own folder
create policy "Users upload resumes to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Applicants can see their own resumes; employers can see resumes on their job applications
create policy "Applicants and employers can read resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and auth.role() = 'authenticated'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.job_applications ja
        join public.listings l on l.id = ja.listing_id
        where ja.resume_path = name
        and l.seller_id = auth.uid()
      )
    )
  );

-- Applicants can delete their own resumes
create policy "Users delete their own resumes"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
