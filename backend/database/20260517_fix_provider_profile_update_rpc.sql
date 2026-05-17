drop function if exists public.servease_update_provider_profile(uuid, text);

create or replace function public.servease_update_provider_profile(
  p_user_id uuid,
  p_business_name text,
  p_bio text,
  p_service_description text,
  p_service_area text,
  p_years_experience integer
)
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
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  update provider_catalog.provider_profiles
  set
    business_name = nullif(trim(p_business_name), ''),
    bio = nullif(trim(coalesce(p_bio, '')), ''),
    service_description = nullif(trim(coalesce(p_service_description, '')), ''),
    service_area = nullif(trim(coalesce(p_service_area, '')), ''),
    years_experience = p_years_experience,
    updated_at = now()
  where provider_profiles.user_id = p_user_id;

  return query
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
end;
$$;

revoke all on function public.servease_update_provider_profile(uuid, text, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.servease_update_provider_profile(uuid, text, text, text, text, integer) to service_role;
