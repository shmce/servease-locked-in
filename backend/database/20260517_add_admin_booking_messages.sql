-- Threaded admin↔provider messaging persistence for admin booking workflows.
-- Replaces the prior "fire-and-forget notification only" pattern with a real
-- conversation thread stored in booking.admin_booking_messages.

create table if not exists booking.admin_booking_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references booking.bookings(id) on delete cascade,
  sender_user_id uuid not null,
  sender_role text not null check (sender_role in ('admin', 'provider', 'customer')),
  body text not null check (length(trim(body)) > 0),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_booking_messages_booking_idx
  on booking.admin_booking_messages(booking_id, created_at desc);

create or replace function public.servease_admin_list_booking_messages(
  p_booking_id uuid
)
returns table (
  id uuid,
  booking_id uuid,
  sender_user_id uuid,
  sender_role text,
  body text,
  metadata jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = booking, public
as $$
  select
    m.id, m.booking_id, m.sender_user_id, m.sender_role,
    m.body, m.metadata, m.created_at
  from booking.admin_booking_messages m
  where m.booking_id = p_booking_id
  order by m.created_at asc;
$$;

create or replace function public.servease_admin_append_booking_message(
  p_booking_id uuid,
  p_sender_user_id uuid,
  p_sender_role text,
  p_body text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  booking_id uuid,
  sender_user_id uuid,
  sender_role text,
  body text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_booking_id is null
    or p_sender_user_id is null
    or p_body is null or length(trim(p_body)) = 0
    or p_sender_role not in ('admin', 'provider', 'customer') then
    raise exception 'invalid_admin_message_request';
  end if;

  return query
    insert into booking.admin_booking_messages (
      booking_id, sender_user_id, sender_role, body, metadata
    )
    values (
      p_booking_id, p_sender_user_id, p_sender_role, trim(p_body), coalesce(p_metadata, '{}'::jsonb)
    )
    returning id, booking_id, sender_user_id, sender_role, body, metadata, created_at;
end;
$$;

revoke all on function public.servease_admin_list_booking_messages(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_append_booking_message(uuid, uuid, text, text, jsonb) from public, anon, authenticated;

grant execute on function public.servease_admin_list_booking_messages(uuid) to service_role;
grant execute on function public.servease_admin_append_booking_message(uuid, uuid, text, text, jsonb) to service_role;
