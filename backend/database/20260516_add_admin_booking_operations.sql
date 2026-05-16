-- Owner: Booking Service
-- Purpose: Expose admin booking list/detail/cancel/escalation operations through Booking Service-owned RPCs.

create table if not exists booking.admin_booking_escalations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references booking.bookings(id) on delete cascade,
  escalated_by uuid not null,
  reason text not null,
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  constraint admin_booking_escalations_priority_check
    check (priority in ('low', 'medium', 'high', 'critical'))
);

alter table booking.admin_booking_escalations enable row level security;

drop policy if exists admin_booking_escalations_service_role_all
  on booking.admin_booking_escalations;

create policy admin_booking_escalations_service_role_all
  on booking.admin_booking_escalations
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists admin_booking_escalations_booking_created_idx
  on booking.admin_booking_escalations (booking_id, created_at desc);

create or replace function public.servease_admin_list_bookings(
  p_status text default null,
  p_query text default null,
  p_limit integer default 100
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
  cancel_reason text,
  cancel_explanation text,
  cancelled_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  escalation_count integer,
  latest_escalation_priority text,
  latest_escalation_reason text,
  latest_escalated_at timestamptz,
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
    coalesce(b.service_title, b.service_name) as service_title,
    b.service_address,
    b.scheduled_at,
    b.status,
    b.total_amount,
    b.cancel_reason,
    b.cancel_explanation,
    b.cancelled_at,
    b.created_at,
    b.updated_at,
    coalesce(escalations.escalation_count, 0)::integer as escalation_count,
    latest_escalation.priority as latest_escalation_priority,
    latest_escalation.reason as latest_escalation_reason,
    latest_escalation.created_at as latest_escalated_at,
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
  left join lateral (
    select count(*) as escalation_count
    from booking.admin_booking_escalations e
    where e.booking_id = b.id
  ) escalations on true
  left join lateral (
    select e.priority, e.reason, e.created_at
    from booking.admin_booking_escalations e
    where e.booking_id = b.id
    order by e.created_at desc
    limit 1
  ) latest_escalation on true
  where (p_status is null or b.status = p_status)
    and (
      nullif(trim(coalesce(p_query, '')), '') is null
      or b.id::text ilike '%' || trim(p_query) || '%'
      or b.booking_reference ilike '%' || trim(p_query) || '%'
      or coalesce(b.service_title, '') ilike '%' || trim(p_query) || '%'
      or coalesce(b.service_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(b.service_address, '') ilike '%' || trim(p_query) || '%'
    )
  order by b.created_at desc nulls last, b.scheduled_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 200);
$$;

create or replace function public.servease_admin_get_booking(
  p_booking_id uuid
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
  cancel_reason text,
  cancel_explanation text,
  cancelled_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  escalation_count integer,
  latest_escalation_priority text,
  latest_escalation_reason text,
  latest_escalated_at timestamptz,
  attachments jsonb
)
language sql
security definer
set search_path = booking, public
as $$
  select *
  from public.servease_admin_list_bookings(null, p_booking_id::text, 1) b
  where b.id = p_booking_id
  limit 1;
$$;

create or replace function public.servease_admin_escalate_booking(
  p_booking_id uuid,
  p_admin_user_id uuid,
  p_reason text,
  p_priority text default 'medium'
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
  cancel_reason text,
  cancel_explanation text,
  cancelled_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  escalation_count integer,
  latest_escalation_priority text,
  latest_escalation_reason text,
  latest_escalated_at timestamptz,
  attachments jsonb
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_booking_id is null
    or p_admin_user_id is null
    or nullif(trim(coalesce(p_reason, '')), '') is null
    or coalesce(p_priority, 'medium') not in ('low', 'medium', 'high', 'critical')
  then
    raise exception 'invalid_admin_booking_request';
  end if;

  if not exists (select 1 from booking.bookings b where b.id = p_booking_id) then
    raise exception 'booking_not_found';
  end if;

  insert into booking.admin_booking_escalations (
    booking_id,
    escalated_by,
    reason,
    priority
  )
  values (
    p_booking_id,
    p_admin_user_id,
    trim(p_reason),
    coalesce(p_priority, 'medium')
  );

  insert into booking.booking_timeline_events (
    booking_id,
    event_type,
    label,
    icon
  )
  values (
    p_booking_id,
    'admin_escalated',
    'Booking escalated by admin',
    'alert-triangle'
  );

  return query
    select * from public.servease_admin_get_booking(p_booking_id);
end;
$$;

revoke all on function public.servease_admin_list_bookings(text, text, integer) from public, anon, authenticated;
revoke all on function public.servease_admin_get_booking(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_escalate_booking(uuid, uuid, text, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_bookings(text, text, integer) to service_role;
grant execute on function public.servease_admin_get_booking(uuid) to service_role;
grant execute on function public.servease_admin_escalate_booking(uuid, uuid, text, text) to service_role;
