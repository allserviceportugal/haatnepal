-- haatnepal: "Tutoring & Classes" existed as a single bare leaf with no
-- subcategories or filters. Splits it into the actual types of
-- classes/courses/training people list (academic, language, professional
-- skills, music/arts, driving, fitness), each with its own filters.

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'tutoring-classes'), name, slug
from (values
  ('Academic Tutoring', 'academic-tutoring'),
  ('Language Classes', 'language-classes'),
  ('IT & Computer Training', 'it-computer-training'),
  ('Professional & Skill Development', 'professional-skill-development'),
  ('Music, Dance & Arts Classes', 'music-dance-arts-classes'),
  ('Driving Classes', 'driving-classes'),
  ('Yoga & Fitness Classes', 'yoga-fitness-classes'),
  ('Exam Preparation', 'exam-preparation')
) as t(name, slug);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'academic-tutoring'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('level', 'Level', 'select', '["Primary", "Secondary", "+2 / High School", "Bachelor''s", "Master''s", "Other"]', true, 1),
  ('subject', 'Subject', 'text', null, false, 2),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'language-classes'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('language', 'Language', 'select', '["English", "Japanese", "Korean", "Chinese (Mandarin)", "German", "French", "Hindi", "Other"]', true, 1),
  ('level', 'Level', 'select', '["Beginner", "Intermediate", "Advanced", "All levels"]', false, 2),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'it-computer-training'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('course_type', 'Course type', 'select', '["Programming", "Web Development", "Graphic Design", "Digital Marketing", "Office/Computer Basics", "Data Science", "Other"]', true, 1),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'professional-skill-development'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('course_type', 'Course type', 'select', '["Business & Management", "Finance & Accounting", "Cooking & Culinary", "Beauty & Cosmetology", "Tailoring", "Photography", "Other"]', true, 1),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'music-dance-arts-classes'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('class_type', 'Type', 'select', '["Instrumental music", "Vocal/Singing", "Dance", "Painting/Drawing", "Other"]', true, 1),
  ('level', 'Level', 'select', '["Beginner", "Intermediate", "Advanced", "All levels"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'driving-classes'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('vehicle_type', 'Vehicle type', 'select', '["Two-wheeler", "Car", "Heavy vehicle", "Other"]', true, 1),
  ('license_assistance', 'License assistance included', 'boolean', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'yoga-fitness-classes'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('class_type', 'Type', 'select', '["Yoga", "Gym/Fitness training", "Martial arts", "Zumba/Aerobics", "Meditation", "Other"]', true, 1),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'exam-preparation'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('exam_type', 'Exam type', 'select', '["SEE/+2 Boards", "Loksewa", "IELTS/TOEFL", "SAT/GRE/GMAT", "Medical/Engineering Entrance", "Other"]', true, 1),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);
