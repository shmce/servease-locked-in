-- Self-service account deletion support. Keeps historical aggregate records by
-- anonymizing internal profile rows, while Supabase Auth revocation is handled
-- by auth-service after this RPC succeeds.

create or replace function public.servease_anonymize_internal_user(p_user_id uuid)
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
set search_path = identity_and_user, provider_catalog, public
as $$
begin
  if p_user_id is null then
    raise exception 'invalid_user_request';
  end if;

  update identity_and_user.customer_profiles cp
  set address = null
  where cp.user_id = p_user_id;

  update provider_catalog.provider_profiles pp
  set
    business_name = 'Deleted provider',
    bio = null,
    service_description = null,
    service_area = null,
    is_active = false,
    updated_at = now()
  where pp.user_id = p_user_id;

  update identity_and_user.users u
  set
    email = 'deleted-' || replace(p_user_id::text, '-', '') || '@deleted.servease.local',
    password_hash = 'deleted',
    full_name = null,
    contact_number = null,
    status = 'inactive',
    updated_at = now()
  where u.id = p_user_id;

  if not found then
    raise exception 'user_not_found';
  end if;

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

revoke all on function public.servease_anonymize_internal_user(uuid) from public, anon, authenticated;
grant execute on function public.servease_anonymize_internal_user(uuid) to service_role;
