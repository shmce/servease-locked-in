alter table booking.booking_attachments
  add column if not exists uploaded_by uuid,
  add column if not exists media_kind text default 'booking_reference',
  add column if not exists file_size integer,
  add column if not exists caption text;

alter table booking.booking_attachments
  alter column media_kind set default 'booking_reference';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'booking_attachments_media_kind_check'
      and conrelid = 'booking.booking_attachments'::regclass
  ) then
    alter table booking.booking_attachments
      add constraint booking_attachments_media_kind_check
      check (media_kind in ('booking_reference', 'provider_progress'));
  end if;
end $$;

create index if not exists booking_attachments_booking_created_idx
  on booking.booking_attachments (booking_id, created_at desc);

create table if not exists notification_and_support.support_ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references notification_and_support.support_tickets(id) on delete cascade,
  uploaded_by uuid,
  file_url text not null,
  file_name text,
  mime_type text,
  storage_path text,
  file_size integer,
  created_at timestamptz default now()
);

alter table notification_and_support.support_ticket_attachments enable row level security;

create index if not exists support_ticket_attachments_ticket_created_idx
  on notification_and_support.support_ticket_attachments (ticket_id, created_at desc);

create table if not exists provider_catalog.provider_portfolio_media (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references provider_catalog.provider_profiles(id) on delete cascade,
  uploaded_by uuid,
  file_url text not null,
  file_name text,
  mime_type text,
  storage_path text,
  file_size integer,
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table provider_catalog.provider_portfolio_media enable row level security;

create index if not exists provider_portfolio_media_provider_sort_idx
  on provider_catalog.provider_portfolio_media (provider_id, sort_order, created_at desc);

drop function if exists public.servease_list_visible_bookings(uuid, uuid);
create function public.servease_list_visible_bookings(
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  service_title text,
  service_address text,
  scheduled_at timestamptz,
  status text,
  total_amount numeric,
  attachments jsonb
)
language sql
security definer
set search_path = booking, public
as $$
  select
    b.id,
    b.booking_reference,
    b.customer_id,
    b.provider_id,
    b.service_id,
    b.service_title,
    b.service_address,
    b.scheduled_at,
    b.status,
    b.total_amount,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'bookingId', a.booking_id,
            'uploadedBy', a.uploaded_by,
            'mediaKind', a.media_kind,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'caption', a.caption,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from booking.booking_attachments a
        where a.booking_id = b.id
      ),
      '[]'::jsonb
    ) as attachments
  from booking.bookings b
  where (p_customer_id is not null and b.customer_id = p_customer_id)
     or (p_provider_id is not null and b.provider_id = p_provider_id)
  order by b.created_at desc nulls last, b.scheduled_at desc
  limit 50;
$$;

drop function if exists public.servease_get_visible_booking(uuid, uuid, uuid);
create function public.servease_get_visible_booking(
  p_booking_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  service_title text,
  service_address text,
  scheduled_at timestamptz,
  status text,
  total_amount numeric,
  attachments jsonb
)
language sql
security definer
set search_path = booking, public
as $$
  select
    b.id,
    b.booking_reference,
    b.customer_id,
    b.provider_id,
    b.service_id,
    b.service_title,
    b.service_address,
    b.scheduled_at,
    b.status,
    b.total_amount,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'bookingId', a.booking_id,
            'uploadedBy', a.uploaded_by,
            'mediaKind', a.media_kind,
            'fileUrl', a.file_url,
            'fileName', a.file_name,
            'mimeType', a.mime_type,
            'storagePath', a.storage_path,
            'fileSize', a.file_size,
            'caption', a.caption,
            'createdAt', a.created_at
          )
          order by a.created_at desc nulls last
        )
        from booking.booking_attachments a
        where a.booking_id = b.id
      ),
      '[]'::jsonb
    ) as attachments
  from booking.bookings b
  where b.id = p_booking_id
    and (
      (p_customer_id is not null and b.customer_id = p_customer_id)
      or (p_provider_id is not null and b.provider_id = p_provider_id)
    )
  limit 1;
$$;

