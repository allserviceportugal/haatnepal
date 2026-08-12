-- Split "Hobbies & Sports" into separate "Hobbies" and "Sports" main categories
-- Structure:
-- Hobbies
--   - Books & Learning
--   - Books & Magazines
--   - Games (with Video Games, Board Games, Game Accessories)
--   - Kids & Baby
--   - Movies, Cinema & Theatre
--   - Musical Instruments
--
-- Sports
--   - Physical Sports Accessories
--     - Cycling
--     - Fishing
--     - Gym & Fitness
--     - Martial Arts
--     - Running

-- Step 1: Create new main categories
insert into public.categories (name, slug, parent_id)
values
  ('Hobbies', 'hobbies', null),
  ('Sports', 'sports', null)
on conflict (slug) do nothing;

-- Step 2: Move hobby subcategories to Hobbies (update parent_id)
update public.categories
set parent_id = (select id from public.categories where slug = 'hobbies')
where slug in ('books-learning', 'books-magazines', 'games', 'hobbies-kids-baby', 'movies-cinema-theatre', 'musical-instruments');

-- Step 3: Create "Physical Sports Accessories" under Sports
insert into public.categories (name, slug, parent_id)
select 'Physical Sports Accessories', 'physical-sports-accessories', id
from public.categories where slug = 'sports'
on conflict (slug) do nothing;

-- Step 4: Move sports subcategories to Physical Sports Accessories
update public.categories
set parent_id = (select id from public.categories where slug = 'physical-sports-accessories')
where slug in ('cycling-group', 'fishing-group', 'gym-fitness', 'martial-arts', 'running-group', 'sports-accessories');

-- Step 5: Remove the old "Hobbies & Sports" category if it has no children
delete from public.categories
where slug = 'hobbies-sports'
and not exists (
  select 1 from public.categories
  where parent_id = 'd71d7549-6c8a-4b06-be19-61946608a9d6'
);
