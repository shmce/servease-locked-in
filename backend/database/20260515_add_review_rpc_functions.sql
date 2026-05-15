create unique index if not exists reviews_booking_reviewer_unique
  on trust_and_reputation.reviews (booking_id, reviewer_id);

create or replace function public.servease_create_review(
  p_booking_id uuid,
  p_provider_id uuid,
  p_reviewer_id uuid,
  p_rating integer,
  p_review_text text default null
)
returns table (
  id uuid,
  booking_id uuid,
  provider_id uuid,
  reviewer_id uuid,
  rating integer,
  review_text text,
  is_flagged boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = trust_and_reputation, public
as $$
begin
  if p_booking_id is null
    or p_provider_id is null
    or p_reviewer_id is null
    or p_rating is null
    or p_rating < 1
    or p_rating > 5 then
    raise exception 'invalid_review_request';
  end if;

  insert into trust_and_reputation.reviews (
    booking_id,
    provider_id,
    reviewer_id,
    rating,
    review_text,
    is_flagged
  )
  values (
    p_booking_id,
    p_provider_id,
    p_reviewer_id,
    p_rating,
    nullif(trim(coalesce(p_review_text, '')), ''),
    false
  )
  on conflict (booking_id, reviewer_id)
  do update set
    rating = excluded.rating,
    review_text = excluded.review_text,
    is_flagged = false;

  return query
    select
      r.id,
      r.booking_id,
      r.provider_id,
      r.reviewer_id,
      r.rating,
      r.review_text,
      r.is_flagged,
      r.created_at
    from trust_and_reputation.reviews r
    where r.booking_id = p_booking_id
      and r.reviewer_id = p_reviewer_id
    limit 1;
end;
$$;

create or replace function public.servease_list_provider_reviews(
  p_provider_id uuid
)
returns table (
  id uuid,
  booking_id uuid,
  provider_id uuid,
  reviewer_id uuid,
  rating integer,
  review_text text,
  is_flagged boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = trust_and_reputation, public
as $$
  select
    r.id,
    r.booking_id,
    r.provider_id,
    r.reviewer_id,
    r.rating,
    r.review_text,
    r.is_flagged,
    r.created_at
  from trust_and_reputation.reviews r
  where r.provider_id = p_provider_id
    and coalesce(r.is_flagged, false) = false
  order by r.created_at desc nulls last
  limit 50;
$$;

revoke all on function public.servease_create_review(uuid, uuid, uuid, integer, text) from public, anon, authenticated;
revoke all on function public.servease_list_provider_reviews(uuid) from public, anon, authenticated;

grant execute on function public.servease_create_review(uuid, uuid, uuid, integer, text) to service_role;
grant execute on function public.servease_list_provider_reviews(uuid) to service_role;
