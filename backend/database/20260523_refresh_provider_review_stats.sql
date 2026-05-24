create or replace function public.servease_refresh_provider_review_stats(
  p_provider_id uuid
)
returns void
language plpgsql
security definer
set search_path = provider_catalog, trust_and_reputation, public
as $$
begin
  if p_provider_id is null then
    return;
  end if;

  update provider_catalog.provider_profiles pp
  set
    average_rating = coalesce(stats.average_rating, 0),
    review_count = coalesce(stats.review_count, 0),
    updated_at = now()
  from (
    select
      p_provider_id as provider_id,
      round(avg(r.rating)::numeric, 2) as average_rating,
      count(r.id)::integer as review_count
    from trust_and_reputation.reviews r
    where r.provider_id = p_provider_id
      and coalesce(r.is_flagged, false) = false
  ) stats
  where pp.id = stats.provider_id;
end;
$$;

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
declare
  v_review_id uuid;
  v_previous_provider_id uuid;
begin
  if p_booking_id is null
    or p_provider_id is null
    or p_reviewer_id is null
    or p_rating is null
    or p_rating < 1
    or p_rating > 5 then
    raise exception 'invalid_review_request';
  end if;

  select r.provider_id
    into v_previous_provider_id
  from trust_and_reputation.reviews r
  where r.booking_id = p_booking_id
    and r.reviewer_id = p_reviewer_id
  for update;

  update trust_and_reputation.reviews r
  set
    provider_id = p_provider_id,
    rating = p_rating,
    review_text = nullif(trim(coalesce(p_review_text, '')), ''),
    is_flagged = false
  where r.booking_id = p_booking_id
    and r.reviewer_id = p_reviewer_id
  returning r.id into v_review_id;

  if v_review_id is null then
    begin
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
      returning trust_and_reputation.reviews.id into v_review_id;
    exception
      when unique_violation then
        update trust_and_reputation.reviews r
        set
          provider_id = p_provider_id,
          rating = p_rating,
          review_text = nullif(trim(coalesce(p_review_text, '')), ''),
          is_flagged = false
        where r.booking_id = p_booking_id
          and r.reviewer_id = p_reviewer_id
        returning r.id into v_review_id;
    end;
  end if;

  perform public.servease_refresh_provider_review_stats(p_provider_id);
  if v_previous_provider_id is distinct from p_provider_id then
    perform public.servease_refresh_provider_review_stats(v_previous_provider_id);
  end if;

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
    where r.id = v_review_id
    limit 1;
end;
$$;

create or replace function public.servease_admin_set_review_flagged(
  p_review_id uuid,
  p_is_flagged boolean
)
returns table (
  id uuid,
  booking_id uuid,
  provider_id uuid,
  reviewer_id uuid,
  reviewer_full_name text,
  rating integer,
  review_text text,
  is_flagged boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, trust_and_reputation, identity_and_user
as $$
declare
  v_provider_id uuid;
begin
  update trust_and_reputation.reviews r
  set is_flagged = coalesce(p_is_flagged, false)
  where r.id = p_review_id
  returning r.provider_id into v_provider_id;

  perform public.servease_refresh_provider_review_stats(v_provider_id);

  return query
    select
      r.id,
      r.booking_id,
      r.provider_id,
      r.reviewer_id,
      iu.full_name,
      r.rating,
      r.review_text,
      coalesce(r.is_flagged, false),
      r.created_at
    from trust_and_reputation.reviews r
    left join identity_and_user.users iu on iu.id = r.reviewer_id
    where r.id = p_review_id;
end;
$$;

do $$
declare
  v_provider_id uuid;
begin
  for v_provider_id in
    select pp.id
    from provider_catalog.provider_profiles pp
  loop
    perform public.servease_refresh_provider_review_stats(v_provider_id);
  end loop;
end;
$$;

revoke all on function public.servease_refresh_provider_review_stats(uuid) from public, anon, authenticated;
revoke all on function public.servease_create_review(uuid, uuid, uuid, integer, text) from public, anon, authenticated;
revoke all on function public.servease_admin_set_review_flagged(uuid, boolean) from public, anon, authenticated;

grant execute on function public.servease_refresh_provider_review_stats(uuid) to service_role;
grant execute on function public.servease_create_review(uuid, uuid, uuid, integer, text) to service_role;
grant execute on function public.servease_admin_set_review_flagged(uuid, boolean) to service_role;
