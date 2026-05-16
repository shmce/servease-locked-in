create table if not exists identity_and_user.user_preferences (
  user_id uuid primary key references identity_and_user.users(id) on delete cascade,
  push_notifications_enabled boolean not null default true,
  dark_mode_enabled boolean not null default false,
  language text not null default 'en',
  updated_at timestamptz default now(),
  constraint user_preferences_language_check
    check (language in ('en', 'fil'))
);

alter table identity_and_user.user_preferences enable row level security;

drop policy if exists user_preferences_service_role_all
  on identity_and_user.user_preferences;

create policy user_preferences_service_role_all
  on identity_and_user.user_preferences
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.servease_get_user_preferences(p_user_id uuid)
returns table (
  user_id uuid,
  push_notifications_enabled boolean,
  dark_mode_enabled boolean,
  language text,
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
    language
  )
  values (
    p_user_id,
    true,
    false,
    'en'
  )
  on conflict on constraint user_preferences_pkey do nothing;

  return query
  select
    p.user_id,
    p.push_notifications_enabled,
    p.dark_mode_enabled,
    p.language,
    p.updated_at
  from identity_and_user.user_preferences p
  where p.user_id = p_user_id;
end;
$$;

create or replace function public.servease_upsert_user_preferences(
  p_user_id uuid,
  p_push_notifications_enabled boolean default null,
  p_dark_mode_enabled boolean default null,
  p_language text default null
)
returns table (
  user_id uuid,
  push_notifications_enabled boolean,
  dark_mode_enabled boolean,
  language text,
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
    updated_at
  )
  values (
    p_user_id,
    coalesce(p_push_notifications_enabled, true),
    coalesce(p_dark_mode_enabled, false),
    coalesce(p_language, 'en'),
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
    updated_at = now();

  return query
  select
    p.user_id,
    p.push_notifications_enabled,
    p.dark_mode_enabled,
    p.language,
    p.updated_at
  from identity_and_user.user_preferences p
  where p.user_id = p_user_id;
end;
$$;

revoke all on function public.servease_get_user_preferences(uuid) from public, anon, authenticated;
revoke all on function public.servease_upsert_user_preferences(uuid, boolean, boolean, text) from public, anon, authenticated;

grant execute on function public.servease_get_user_preferences(uuid) to service_role;
grant execute on function public.servease_upsert_user_preferences(uuid, boolean, boolean, text) to service_role;
