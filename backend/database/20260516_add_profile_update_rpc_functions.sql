create or replace function public.servease_update_internal_user(
  p_user_id uuid,
  p_full_name text,
  p_contact_number text
)
returns table (
  id uuid,
  email text,
  password_hash text,
  full_name text,
  contact_number text,
  role text,
  status text
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  update identity_and_user.users
  set
    full_name = nullif(trim(p_full_name), ''),
    contact_number = nullif(trim(p_contact_number), ''),
    updated_at = now()
  where users.id = p_user_id;

  return query
  select
    u.id,
    u.email,
    u.password_hash,
    u.full_name,
    u.contact_number,
    u.role,
    u.status
  from identity_and_user.users u
  where u.id = p_user_id
  limit 1;
end;
$$;

create or replace function public.servease_update_customer_profile(
  p_user_id uuid,
  p_address text
)
returns table (
  id uuid,
  address text
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
declare
  v_profile_id uuid;
begin
  select cp.id
  into v_profile_id
  from identity_and_user.customer_profiles cp
  where cp.user_id = p_user_id
  order by cp.created_at desc nulls last
  limit 1;

  if v_profile_id is null then
    insert into identity_and_user.customer_profiles (
      user_id,
      address
    )
    values (
      p_user_id,
      nullif(trim(p_address), '')
    )
    returning customer_profiles.id into v_profile_id;
  else
    update identity_and_user.customer_profiles
    set address = nullif(trim(p_address), '')
    where customer_profiles.id = v_profile_id;
  end if;

  return query
  select
    cp.id,
    cp.address
  from identity_and_user.customer_profiles cp
  where cp.id = v_profile_id
  limit 1;
end;
$$;

create or replace function public.servease_update_provider_profile(
  p_user_id uuid,
  p_business_name text
)
returns table (
  id uuid,
  business_name text,
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
    updated_at = now()
  where provider_profiles.user_id = p_user_id;

  return query
  select
    pp.id,
    pp.business_name,
    pp.verification_status,
    pp.average_rating,
    pp.review_count
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
  limit 1;
end;
$$;

revoke all on function public.servease_update_internal_user(uuid, text, text) from public, anon, authenticated;
revoke all on function public.servease_update_customer_profile(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_update_provider_profile(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_update_internal_user(uuid, text, text) to service_role;
grant execute on function public.servease_update_customer_profile(uuid, text) to service_role;
grant execute on function public.servease_update_provider_profile(uuid, text) to service_role;