create or replace function public.servease_add_booking_attachment(
  p_booking_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null,
  p_uploaded_by uuid default null,
  p_media_kind text default 'booking_reference',
  p_file_url text default null,
  p_file_name text default null,
  p_mime_type text default null,
  p_storage_path text default null,
  p_file_size integer default null,
  p_caption text default null
)
returns table (
  id uuid,
  booking_id uuid,
  uploaded_by uuid,
  media_kind text,
  file_url text,
  file_name text,
  mime_type text,
  storage_path text,
  file_size integer,
  caption text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_booking_id is null
    or nullif(trim(coalesce(p_file_url, '')), '') is null
    or p_media_kind not in ('booking_reference', 'provider_progress') then
    raise exception 'invalid_booking_attachment_request';
  end if;

  if not exists (
    select 1
    from booking.bookings b
    where b.id = p_booking_id
      and (
        (p_customer_id is not null and b.customer_id = p_customer_id)
        or (p_provider_id is not null and b.provider_id = p_provider_id)
      )
  ) then
    raise exception 'booking_not_found';
  end if;

  return query
    insert into booking.booking_attachments (
      booking_id,
      uploaded_by,
      media_kind,
      file_url,
      file_name,
      mime_type,
      storage_path,
      file_size,
      caption
    )
    values (
      p_booking_id,
      p_uploaded_by,
      p_media_kind,
      trim(p_file_url),
      nullif(trim(coalesce(p_file_name, '')), ''),
      nullif(trim(coalesce(p_mime_type, '')), ''),
      nullif(trim(coalesce(p_storage_path, '')), ''),
      p_file_size,
      nullif(trim(coalesce(p_caption, '')), '')
    )
    returning
      booking_attachments.id,
      booking_attachments.booking_id,
      booking_attachments.uploaded_by,
      booking_attachments.media_kind,
      booking_attachments.file_url,
      booking_attachments.file_name,
      booking_attachments.mime_type,
      booking_attachments.storage_path,
      booking_attachments.file_size,
      booking_attachments.caption,
      booking_attachments.created_at;
end;
$$;

drop function if exists public.servease_create_support_ticket(uuid, text, text, text);
create function public.servease_create_support_ticket(
  p_user_id uuid,
  p_subject text,
  p_message text default null,
  p_category text default null,
  p_attachments jsonb default '[]'::jsonb
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
  created_at timestamptz,
  attachments jsonb
)
language plpgsql
security definer
set search_path = notification_and_support, public
as $$
declare
  v_ticket_id uuid;
begin
  if p_user_id is null or nullif(trim(p_subject), '') is null then
    raise exception 'invalid_support_ticket_request';
  end if;

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
  returning support_tickets.id into v_ticket_id;

  insert into notification_and_support.support_ticket_attachments (
    ticket_id,
    uploaded_by,
    file_url,
    file_name,
    mime_type,
    storage_path,
    file_size
  )
  select
    v_ticket_id,
    p_user_id,
    trim(item->>'fileUrl'),
    nullif(trim(coalesce(item->>'fileName', '')), ''),
    nullif(trim(coalesce(item->>'mimeType', '')), ''),
    nullif(trim(coalesce(item->>'storagePath', '')), ''),
    nullif(item->>'fileSize', '')::integer
  from jsonb_array_elements(coalesce(p_attachments, '[]'::jsonb)) item
  where nullif(trim(coalesce(item->>'fileUrl', '')), '') is not null;

  return query
  select
    t.id,
    t.user_id,
    t.subject,
    t.message,
    t.category,
    t.status,
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
  where t.id = v_ticket_id;
end;
$$;

drop function if exists public.servease_list_support_tickets(uuid);
create function public.servease_list_support_tickets(
  p_user_id uuid
)
returns table (
  id uuid,
  user_id uuid,
  subject text,
  message text,
  category text,
  status text,
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
  where t.user_id = p_user_id
  order by t.created_at desc nulls last
  limit 50;
$$;

create or replace function public.servease_add_provider_portfolio_media(
  p_user_id uuid,
  p_file_url text,
  p_file_name text default null,
  p_mime_type text default null,
  p_storage_path text default null,
  p_file_size integer default null,
  p_caption text default null
)
returns table (
  id uuid,
  provider_id uuid,
  uploaded_by uuid,
  file_url text,
  file_name text,
  mime_type text,
  storage_path text,
  file_size integer,
  caption text,
  sort_order integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
declare
  v_provider_id uuid;
begin
  if p_user_id is null or nullif(trim(coalesce(p_file_url, '')), '') is null then
    raise exception 'invalid_provider_portfolio_request';
  end if;

  select pp.id into v_provider_id
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
    and coalesce(pp.is_active, true) = true
  limit 1;

  if v_provider_id is null then
    raise exception 'provider_profile_not_found';
  end if;

  return query
    insert into provider_catalog.provider_portfolio_media (
      provider_id,
      uploaded_by,
      file_url,
      file_name,
      mime_type,
      storage_path,
      file_size,
      caption,
      sort_order
    )
    values (
      v_provider_id,
      p_user_id,
      trim(p_file_url),
      nullif(trim(coalesce(p_file_name, '')), ''),
      nullif(trim(coalesce(p_mime_type, '')), ''),
      nullif(trim(coalesce(p_storage_path, '')), ''),
      p_file_size,
      nullif(trim(coalesce(p_caption, '')), ''),
      coalesce(
        (
          select max(pm.sort_order) + 1
          from provider_catalog.provider_portfolio_media pm
          where pm.provider_id = v_provider_id
        ),
        0
      )
    )
    returning
      provider_portfolio_media.id,
      provider_portfolio_media.provider_id,
      provider_portfolio_media.uploaded_by,
      provider_portfolio_media.file_url,
      provider_portfolio_media.file_name,
      provider_portfolio_media.mime_type,
      provider_portfolio_media.storage_path,
      provider_portfolio_media.file_size,
      provider_portfolio_media.caption,
      provider_portfolio_media.sort_order,
      provider_portfolio_media.created_at;
end;
$$;

create or replace function public.servease_list_provider_portfolio_media(
  p_provider_id uuid
)
returns table (
  id uuid,
  provider_id uuid,
  uploaded_by uuid,
  file_url text,
  file_name text,
  mime_type text,
  storage_path text,
  file_size integer,
  caption text,
  sort_order integer,
  created_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pm.id,
    pm.provider_id,
    pm.uploaded_by,
    pm.file_url,
    pm.file_name,
    pm.mime_type,
    pm.storage_path,
    pm.file_size,
    pm.caption,
    pm.sort_order,
    pm.created_at
  from provider_catalog.provider_portfolio_media pm
  join provider_catalog.provider_profiles pp
    on pp.id = pm.provider_id
  where pm.provider_id = p_provider_id
    and coalesce(pp.is_active, true) = true
  order by pm.sort_order, pm.created_at desc nulls last
  limit 50;
$$;

create or replace function public.servease_delete_provider_portfolio_media(
  p_user_id uuid,
  p_media_id uuid
)
returns void
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  delete from provider_catalog.provider_portfolio_media pm
  using provider_catalog.provider_profiles pp
  where pm.id = p_media_id
    and pm.provider_id = pp.id
    and pp.user_id = p_user_id;

  if not found then
    raise exception 'provider_portfolio_media_not_found';
  end if;
end;
$$;

revoke all on function public.servease_list_visible_bookings(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_get_visible_booking(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_add_booking_attachment(uuid, uuid, uuid, uuid, text, text, text, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.servease_create_support_ticket(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.servease_list_support_tickets(uuid) from public, anon, authenticated;
revoke all on function public.servease_add_provider_portfolio_media(uuid, text, text, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.servease_list_provider_portfolio_media(uuid) from public, anon, authenticated;
revoke all on function public.servease_delete_provider_portfolio_media(uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_list_visible_bookings(uuid, uuid) to service_role;
grant execute on function public.servease_get_visible_booking(uuid, uuid, uuid) to service_role;
grant execute on function public.servease_add_booking_attachment(uuid, uuid, uuid, uuid, text, text, text, text, text, integer, text) to service_role;
grant execute on function public.servease_create_support_ticket(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.servease_list_support_tickets(uuid) to service_role;
grant execute on function public.servease_add_provider_portfolio_media(uuid, text, text, text, text, integer, text) to service_role;
grant execute on function public.servease_list_provider_portfolio_media(uuid) to service_role;
grant execute on function public.servease_delete_provider_portfolio_media(uuid, uuid) to service_role;
