alter table identity_and_user.users
  add column if not exists avatar_url text,
  add column if not exists avatar_storage_path text;

drop function if exists public.servease_get_internal_user(uuid);

create or replace function public.servease_mark_all_notifications_read(
  p_user_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  type text,
  title text,
  body text,
  is_read boolean,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
begin
  update notification_and_support.notifications n
  set is_read = true
  where n.user_id = p_user_id
    and coalesce(n.is_read, false) = false;

  return query
  select
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.body,
    n.is_read,
    n.metadata,
    n.created_at
  from notification_and_support.notifications n
  where n.user_id = p_user_id
  order by n.created_at desc nulls last
  limit 50;
end;
$$;

create or replace function public.servease_update_internal_user(
  p_user_id uuid,
  p_full_name text,
  p_contact_number text,
  p_avatar_url text default null,
  p_avatar_storage_path text default null
)
returns table (
  id uuid,
  email text,
  password_hash text,
  full_name text,
  contact_number text,
  role text,
  status text,
  avatar_url text,
  avatar_storage_path text
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
    avatar_url = coalesce(nullif(trim(p_avatar_url), ''), users.avatar_url),
    avatar_storage_path = coalesce(
      nullif(trim(p_avatar_storage_path), ''),
      users.avatar_storage_path
    ),
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
    u.status,
    u.avatar_url,
    u.avatar_storage_path
  from identity_and_user.users u
  where u.id = p_user_id
  limit 1;
end;
$$;

create or replace function public.servease_get_internal_user(
  p_user_id uuid
)
returns table (
  id uuid,
  email text,
  password_hash text,
  full_name text,
  contact_number text,
  role text,
  status text,
  avatar_url text,
  avatar_storage_path text
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
    u.status,
    u.avatar_url,
    u.avatar_storage_path
  from identity_and_user.users u
  where u.id = p_user_id
  limit 1;
$$;

revoke all on function public.servease_mark_all_notifications_read(uuid) from public, anon, authenticated;
revoke all on function public.servease_update_internal_user(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_get_internal_user(uuid) from public, anon, authenticated;

grant execute on function public.servease_mark_all_notifications_read(uuid) to service_role;
grant execute on function public.servease_update_internal_user(uuid, text, text, text, text) to service_role;
grant execute on function public.servease_get_internal_user(uuid) to service_role;
