import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bmlfzeoqveysbzrfzmpb.supabase.co',
  'sb_publishable_6A4Mn0giqkquOJQX3SlZ9g_WHDxTzNd'
);

// Check if listing_reviews table exists and has reviews
const { data: tableCheck, error: tableError } = await supabase
  .from('listing_reviews')
  .select('count(*)', { count: 'exact', head: true });

if (tableError) {
  console.log('✗ Table check failed:', tableError.message);
} else {
  console.log('✓ listing_reviews table exists');
}

// Try to fetch a listing page and check if it loads
console.log('\nChecking production site...');
try {
  const response = await fetch('https://haatnepal.com');
  console.log(`✓ haatnepal.com returns: ${response.status}`);
  
  // Check if the page contains review-related text
  const html = await response.text();
  if (html.includes('reviews') || html.includes('rating') || html.includes('Leave a review')) {
    console.log('✓ Review components found in HTML');
  } else {
    console.log('⚠ Review components may not be rendered yet (could be JS-loaded)');
  }
} catch (err) {
  console.log('✗ Error checking site:', err.message);
}
