create table if not exists notification_and_support.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  token text not null,
  platform text not null check (platform in ('android', 'ios', 'web')),
  device_id text,
  is_active boolean not null default true,
  last_registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (token)
);

alter table notification_and_support.push_devices enable row level security;

create index if not exists push_devices_user_active_idx
  on notification_and_support.push_devices (user_id, is_active);

create or replace function public.servease_register_push_device(
  p_user_id uuid,
  p_token text,
  p_platform text,
  p_device_id text default null
)
returns table (
  id uuid,
  user_id uuid,
  token text,
  platform text,
  device_id text,
  is_active boolean,
  last_registered_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
begin
  if p_user_id is null
    or nullif(trim(p_token), '') is null
    or trim(p_platform) not in ('android', 'ios', 'web') then
    raise exception 'invalid_push_device_request';
  end if;

  return query
    insert into notification_and_support.push_devices (
      user_id,
      token,
      platform,
      device_id,
      is_active,
      last_registered_at,
      updated_at
    )
    values (
      p_user_id,
      trim(p_token),
      trim(p_platform),
      nullif(trim(coalesce(p_device_id, '')), ''),
      true,
      now(),
      now()
    )
    on conflict (token) do update
      set user_id = excluded.user_id,
          platform = excluded.platform,
          device_id = excluded.device_id,
          is_active = true,
          last_registered_at = now(),
          updated_at = now()
    returning
      push_devices.id,
      push_devices.user_id,
      push_devices.token,
      push_devices.platform,
      push_devices.device_id,
      push_devices.is_active,
      push_devices.last_registered_at,
      push_devices.created_at;
end;
$$;

create or replace function public.servease_unregister_push_device(
  p_user_id uuid,
  p_token text
)
returns table (
  ok boolean
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
begin
  if p_user_id is null or nullif(trim(p_token), '') is null then
    raise exception 'invalid_push_device_request';
  end if;

  update notification_and_support.push_devices
  set is_active = false,
      updated_at = now()
  where user_id = p_user_id
    and token = trim(p_token);

  return query select found;
end;
$$;

revoke all on function public.servease_register_push_device(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_unregister_push_device(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_register_push_device(uuid, text, text, text) to service_role;
grant execute on function public.servease_unregister_push_device(uuid, text) to service_role;
