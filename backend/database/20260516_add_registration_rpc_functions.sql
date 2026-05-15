create or replace function public.servease_register_internal_user(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_contact_number text,
  p_role text
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
  if p_role not in ('customer', 'provider') then
    raise exception 'invalid_registration_role';
  end if;

  insert into identity_and_user.users (
    id,
    email,
    password_hash,
    full_name,
    contact_number,
    role,
    status
  )
  values (
    p_user_id,
    lower(trim(p_email)),
    'managed_by_supabase_auth',
    nullif(trim(p_full_name), ''),
    nullif(trim(p_contact_number), ''),
    p_role,
    'active'
  );

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
  where u.id = p_user_id;
end;
$$;

create or replace function public.servease_delete_internal_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  delete from identity_and_user.users
  where id = p_user_id;
end;
$$;

create or replace function public.servease_create_customer_profile(
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
begin
  delete from identity_and_user.customer_profiles
  where user_id = p_user_id;

  insert into identity_and_user.customer_profiles (
    user_id,
    address
  )
  values (
    p_user_id,
    nullif(trim(p_address), '')
  );

  return query
  select
    cp.id,
    cp.address
  from identity_and_user.customer_profiles cp
  where cp.user_id = p_user_id
  order by cp.created_at desc nulls last
  limit 1;
end;
$$;

create or replace function public.servease_create_provider_profile(
  p_user_id uuid,
  p_business_name text,
  p_service_description text,
  p_service_area text
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
  delete from provider_catalog.provider_profiles
  where user_id = p_user_id;

  insert into provider_catalog.provider_profiles (
    user_id,
    business_name,
    bio,
    service_description,
    service_area,
    verification_status,
    average_rating,
    review_count,
    is_active
  )
  values (
    p_user_id,
    nullif(trim(p_business_name), ''),
    nullif(trim(p_service_description), ''),
    nullif(trim(p_service_description), ''),
    nullif(trim(p_service_area), ''),
    'pending',
    0,
    0,
    true
  );

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

revoke all on function public.servease_register_internal_user(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_delete_internal_user(uuid) from public, anon, authenticated;
revoke all on function public.servease_create_customer_profile(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_create_provider_profile(uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.servease_register_internal_user(uuid, text, text, text, text) to service_role;
grant execute on function public.servease_delete_internal_user(uuid) to service_role;
grant execute on function public.servease_create_customer_profile(uuid, text) to service_role;
grant execute on function public.servease_create_provider_profile(uuid, text, text, text) to service_role;
