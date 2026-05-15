create or replace function public.servease_create_support_ticket(
  p_user_id uuid,
  p_subject text,
  p_message text default null,
  p_category text default null
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
  if p_user_id is null or nullif(trim(p_subject), '') is null then
    raise exception 'invalid_support_ticket_request';
  end if;

  return query
    insert into notification_and_support.support_tickets (
      user_id,
      subject,
      message,
      category,
      status
    )
    values (
      p_user_id,
      trim(p_subject),
      nullif(trim(coalesce(p_message, '')), ''),
      nullif(trim(coalesce(p_category, '')), ''),
      'open'
    )
    returning
      support_tickets.id,
      support_tickets.user_id,
      support_tickets.subject,
      support_tickets.message,
      support_tickets.category,
      support_tickets.status,
      support_tickets.created_at;
end;
$$;

create or replace function public.servease_list_support_tickets(
  p_user_id uuid
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
  where t.user_id = p_user_id
  order by t.created_at desc nulls last
  limit 50;
$$;

revoke all on function public.servease_create_support_ticket(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_list_support_tickets(uuid) from public, anon, authenticated;

grant execute on function public.servease_create_support_ticket(uuid, text, text, text) to service_role;
grant execute on function public.servease_list_support_tickets(uuid) to service_role;
