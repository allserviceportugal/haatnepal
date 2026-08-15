import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bmlfzeoqveysbzrfzmpb.supabase.co',
  'sb_publishable_6A4Mn0giqkquOJQX3SlZ9g_WHDxTzNd'
);

// Check if table exists
const { data, error } = await supabase
  .from('listing_reviews')
  .select('*')
  .limit(1);

if (error) {
  console.log('✗ Error:', error.message);
} else {
  console.log('✓ listing_reviews table is accessible');
  console.log(`✓ ${data?.length || 0} reviews exist in database`);
}

// Check the function
const { data: ratingData, error: ratingError } = await supabase.rpc('get_listing_average_rating', {
  p_listing_id: '68dff538-90e9-4fe7-b9bb-4ae689197157'
});

if (ratingError) {
  console.log('✗ Rating function error:', ratingError.message);
} else {
  console.log('✓ Rating function works');
  console.log(`  Average: ${ratingData?.[0]?.average}, Count: ${ratingData?.[0]?.count}`);
}
