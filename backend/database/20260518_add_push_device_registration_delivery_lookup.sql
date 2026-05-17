create or replace function public.servease_list_active_push_devices(
  p_user_id uuid
)
returns table (
  token text,
  platform text,
  device_id text
)
language sql
security definer
set search_path = notification_and_support, public
as $$
  select
    d.token,
    d.platform,
    d.device_id
  from notification_and_support.push_devices d
  where d.user_id = p_user_id
    and d.is_active = true
  order by d.last_registered_at desc nulls last;
$$;

revoke all on function public.servease_list_active_push_devices(uuid) from public, anon, authenticated;
grant execute on function public.servease_list_active_push_devices(uuid) to service_role;
