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
  if p_role not in ('customer', 'provider', 'admin') then
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

revoke all on function public.servease_register_internal_user(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.servease_register_internal_user(uuid, text, text, text, text) to service_role;
