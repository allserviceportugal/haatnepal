-- Fix the broken subscribe_new_user() trigger function
-- The function was missing SET search_path = public and unqualified table name,
-- causing "relation newsletter_subscribers does not exist" when the trigger fired
-- during auth.users INSERT under supabase_auth_admin role

CREATE OR REPLACE FUNCTION subscribe_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.newsletter_subscribers (email, active, categories, subscribed_at)
  VALUES (
    NEW.email,
    true,
    ARRAY['blogs', 'top_sellers', 'featured_listings', 'weekly_digest'],
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
