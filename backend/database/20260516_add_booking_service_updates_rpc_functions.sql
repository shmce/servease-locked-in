create table if not exists booking.booking_service_updates (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references booking.bookings(id) on delete cascade,
  actor_id uuid not null,
  update_type text not null,
  message text,
  checklist jsonb,
  attachment_id uuid references booking.booking_attachments(id) on delete set null,
  created_at timestamptz default now(),
  constraint booking_service_updates_type_check
    check (update_type in ('checklist', 'progress', 'completion'))
);

alter table booking.booking_service_updates enable row level security;

create index if not exists booking_service_updates_booking_created_idx
  on booking.booking_service_updates (booking_id, created_at desc);

create or replace function public.servease_add_booking_service_update(
  p_booking_id uuid,
  p_actor_id uuid,
  p_provider_id uuid,
  p_update_type text,
  p_message text default null,
  p_checklist jsonb default null,
  p_attachment_id uuid default null
)
returns table (
  id uuid,
  booking_id uuid,
  actor_id uuid,
  update_type text,
  message text,
  checklist jsonb,
  attachment_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_booking_id is null
    or p_actor_id is null
    or p_provider_id is null
    or p_update_type not in ('checklist', 'progress', 'completion') then
    raise exception 'invalid_booking_service_update_request';
  end if;

  if not exists (
    select 1
    from booking.bookings b
    where b.id = p_booking_id
      and b.provider_id = p_provider_id
  ) then
    raise exception 'booking_not_found';
  end if;

  if p_attachment_id is not null and not exists (
    select 1
    from booking.booking_attachments a
    where a.id = p_attachment_id
      and a.booking_id = p_booking_id
  ) then
    raise exception 'invalid_booking_service_update_request';
  end if;

  return query
    insert into booking.booking_service_updates (
      booking_id,
      actor_id,
      update_type,
      message,
      checklist,
      attachment_id
    )
    values (
      p_booking_id,
      p_actor_id,
      p_update_type,
      nullif(trim(coalesce(p_message, '')), ''),
      p_checklist,
      p_attachment_id
    )
    returning
      booking_service_updates.id,
      booking_service_updates.booking_id,
      booking_service_updates.actor_id,
      booking_service_updates.update_type,
      booking_service_updates.message,
      booking_service_updates.checklist,
      booking_service_updates.attachment_id,
      booking_service_updates.created_at;
end;
$$;

create or replace function public.servease_list_booking_service_updates(
  p_booking_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_id uuid,
  actor_id uuid,
  update_type text,
  message text,
  checklist jsonb,
  attachment_id uuid,
  created_at timestamptz
)
language sql
security definer
set search_path = booking, public
as $$
  select
    u.id,
    u.booking_id,
    u.actor_id,
    u.update_type,
    u.message,
    u.checklist,
    u.attachment_id,
    u.created_at
  from booking.booking_service_updates u
  join booking.bookings b on b.id = u.booking_id
  where u.booking_id = p_booking_id
    and (
      (p_customer_id is not null and b.customer_id = p_customer_id)
      or (p_provider_id is not null and b.provider_id = p_provider_id)
    )
  order by u.created_at desc nulls last
  limit 100;
$$;

revoke all on function public.servease_add_booking_service_update(uuid, uuid, uuid, text, text, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.servease_list_booking_service_updates(uuid, uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_add_booking_service_update(uuid, uuid, uuid, text, text, jsonb, uuid) to service_role;
grant execute on function public.servease_list_booking_service_updates(uuid, uuid, uuid) to service_role;
