create or replace function public.servease_create_booking(
  p_customer_id uuid,
  p_provider_id uuid,
  p_service_id uuid default null,
  p_service_title text default null,
  p_service_name text default null,
  p_service_description text default null,
  p_service_address text default null,
  p_scheduled_at timestamptz default now(),
  p_hours_required integer default 1,
  p_service_amount numeric default 0,
  p_pricing_mode text default 'flat',
  p_payment_method text default 'cash_on_service',
  p_customer_notes text default null
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
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_booking_id uuid := gen_random_uuid();
  v_reference text := 'SE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_hours integer := greatest(coalesce(p_hours_required, 1), 1);
  v_total numeric := coalesce(p_service_amount, 0);
  v_local_start timestamp := p_scheduled_at at time zone 'Asia/Manila';
  v_local_end timestamp := (p_scheduled_at + make_interval(hours => v_hours)) at time zone 'Asia/Manila';
  v_day_name text := trim(lower(to_char(p_scheduled_at at time zone 'Asia/Manila', 'Day')));
  v_requested_range tstzrange := tstzrange(
    p_scheduled_at,
    p_scheduled_at + make_interval(hours => v_hours),
    '[)'
  );
begin
  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  if exists (
    select 1
    from booking.provider_days_off d
    where d.user_id = p_provider_id
      and d.off_date = v_local_start::date
  ) then
    raise exception 'provider_unavailable';
  end if;

  if not exists (
    select 1
    from booking.provider_availability_windows w
    where w.user_id = p_provider_id
      and coalesce(w.is_active, true) = true
      and trim(lower(w.day_of_week)) = v_day_name
      and w.start_time <= v_local_start::time
      and w.end_time >= v_local_end::time
  ) then
    raise exception 'provider_unavailable';
  end if;

  if exists (
    select 1
    from booking.bookings b
    where b.provider_id = p_provider_id
      and b.status in ('pending', 'confirmed', 'in_progress')
      and tstzrange(
        b.scheduled_at,
        b.scheduled_at + make_interval(hours => greatest(coalesce(b.hours_required, 1), 1)),
        '[)'
      ) && v_requested_range
  ) then
    raise exception 'provider_unavailable';
  end if;

  insert into booking.bookings (
    id,
    booking_reference,
    customer_id,
    provider_id,
    service_id,
    service_title,
    service_name,
    service_description,
    service_address,
    scheduled_at,
    hours_required,
    service_amount,
    additional_amount,
    total_amount,
    pricing_mode,
    flat_rate,
    hourly_rate,
    payment_method,
    customer_notes,
    status
  )
  values (
    v_booking_id,
    v_reference,
    p_customer_id,
    p_provider_id,
    p_service_id,
    p_service_title,
    p_service_name,
    p_service_description,
    p_service_address,
    p_scheduled_at,
    v_hours,
    coalesce(p_service_amount, 0),
    0,
    v_total,
    coalesce(p_pricing_mode, 'flat'),
    case when coalesce(p_pricing_mode, 'flat') = 'flat' then coalesce(p_service_amount, 0) else null end,
    case when coalesce(p_pricing_mode, 'flat') = 'hourly' then coalesce(p_service_amount, 0) else null end,
    coalesce(p_payment_method, 'cash_on_service'),
    p_customer_notes,
    'pending'
  );

  insert into booking.booking_timeline_events (
    booking_id,
    event_type,
    label,
    icon
  )
  values (
    v_booking_id,
    'created',
    'Booking requested',
    'calendar'
  );

  return query
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
  where b.id = v_booking_id;
end;
$$;

create or replace function public.servease_smoke_seed_provider_availability(
  p_provider_id uuid,
  p_scheduled_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_local_start timestamp := p_scheduled_at at time zone 'Asia/Manila';
  v_day_name text := trim(lower(to_char(p_scheduled_at at time zone 'Asia/Manila', 'Day')));
begin
  delete from booking.provider_days_off
  where user_id = p_provider_id
    and off_date = v_local_start::date;

  delete from booking.provider_availability_windows
  where user_id = p_provider_id;

  insert into booking.provider_availability_windows (
    user_id,
    day_of_week,
    start_time,
    end_time,
    is_active,
    sort_order
  )
  values (
    p_provider_id,
    v_day_name,
    '09:00'::time,
    '17:00'::time,
    true,
    1
  );
end;
$$;

create or replace function public.servease_smoke_cleanup_provider_availability(p_provider_id uuid)
returns void
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  delete from booking.provider_days_off
  where user_id = p_provider_id;

  delete from booking.provider_availability_windows
  where user_id = p_provider_id;
end;
$$;

revoke all on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_smoke_seed_provider_availability(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_provider_availability(uuid) from public, anon, authenticated;

grant execute on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, text, text) to service_role;
grant execute on function public.servease_smoke_seed_provider_availability(uuid, timestamptz) to service_role;
grant execute on function public.servease_smoke_cleanup_provider_availability(uuid) to service_role;
