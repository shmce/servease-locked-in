create schema if not exists notification_and_support;

create table if not exists notification_and_support.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  message text,
  category text,
  status text not null default 'open',
  assignee_id uuid,
  created_at timestamptz not null default now()
);

alter table notification_and_support.support_tickets
  add column if not exists assignee_id uuid;

create index if not exists support_tickets_user_created_idx
  on notification_and_support.support_tickets (user_id, created_at desc);

create table if not exists notification_and_support.support_ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references notification_and_support.support_tickets(id) on delete cascade,
  replied_by uuid not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table notification_and_support.support_tickets enable row level security;
alter table notification_and_support.support_ticket_replies enable row level security;

create index if not exists support_ticket_replies_ticket_created_idx
  on notification_and_support.support_ticket_replies (ticket_id, created_at asc);

drop function if exists public.servease_get_support_ticket(uuid, uuid);
create function public.servease_get_support_ticket(
  p_user_id uuid,
  p_ticket_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  assignee_id uuid,
  created_at timestamptz,
  attachments jsonb
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
    t.assignee_id,
    t.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'ticketId', a.ticket_id,
            'uploadedBy', a.uploaded_by,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from notification_and_support.support_ticket_attachments a
        where a.ticket_id = t.id
      ),
      '[]'::jsonb
    ) as attachments
  from notification_and_support.support_tickets t
  where t.id = p_ticket_id
    and t.user_id = p_user_id
  limit 1;
$$;

drop function if exists public.servease_admin_get_support_ticket(uuid);
create function public.servease_admin_get_support_ticket(
  p_ticket_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  assignee_id uuid,
  created_at timestamptz,
  attachments jsonb
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
    t.assignee_id,
    t.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'ticketId', a.ticket_id,
            'uploadedBy', a.uploaded_by,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from notification_and_support.support_ticket_attachments a
        where a.ticket_id = t.id
      ),
      '[]'::jsonb
    ) as attachments
  from notification_and_support.support_tickets t
  where t.id = p_ticket_id
  limit 1;
$$;

drop function if exists public.servease_admin_list_support_tickets(text);
create function public.servease_admin_list_support_tickets(
  p_status text default null
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  assignee_id uuid,
  created_at timestamptz,
  attachments jsonb
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
    t.assignee_id,
    t.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'ticketId', a.ticket_id,
            'uploadedBy', a.uploaded_by,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from notification_and_support.support_ticket_attachments a
        where a.ticket_id = t.id
      ),
      '[]'::jsonb
    ) as attachments
  from notification_and_support.support_tickets t
  where p_status is null or t.status = p_status
  order by t.created_at desc nulls last
  limit 100;
$$;

drop function if exists public.servease_admin_update_support_ticket_status(uuid, text);
create function public.servease_admin_update_support_ticket_status(
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
  assignee_id uuid,
  created_at timestamptz,
  attachments jsonb
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

  update notification_and_support.support_tickets t
  set status = p_status
  where t.id = p_ticket_id;

  return query
    select *
    from public.servease_admin_get_support_ticket(p_ticket_id);
end;
$$;

drop function if exists public.servease_admin_assign_ticket(uuid, uuid);
create function public.servease_admin_assign_ticket(
  p_ticket_id uuid,
  p_assignee_id uuid default null
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  assignee_id uuid,
  created_at timestamptz,
  attachments jsonb
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
begin
  if p_ticket_id is null then
    raise exception 'invalid_support_ticket_request';
  end if;

  update notification_and_support.support_tickets t
  set assignee_id = p_assignee_id
  where t.id = p_ticket_id;

  return query
    select *
    from public.servease_admin_get_support_ticket(p_ticket_id);
end;
$$;

drop function if exists public.servease_admin_add_ticket_reply(uuid, uuid, text);
drop function if exists public.servease_admin_add_ticket_reply(uuid, text, text);
create function public.servease_admin_add_ticket_reply(
  p_ticket_id uuid,
  p_replied_by uuid,
  p_message text
)
returns table (
  id uuid,
  ticket_id uuid,
  replied_by uuid,
  message text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
begin
  if p_ticket_id is null
    or p_replied_by is null
    or nullif(trim(coalesce(p_message, '')), '') is null then
    raise exception 'invalid_support_ticket_request';
  end if;

  if not exists (
    select 1
    from notification_and_support.support_tickets t
    where t.id = p_ticket_id
  ) then
    raise exception 'support_ticket_not_found';
  end if;

  return query
    insert into notification_and_support.support_ticket_replies (
      ticket_id,
      replied_by,
      message
    )
    values (
      p_ticket_id,
      p_replied_by,
      trim(p_message)
    )
    returning
      support_ticket_replies.id,
      support_ticket_replies.ticket_id,
      support_ticket_replies.replied_by,
      support_ticket_replies.message,
      support_ticket_replies.created_at;
end;
$$;

drop function if exists public.servease_admin_list_ticket_replies(uuid);
create function public.servease_admin_list_ticket_replies(
  p_ticket_id uuid
)
returns table (
  id uuid,
  ticket_id uuid,
  replied_by uuid,
  message text,
  created_at timestamptz
)
language sql
security definer
set search_path = notification_and_support, public
as $$
  select
    r.id,
    r.ticket_id,
    r.replied_by,
    r.message,
    r.created_at
  from notification_and_support.support_ticket_replies r
  where r.ticket_id = p_ticket_id
  order by r.created_at asc nulls last;
$$;

revoke all on function public.servease_get_support_ticket(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_get_support_ticket(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_list_support_tickets(text) from public, anon, authenticated;
revoke all on function public.servease_admin_update_support_ticket_status(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_admin_assign_ticket(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_add_ticket_reply(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.servease_admin_list_ticket_replies(uuid) from public, anon, authenticated;

grant execute on function public.servease_get_support_ticket(uuid, uuid) to service_role;
grant execute on function public.servease_admin_get_support_ticket(uuid) to service_role;
grant execute on function public.servease_admin_list_support_tickets(text) to service_role;
grant execute on function public.servease_admin_update_support_ticket_status(uuid, text) to service_role;
grant execute on function public.servease_admin_assign_ticket(uuid, uuid) to service_role;
grant execute on function public.servease_admin_add_ticket_reply(uuid, uuid, text) to service_role;
grant execute on function public.servease_admin_list_ticket_replies(uuid) to service_role;
