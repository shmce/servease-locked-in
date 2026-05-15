create or replace function public.servease_admin_list_support_tickets(
  p_status text default null
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = notification_and_support, public
as $$
  select
    t.id,
    t.user_id,
    t.subject,
    t.message,
    t.category,
    t.status,
    t.created_at
  from notification_and_support.support_tickets t
  where p_status is null or t.status = p_status
  order by t.created_at desc nulls last
  limit 100;
$$;

create or replace function public.servease_admin_update_support_ticket_status(
  p_ticket_id uuid,
  p_status text
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
begin
  if p_ticket_id is null
    or p_status not in ('open', 'in_progress', 'resolved', 'closed') then
    raise exception 'invalid_support_ticket_request';
  end if;

  return query
    update notification_and_support.support_tickets t
    set status = p_status
    where t.id = p_ticket_id
    returning
      t.id,
      t.user_id,
      t.subject,
      t.message,
      t.category,
      t.status,
      t.created_at;
end;
$$;

revoke all on function public.servease_admin_list_support_tickets(text) from public, anon, authenticated;
revoke all on function public.servease_admin_update_support_ticket_status(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_support_tickets(text) to service_role;
grant execute on function public.servease_admin_update_support_ticket_status(uuid, text) to service_role;
