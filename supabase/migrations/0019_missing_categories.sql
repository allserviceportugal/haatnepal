-- haatnepal: fill remaining gaps from user request — Books & Learning as a
-- top-level (not buried), Movies & Entertainment (cinema/theater/tickets),
-- Events & Happenings, Government Notices (tenders/RFP/etc), and Meats &
-- Poultry under Agriculture.

-- =========================================================================
-- Books & Learning (new top-level)
-- =========================================================================
insert into public.categories (name, slug, icon) values
  ('Books & Learning', 'books-learning', 'book-open');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'books-learning'), name, slug
from (values
  ('Books', 'books'),
  ('Magazines & Newspapers', 'magazines-newspapers'),
  ('Comics', 'comics'),
  ('Educational Materials', 'educational-materials'),
  ('E-Books & Audio Books', 'ebooks-audiobooks')
) as t(name, slug);

-- =========================================================================
-- Movies, Cinema & Theatre (new top-level)
-- =========================================================================
insert into public.categories (name, slug, icon) values
  ('Movies, Cinema & Theatre', 'movies-cinema-theatre', 'film');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'movies-cinema-theatre'), name, slug
from (values
  ('Movie Tickets', 'movie-tickets'),
  ('Theatre & Play Tickets', 'theatre-play-tickets'),
  ('Concert & Music Event Tickets', 'concert-music-tickets'),
  ('Cinema Equipment & Accessories', 'cinema-equipment'),
  ('Movie DVDs & Blu-rays', 'movie-dvds-blurays')
) as t(name, slug);

-- =========================================================================
-- Events & Happenings (new top-level)
-- =========================================================================
insert into public.categories (name, slug, icon) values
  ('Events & Happenings', 'events-happenings', 'calendar');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'events-happenings'), name, slug
from (values
  ('Dance & Music Concerts', 'dance-music-concerts'),
  ('Exhibitions & Trade Fairs', 'exhibitions-trade-fairs'),
  ('Festivals', 'festivals'),
  ('Workshops & Seminars', 'workshops-seminars'),
  ('Sports Events', 'sports-events'),
  ('Community Events', 'community-events')
) as t(name, slug);

-- =========================================================================
-- Government Notices & Tenders (new top-level)
-- =========================================================================
insert into public.categories (name, slug, icon) values
  ('Government Notices & Tenders', 'government-notices-tenders', 'file-text');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'government-notices-tenders'), name, slug
from (values
  ('Tender Notices', 'tender-notices'),
  ('Expression of Interest', 'expression-of-interest'),
  ('Invitation for Bids', 'invitation-for-bids'),
  ('Request For Application', 'request-for-application'),
  ('Request for Proposal', 'request-for-proposal'),
  ('Vacancy Notices', 'vacancy-notices')
) as t(name, slug);

-- =========================================================================
-- Meats & Poultry (under Agriculture)
-- =========================================================================
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), 'Meats, Poultry & Fish', 'meats-poultry-fish';

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'meats-poultry-fish'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product type', 'select', '["Chicken", "Goat/Mutton", "Buffalo meat", "Fish", "Eggs", "Live animals", "Other"]', true, 1),
  ('quantity_unit', 'Sold by', 'select', '["Kilogram", "Pound", "Piece/Dozen", "Live animal"]', false, 2),
  ('fresh', 'Fresh today', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);
