drop function if exists public.servease_get_provider_profile(uuid);

create or replace function public.servease_get_provider_profile(p_user_id uuid)
returns table (
  id uuid,
  business_name text,
  bio text,
  service_description text,
  service_area text,
  years_experience integer,
  verification_status text,
  average_rating numeric,
  review_count integer
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pp.id,
    pp.business_name,
    pp.bio,
    pp.service_description,
    pp.service_area,
    pp.years_experience,
    pp.verification_status,
    pp.average_rating,
    pp.review_count
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
  limit 1;
$$;

drop function if exists public.servease_list_provider_service_listings(uuid);

create or replace function public.servease_list_provider_service_listings(
  p_service_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  provider_id uuid,
  provider_business_name text,
  service_id uuid,
  title text,
  description text,
  price numeric,
  pricing_mode text,
  average_rating numeric,
  review_count integer,
  verification_status text
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    ps.id,
    ps.provider_id,
    pp.business_name as provider_business_name,
    ps.service_id,
    ps.title,
    ps.description,
    ps.price,
    ps.pricing_mode,
    coalesce(pp.average_rating, 0) as average_rating,
    coalesce(pp.review_count, 0) as review_count,
    coalesce(pp.verification_status, 'pending') as verification_status
  from provider_catalog.provider_services ps
  left join provider_catalog.provider_profiles pp
    on pp.id = ps.provider_id
  where coalesce(ps.is_active, true) = true
    and coalesce(pp.is_active, true) = true
    and coalesce(pp.verification_status, 'pending') = 'approved'
    and (p_service_id is null or ps.service_id = p_service_id)
    and (p_provider_id is null or ps.provider_id = p_provider_id)
  order by coalesce(pp.average_rating, 0) desc, ps.title;
$$;

revoke all on function public.servease_get_provider_profile(uuid) from public, anon, authenticated;
revoke all on function public.servease_list_provider_service_listings(uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_get_provider_profile(uuid) to service_role;
grant execute on function public.servease_list_provider_service_listings(uuid, uuid) to service_role;
