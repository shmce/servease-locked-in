-- Owner: Catalog and Booking services
-- Purpose: Include provider booking aggregates on admin provider summaries.

drop function if exists public.servease_admin_update_provider_status(uuid, text, text);
drop function if exists public.servease_admin_get_provider(uuid);
drop function if exists public.servease_admin_list_providers(text, text, integer);

create function public.servease_admin_list_providers(
  p_status text default null,
  p_query text default null,
  p_limit integer default 200
)
returns table (
  id uuid,
  user_id uuid,
  business_name text,
  bio text,
  service_description text,
  service_area text,
  years_experience integer,
  verification_status text,
  average_rating numeric,
  review_count integer,
  total_bookings integer,
  completion_rate numeric,
  is_active boolean,
  created_at timestamptz,
  approved_by_user_id uuid,
  approved_by_name text,
  user_email text,
  user_full_name text,
  user_contact_number text,
  user_status text
)
language sql
security definer
set search_path = provider_catalog, booking, public
as $$
  select
    pp.id,
    pp.user_id,
    pp.business_name,
    pp.bio,
    pp.service_description,
    pp.service_area,
    pp.years_experience,
    coalesce(pp.verification_status, 'pending') as verification_status,
    coalesce(pp.average_rating, 0) as average_rating,
    coalesce(pp.review_count, 0) as review_count,
    booking_stats.total_bookings,
    booking_stats.completion_rate,
    coalesce(pp.is_active, true) as is_active,
    pp.created_at,
    approved.decided_by,
    coalesce(
      nullif(trim(admin_user.full_name), ''),
      nullif(trim(approved_auth.raw_user_meta_data ->> 'full_name'), ''),
      approved_auth.email,
      approved.decided_by::text
    ) as approved_by_name,
    provider_user.email,
    provider_user.full_name,
    provider_user.contact_number,
    provider_user.status
  from provider_catalog.provider_profiles pp
  left join identity_and_user.users provider_user on provider_user.id = pp.user_id
  left join lateral (
    select
      count(*)::integer as total_bookings,
      case
        when count(*) = 0 then null
        else round(
          (count(*) filter (where b.status = 'completed'))::numeric * 100
          / count(*)::numeric,
          0
        )
      end as completion_rate
    from booking.bookings b
    where b.provider_id = pp.id
  ) booking_stats on true
  left join lateral (
    select d.decided_by
    from provider_catalog.provider_application_decisions d
    where d.provider_id = pp.id
      and d.decision = 'approved'
    order by d.created_at desc
    limit 1
  ) approved on true
  left join identity_and_user.users admin_user on admin_user.id = approved.decided_by
  left join auth.users approved_auth on approved_auth.id = approved.decided_by
  where (
      p_status is null
      or coalesce(pp.verification_status, 'pending') = p_status
      or (
        p_status = 'suspended'
        and coalesce(pp.is_active, true) = false
        and coalesce(pp.verification_status, 'pending') = 'approved'
      )
    )
    and (
      nullif(trim(coalesce(p_query, '')), '') is null
      or pp.id::text ilike '%' || trim(p_query) || '%'
      or pp.user_id::text ilike '%' || trim(p_query) || '%'
      or coalesce(pp.business_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(pp.service_area, '') ilike '%' || trim(p_query) || '%'
      or coalesce(provider_user.email, '') ilike '%' || trim(p_query) || '%'
      or coalesce(provider_user.full_name, '') ilike '%' || trim(p_query) || '%'
    )
  order by pp.created_at desc nulls last
  limit least(greatest(coalesce(p_limit, 200), 1), 200);
$$;

create function public.servease_admin_get_provider(
  p_provider_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  business_name text,
  bio text,
  service_description text,
  service_area text,
  years_experience integer,
  verification_status text,
  average_rating numeric,
  review_count integer,
  total_bookings integer,
  completion_rate numeric,
  is_active boolean,
  created_at timestamptz,
  approved_by_user_id uuid,
  approved_by_name text,
  user_email text,
  user_full_name text,
  user_contact_number text,
  user_status text
)
language sql
security definer
set search_path = provider_catalog, booking, public
as $$
  select *
  from public.servease_admin_list_providers(null, p_provider_id::text, 1) provider
  where provider.id = p_provider_id
  limit 1;
$$;

create function public.servease_admin_update_provider_status(
  p_provider_id uuid,
  p_status text,
  p_reason text default null
)
returns table (
  id uuid,
  user_id uuid,
  business_name text,
  bio text,
  service_description text,
  service_area text,
  years_experience integer,
  verification_status text,
  average_rating numeric,
  review_count integer,
  total_bookings integer,
  completion_rate numeric,
  is_active boolean,
  created_at timestamptz,
  approved_by_user_id uuid,
  approved_by_name text,
  user_email text,
  user_full_name text,
  user_contact_number text,
  user_status text
)
language plpgsql
security definer
set search_path = provider_catalog, booking, public
as $$
begin
  if p_provider_id is null
    or p_status not in ('pending', 'approved', 'rejected', 'suspended') then
    raise exception 'invalid_provider_request';
  end if;

  update provider_catalog.provider_profiles pp
  set verification_status = case
        when p_status in ('pending', 'approved', 'rejected') then p_status
        else pp.verification_status
      end,
      is_active = p_status = 'approved',
      updated_at = now()
  where pp.id = p_provider_id;

  if not found then
    raise exception 'provider_not_found';
  end if;

  return query
    select * from public.servease_admin_get_provider(p_provider_id);
end;
$$;

revoke all on function public.servease_admin_list_providers(text, text, integer)
  from public, anon, authenticated;
revoke all on function public.servease_admin_get_provider(uuid)
  from public, anon, authenticated;
revoke all on function public.servease_admin_update_provider_status(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.servease_admin_list_providers(text, text, integer)
  to service_role;
grant execute on function public.servease_admin_get_provider(uuid)
  to service_role;
grant execute on function public.servease_admin_update_provider_status(uuid, text, text)
  to service_role;
