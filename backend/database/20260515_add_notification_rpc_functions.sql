create or replace function public.servease_create_notification(
  p_user_id uuid,
  p_type text,
  p_title text default null,
  p_body text default null,
  p_metadata jsonb default null
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
  if p_user_id is null or nullif(trim(p_type), '') is null then
    raise exception 'invalid_notification_request';
  end if;

  return query
    insert into notification_and_support.notifications (
      user_id,
      type,
      title,
      body,
      is_read,
      metadata
    )
    values (
      p_user_id,
      trim(p_type),
      nullif(trim(coalesce(p_title, '')), ''),
      nullif(trim(coalesce(p_body, '')), ''),
      false,
      p_metadata
    )
    returning
      notifications.id,
      notifications.user_id,
      notifications.type,
      notifications.title,
      notifications.body,
      notifications.is_read,
      notifications.metadata,
      notifications.created_at;
end;
$$;

create or replace function public.servease_list_notifications(
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
language sql
security definer
set search_path = notification_and_support, public
as $$
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
$$;

create or replace function public.servease_mark_notification_read(
  p_notification_id uuid,
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
  return query
    update notification_and_support.notifications n
    set is_read = true
    where n.id = p_notification_id
      and n.user_id = p_user_id
    returning
      n.id,
      n.user_id,
      n.type,
      n.title,
      n.body,
      n.is_read,
      n.metadata,
      n.created_at;
end;
$$;

revoke all on function public.servease_create_notification(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.servease_list_notifications(uuid) from public, anon, authenticated;
revoke all on function public.servease_mark_notification_read(uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_create_notification(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.servease_list_notifications(uuid) to service_role;
grant execute on function public.servease_mark_notification_read(uuid, uuid) to service_role;
