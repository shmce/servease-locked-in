create or replace function public.servease_list_visible_bookings(
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
  total_amount numeric
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
    b.total_amount
  from booking.bookings b
  where (p_customer_id is not null and b.customer_id = p_customer_id)
     or (p_provider_id is not null and b.provider_id = p_provider_id)
  order by b.created_at desc nulls last, b.scheduled_at desc
  limit 50;
$$;

create or replace function public.servease_get_visible_booking(
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
  total_amount numeric
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
    b.total_amount
  from booking.bookings b
  where b.id = p_booking_id
    and (
      (p_customer_id is not null and b.customer_id = p_customer_id)
      or (p_provider_id is not null and b.provider_id = p_provider_id)
    )
  limit 1;
$$;

revoke all on function public.servease_list_visible_bookings(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_get_visible_booking(uuid, uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_list_visible_bookings(uuid, uuid) to service_role;
grant execute on function public.servease_get_visible_booking(uuid, uuid, uuid) to service_role;
