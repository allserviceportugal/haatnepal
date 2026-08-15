-- Function to get listing average rating and count
create or replace function public.get_listing_average_rating(p_listing_id uuid)
returns table (average numeric, count bigint) as $$
begin
  return query
  select
    coalesce(round(avg(rating)::numeric, 1), 0::numeric) as average,
    count(*) as count
  from public.listing_reviews
  where listing_id = p_listing_id;
end;
$$ language plpgsql stable;
