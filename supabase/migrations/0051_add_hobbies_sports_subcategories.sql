-- Add missing Hobbies & Sports subcategories
-- 1. Martial Arts
-- 2. Games → Video Games, Board Games, Game Accessories
-- 3. Sports Accessories

-- Step 1: Add main subcategories under Hobbies & Sports
insert into public.categories (name, slug, parent_id)
values
  ('Martial Arts', 'martial-arts', 'd71d7549-6c8a-4b06-be19-61946608a9d6'),
  ('Games', 'games', 'd71d7549-6c8a-4b06-be19-61946608a9d6'),
  ('Sports Accessories', 'sports-accessories', 'd71d7549-6c8a-4b06-be19-61946608a9d6')
on conflict (slug) do nothing;

-- Step 2: Add game sub-categories (Video Games, Board Games, Game Accessories)
insert into public.categories (name, slug, parent_id)
select 'Video Games', 'video-games', id from public.categories where slug = 'games'
on conflict (slug) do nothing;

insert into public.categories (name, slug, parent_id)
select 'Board Games', 'board-games', id from public.categories where slug = 'games'
on conflict (slug) do nothing;

insert into public.categories (name, slug, parent_id)
select 'Game Accessories', 'game-accessories', id from public.categories where slug = 'games'
on conflict (slug) do nothing;

-- Step 3: Add game accessories branches (Console, PC, Mobile, Board Game)
insert into public.categories (name, slug, parent_id)
select 'Console Accessories', 'gaming-console-accessories', id from public.categories where slug = 'game-accessories'
on conflict (slug) do nothing;

insert into public.categories (name, slug, parent_id)
select 'PC Gaming Accessories', 'gaming-pc-accessories', id from public.categories where slug = 'game-accessories'
on conflict (slug) do nothing;

insert into public.categories (name, slug, parent_id)
select 'Mobile Gaming Accessories', 'gaming-mobile-accessories', id from public.categories where slug = 'game-accessories'
on conflict (slug) do nothing;

insert into public.categories (name, slug, parent_id)
select 'Board Game Accessories', 'board-game-accessories', id from public.categories where slug = 'game-accessories'
on conflict (slug) do nothing;
