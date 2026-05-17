alter table identity_and_user.users
  add column if not exists two_factor_secret text,
  add column if not exists two_factor_enabled boolean not null default false,
  add column if not exists two_factor_verified_at timestamptz;

create or replace function public.servease_begin_user_two_factor(
  p_user_id uuid,
  p_secret text
)
returns table (
  user_id uuid,
  secret text,
  enabled boolean,
  verified_at timestamptz
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  if p_user_id is null or nullif(btrim(p_secret), '') is null then
    raise exception 'invalid_two_factor_request';
  end if;

  update identity_and_user.users u
  set two_factor_secret = btrim(p_secret),
      two_factor_enabled = false,
      two_factor_verified_at = null
  where u.id = p_user_id
    and u.status = 'active';

  if not found then
    raise exception 'user_not_found';
  end if;

  return query
  select
    u.id,
    u.two_factor_secret,
    u.two_factor_enabled,
    u.two_factor_verified_at
  from identity_and_user.users u
  where u.id = p_user_id;
end;
$$;

create or replace function public.servease_confirm_user_two_factor(
  p_user_id uuid
)
returns table (
  user_id uuid,
  secret text,
  enabled boolean,
  verified_at timestamptz
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  if p_user_id is null then
    raise exception 'invalid_two_factor_request';
  end if;

  update identity_and_user.users u
  set two_factor_enabled = true,
      two_factor_verified_at = now()
  where u.id = p_user_id
    and u.two_factor_secret is not null
    and u.status = 'active';

  if not found then
    raise exception 'user_not_found';
  end if;

  return query
  select
    u.id,
    u.two_factor_secret,
    u.two_factor_enabled,
    u.two_factor_verified_at
  from identity_and_user.users u
  where u.id = p_user_id;
end;
$$;

create or replace function public.servease_disable_user_two_factor(
  p_user_id uuid
)
returns table (
  user_id uuid,
  secret text,
  enabled boolean,
  verified_at timestamptz
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  if p_user_id is null then
    raise exception 'invalid_two_factor_request';
  end if;

  update identity_and_user.users u
  set two_factor_secret = null,
      two_factor_enabled = false,
      two_factor_verified_at = null
  where u.id = p_user_id
    and u.status = 'active';

  if not found then
    raise exception 'user_not_found';
  end if;

  return query
  select
    u.id,
    u.two_factor_secret,
    u.two_factor_enabled,
    u.two_factor_verified_at
  from identity_and_user.users u
  where u.id = p_user_id;
end;
$$;

create or replace function public.servease_get_user_two_factor(
  p_user_id uuid
)
returns table (
  user_id uuid,
  secret text,
  enabled boolean,
  verified_at timestamptz
)
language sql
security definer
set search_path = identity_and_user, public
as $$
  select
    u.id,
    u.two_factor_secret,
    u.two_factor_enabled,
    u.two_factor_verified_at
  from identity_and_user.users u
  where u.id = p_user_id;
$$;

revoke all on function public.servease_begin_user_two_factor(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_confirm_user_two_factor(uuid) from public, anon, authenticated;
revoke all on function public.servease_disable_user_two_factor(uuid) from public, anon, authenticated;
revoke all on function public.servease_get_user_two_factor(uuid) from public, anon, authenticated;

grant execute on function public.servease_begin_user_two_factor(uuid, text) to service_role;
grant execute on function public.servease_confirm_user_two_factor(uuid) to service_role;
grant execute on function public.servease_disable_user_two_factor(uuid) to service_role;
grant execute on function public.servease_get_user_two_factor(uuid) to service_role;
