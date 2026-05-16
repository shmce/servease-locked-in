alter table identity_and_user.user_preferences
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

drop function if exists public.servease_get_user_preferences(uuid);
drop function if exists public.servease_upsert_user_preferences(uuid, boolean, boolean, text);

create or replace function public.servease_get_user_preferences(p_user_id uuid)
returns table (
  user_id uuid,
  push_notifications_enabled boolean,
  dark_mode_enabled boolean,
  language text,
  notification_preferences jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  if not exists (
    select 1
    from identity_and_user.users u
    where u.id = p_user_id
  ) then
    raise exception 'user_not_found';
  end if;

  insert into identity_and_user.user_preferences (
    user_id,
    push_notifications_enabled,
    dark_mode_enabled,
    language,
    notification_preferences
  )
  values (
    p_user_id,
    true,
    false,
    'en',
    '{}'::jsonb
  )
  on conflict on constraint user_preferences_pkey do nothing;

  return query
  select
    p.user_id,
    p.push_notifications_enabled,
    p.dark_mode_enabled,
    p.language,
    p.notification_preferences,
    p.updated_at
  from identity_and_user.user_preferences p
  where p.user_id = p_user_id;
end;
$$;

create or replace function public.servease_upsert_user_preferences(
  p_user_id uuid,
  p_push_notifications_enabled boolean default null,
  p_dark_mode_enabled boolean default null,
  p_language text default null,
  p_notification_preferences jsonb default null
)
returns table (
  user_id uuid,
  push_notifications_enabled boolean,
  dark_mode_enabled boolean,
  language text,
  notification_preferences jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  if p_language is not null and p_language not in ('en', 'fil') then
    raise exception 'invalid_user_preferences_request';
  end if;

  if p_notification_preferences is not null
    and jsonb_typeof(p_notification_preferences) <> 'object'
  then
    raise exception 'invalid_user_preferences_request';
  end if;

  if not exists (
    select 1
    from identity_and_user.users u
    where u.id = p_user_id
  ) then
    raise exception 'user_not_found';
  end if;

  insert into identity_and_user.user_preferences (
    user_id,
    push_notifications_enabled,
    dark_mode_enabled,
    language,
    notification_preferences,
    updated_at
  )
  values (
    p_user_id,
    coalesce(p_push_notifications_enabled, true),
    coalesce(p_dark_mode_enabled, false),
    coalesce(p_language, 'en'),
    coalesce(p_notification_preferences, '{}'::jsonb),
    now()
  )
  on conflict on constraint user_preferences_pkey do update
  set
    push_notifications_enabled = coalesce(
      p_push_notifications_enabled,
      user_preferences.push_notifications_enabled
    ),
    dark_mode_enabled = coalesce(
      p_dark_mode_enabled,
      user_preferences.dark_mode_enabled
    ),
    language = coalesce(p_language, user_preferences.language),
    notification_preferences = coalesce(
      p_notification_preferences,
      user_preferences.notification_preferences
    ),
    updated_at = now();

  return query
  select
    p.user_id,
    p.push_notifications_enabled,
    p.dark_mode_enabled,
    p.language,
    p.notification_preferences,
    p.updated_at
  from identity_and_user.user_preferences p
  where p.user_id = p_user_id;
end;
$$;

revoke all on function public.servease_get_user_preferences(uuid) from public, anon, authenticated;
revoke all on function public.servease_upsert_user_preferences(uuid, boolean, boolean, text, jsonb) from public, anon, authenticated;

grant execute on function public.servease_get_user_preferences(uuid) to service_role;
grant execute on function public.servease_upsert_user_preferences(uuid, boolean, boolean, text, jsonb) to service_role;
