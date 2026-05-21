create or replace function public.servease_upsert_booking_live_location(
  p_booking_id uuid,
  p_provider_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy_meters double precision default null,
  p_heading_degrees double precision default null,
  p_speed_mps double precision default null
)
returns table (
  booking_id uuid,
  provider_id uuid,
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  heading_degrees double precision,
  speed_mps double precision,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_booking_id is null
    or p_provider_id is null
    or p_latitude is null
    or p_longitude is null
    or p_latitude < -90
    or p_latitude > 90
    or p_longitude < -180
    or p_longitude > 180
    or (p_accuracy_meters is not null and p_accuracy_meters < 0)
    or (
      p_heading_degrees is not null
      and (p_heading_degrees < 0 or p_heading_degrees >= 360)
    )
    or (p_speed_mps is not null and p_speed_mps < 0)
  then
    raise exception 'invalid_booking_live_location_request';
  end if;

  if not exists (
    select 1
    from booking.bookings b
    where b.id = p_booking_id
      and b.provider_id = p_provider_id
      and b.status in ('confirmed', 'in_progress')
  ) then
    raise exception 'booking_not_found';
  end if;

  insert into booking.booking_live_locations as live (
    booking_id,
    provider_id,
    latitude,
    longitude,
    accuracy_meters,
    heading_degrees,
    speed_mps,
    updated_at
  )
  values (
    p_booking_id,
    p_provider_id,
    p_latitude,
    p_longitude,
    p_accuracy_meters,
    p_heading_degrees,
    p_speed_mps,
    now()
  )
  on conflict on constraint booking_live_locations_pkey do update
    set provider_id = excluded.provider_id,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        accuracy_meters = excluded.accuracy_meters,
        heading_degrees = excluded.heading_degrees,
        speed_mps = excluded.speed_mps,
        updated_at = now();

  return query
    select
      live.booking_id,
      live.provider_id,
      live.latitude,
      live.longitude,
      live.accuracy_meters,
      live.heading_degrees,
      live.speed_mps,
      live.updated_at
    from booking.booking_live_locations live
    where live.booking_id = p_booking_id;
end;
$$;

do $$
declare
  v_booking_id uuid;
  v_provider_id uuid;
begin
  select b.id, b.provider_id
    into v_booking_id, v_provider_id
  from booking.bookings b
  where b.booking_reference = 'SE-DEMO-001'
    and b.status in ('confirmed', 'in_progress')
  limit 1;

  if v_booking_id is not null and v_provider_id is not null then
    perform *
    from public.servease_upsert_booking_live_location(
      v_booking_id,
      v_provider_id,
      14.5816,
      121.0569,
      18,
      42,
      1.2
    );
  end if;
end $$;
