-- Create function to automatically subscribe new users
CREATE OR REPLACE FUNCTION subscribe_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO newsletter_subscribers (email, active, categories, subscribed_at)
  VALUES (
    NEW.email,
    true,
    ARRAY['blogs', 'top_sellers', 'featured_listings', 'weekly_digest'],
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION subscribe_new_user();

-- Sync all existing users to newsletter subscribers
INSERT INTO newsletter_subscribers (email, active, categories, subscribed_at)
SELECT
  email,
  true,
  ARRAY['blogs', 'top_sellers', 'featured_listings', 'weekly_digest'],
  created_at
FROM auth.users
ON CONFLICT (email) DO NOTHING;
