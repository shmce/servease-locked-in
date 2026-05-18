-- Store the latest provider GPS point for an active booking.
-- Access stays behind booking-service RPCs so clients never write the
-- booking schema directly.

create table if not exists booking.booking_live_locations (
  booking_id uuid primary key references booking.bookings(id) on delete cascade,
  provider_id uuid not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_meters double precision check (
    accuracy_meters is null or accuracy_meters >= 0
  ),
  heading_degrees double precision check (
    heading_degrees is null or (heading_degrees >= 0 and heading_degrees < 360)
  ),
  speed_mps double precision check (speed_mps is null or speed_mps >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_live_locations_provider_updated_idx
  on booking.booking_live_locations (provider_id, updated_at desc);

alter table booking.booking_live_locations enable row level security;

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
  on conflict (booking_id) do update
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

create or replace function public.servease_get_booking_live_location(
  p_booking_id uuid,
  p_customer_id uuid default null,
  p_provider_id uuid default null
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
  if p_booking_id is null or (p_customer_id is null and p_provider_id is null) then
    raise exception 'invalid_booking_live_location_request';
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
    where live.booking_id = p_booking_id
    limit 1;
end;
$$;

revoke all on table booking.booking_live_locations from public, anon, authenticated;
revoke all on function public.servease_upsert_booking_live_location(
  uuid,
  uuid,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision
) from public, anon, authenticated;
revoke all on function public.servease_get_booking_live_location(uuid, uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.servease_upsert_booking_live_location(
  uuid,
  uuid,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision
) to service_role;
grant execute on function public.servease_get_booking_live_location(uuid, uuid, uuid)
  to service_role;
