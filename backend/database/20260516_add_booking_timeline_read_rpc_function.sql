create or replace function public.servease_list_booking_timeline_events(
  p_booking_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_id uuid,
  event_type text,
  label text,
  icon text,
  created_at timestamptz
)
language sql
security definer
set search_path = booking, public
as $$
  select
    e.id,
    e.booking_id,
    e.event_type,
    e.label,
    e.icon,
    e.created_at
  from booking.booking_timeline_events e
  join booking.bookings b on b.id = e.booking_id
  where e.booking_id = p_booking_id
    and (
      (p_customer_id is not null and b.customer_id = p_customer_id)
      or (p_provider_id is not null and b.provider_id = p_provider_id)
    )
  order by e.created_at asc nulls last;
$$;

revoke all on function public.servease_list_booking_timeline_events(uuid, uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_list_booking_timeline_events(uuid, uuid, uuid) to service_role;
