create or replace function public.servease_smoke_bind_provider_user(
  p_provider_id uuid,
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = provider_catalog, identity_and_user, public
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
    'ServEase Smoke Provider',
    null,
    'provider',
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

  update provider_catalog.provider_profiles
  set
    user_id = p_user_id,
    updated_at = now()
  where id = p_provider_id;
end;
$$;

revoke all on function public.servease_smoke_bind_provider_user(uuid, uuid, text) from public, anon, authenticated;

grant execute on function public.servease_smoke_bind_provider_user(uuid, uuid, text) to service_role;
