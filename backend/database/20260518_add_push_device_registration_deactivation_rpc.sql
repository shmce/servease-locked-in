create or replace function public.servease_deactivate_push_devices(
  p_tokens text[]
)
returns table (
  deactivated_count integer
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
declare
  v_count integer := 0;
begin
  if p_tokens is null or cardinality(p_tokens) = 0 then
    return query select 0;
    return;
  end if;

  update notification_and_support.push_devices
  set is_active = false,
      updated_at = now()
  where token = any(p_tokens)
    and is_active = true;

  get diagnostics v_count = row_count;
  return query select v_count;
end;
$$;

revoke all on function public.servease_deactivate_push_devices(text[]) from public, anon, authenticated;
grant execute on function public.servease_deactivate_push_devices(text[]) to service_role;
