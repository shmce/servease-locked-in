create or replace function public.servease_get_internal_user(p_user_id uuid)
returns table (
  id uuid,
  email text,
  password_hash text,
  full_name text,
  contact_number text,
  role text,
  status text
)
language sql
security definer
set search_path = identity_and_user, public
as $$
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
$$;

create or replace function public.servease_get_customer_profile(p_user_id uuid)
returns table (
  id uuid,
  address text
)
language sql
security definer
set search_path = identity_and_user, public
as $$
  select
    cp.id,
    cp.address
  from identity_and_user.customer_profiles cp
  where cp.user_id = p_user_id
  order by cp.created_at desc nulls last
  limit 1;
$$;

create or replace function public.servease_get_provider_profile(p_user_id uuid)
returns table (
  id uuid,
  business_name text,
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
    pp.verification_status,
    pp.average_rating,
    pp.review_count
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
  limit 1;
$$;

create or replace function public.servease_smoke_seed_customer(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
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
    p_email,
    'managed_by_supabase_auth',
    'ServEase Smoke User',
    null,
    'customer',
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    contact_number = excluded.contact_number,
    role = excluded.role,
    status = excluded.status,
    updated_at = now();

  delete from identity_and_user.customer_profiles
  where user_id = p_user_id;

  insert into identity_and_user.customer_profiles (
    user_id,
    address
  )
  values (
    p_user_id,
    'Smoke test address'
  );
end;
$$;

create or replace function public.servease_smoke_cleanup_customer(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  delete from identity_and_user.customer_profiles
  where user_id = p_user_id;

  delete from identity_and_user.users
  where id = p_user_id;
end;
$$;

revoke all on function public.servease_get_internal_user(uuid) from public, anon, authenticated;
revoke all on function public.servease_get_customer_profile(uuid) from public, anon, authenticated;
revoke all on function public.servease_get_provider_profile(uuid) from public, anon, authenticated;
revoke all on function public.servease_smoke_seed_customer(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_customer(uuid) from public, anon, authenticated;

grant execute on function public.servease_get_internal_user(uuid) to service_role;
grant execute on function public.servease_get_customer_profile(uuid) to service_role;
grant execute on function public.servease_get_provider_profile(uuid) to service_role;
grant execute on function public.servease_smoke_seed_customer(uuid, text) to service_role;
grant execute on function public.servease_smoke_cleanup_customer(uuid) to service_role;
