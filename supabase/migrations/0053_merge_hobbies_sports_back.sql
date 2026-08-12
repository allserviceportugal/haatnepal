-- Merge 'Hobbies' and 'Sports' back into single 'Hobbies & Sports' main category
-- Restore to 15 main categories (hard rule per user)

-- Step 1: Rename the 'hobbies' row back to the original combined category
update public.categories
set name = 'Hobbies & Sports', slug = 'hobbies-sports'
where slug = 'hobbies';

-- Step 2: Re-parent 'Physical Sports Accessories' from 'sports' to the renamed 'hobbies-sports'
update public.categories
set parent_id = (select id from public.categories where slug = 'hobbies-sports')
where slug = 'physical-sports-accessories';

-- Step 3: Delete the now-empty 'sports' main category row
delete from public.categories
where slug = 'sports'
and not exists (
  select 1 from public.categories
  where parent_id = (select id from public.categories where slug = 'sports')
);
