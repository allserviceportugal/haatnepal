-- haatnepal: "Tours & Activities" under Services — treks, tours, guides,
-- and other bookable experiences, a major category for the Nepal market
-- that Services didn't cover yet.

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'services'), 'Tours & Activities', 'tours-activities';

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'tours-activities'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('activity_type', 'Activity type', 'select', '["Trekking", "City tour", "Wildlife/Safari", "Adventure sports", "Cultural/Heritage tour", "Pilgrimage", "Day hike", "Guide/Porter service", "Other"]', true, 1),
  ('duration', 'Duration', 'text', null, false, 2),
  ('group_size', 'Group size', 'text', null, false, 3),
  ('difficulty_level', 'Difficulty level', 'select', '["Easy", "Moderate", "Challenging", "Difficult"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);
