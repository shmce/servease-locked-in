create table if not exists booking.provider_time_off_windows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  off_date date not null,
  start_time time not null,
  end_time time not null,
  reason text,
  created_at timestamptz default now(),
  constraint provider_time_off_windows_valid_time check (start_time < end_time)
);

create index if not exists provider_time_off_windows_user_date_idx
  on booking.provider_time_off_windows (user_id, off_date);

create or replace function public.servease_get_provider_availability(p_provider_id uuid)
returns jsonb
language sql
security definer
set search_path = booking, public
as $$
  select jsonb_build_object(
    'providerId', p_provider_id,
    'windows', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', w.id,
            'dayOfWeek', w.day_of_week,
            'startTime', to_char(w.start_time, 'HH24:MI'),
            'endTime', to_char(w.end_time, 'HH24:MI'),
            'isActive', coalesce(w.is_active, true),
            'sortOrder', coalesce(w.sort_order, 0)
          )
          order by coalesce(w.sort_order, 0), w.day_of_week, w.start_time
        )
        from booking.provider_availability_windows w
        where w.user_id = p_provider_id
      ),
      '[]'::jsonb
    ),
    'daysOff', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', d.id,
            'offDate', d.off_date,
            'reason', d.reason
          )
          order by d.off_date
        )
        from booking.provider_days_off d
        where d.user_id = p_provider_id
      ),
      '[]'::jsonb
    ),
    'timeOffWindows', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'offDate', t.off_date,
            'startTime', to_char(t.start_time, 'HH24:MI'),
            'endTime', to_char(t.end_time, 'HH24:MI'),
            'reason', t.reason
          )
          order by t.off_date, t.start_time
        )
        from booking.provider_time_off_windows t
        where t.user_id = p_provider_id
      ),
      '[]'::jsonb
    )
  );
$$;

create or replace function public.servease_add_provider_time_off_window(
  p_provider_id uuid,
  p_off_date date,
  p_start_time text,
  p_end_time text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_start time;
  v_end time;
begin
  if p_start_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    or p_end_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  then
    raise exception 'invalid_availability_request';
  end if;

  v_start := p_start_time::time;
  v_end := p_end_time::time;

  if v_start >= v_end then
    raise exception 'invalid_availability_request';
  end if;

  if p_off_date < ((now() at time zone 'Asia/Manila')::date + 2) then
    raise exception 'time_off_too_soon';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  if exists (
    select 1
    from booking.bookings b
    where b.provider_id = p_provider_id
      and b.status in ('pending', 'confirmed', 'in_progress')
      and tsrange(
        b.scheduled_at at time zone 'Asia/Manila',
        (b.scheduled_at + make_interval(hours => greatest(coalesce(b.hours_required, 1), 1))) at time zone 'Asia/Manila',
        '[)'
      ) && tsrange(
        p_off_date::timestamp + v_start,
        p_off_date::timestamp + v_end,
        '[)'
      )
  ) then
    raise exception 'time_off_conflicts_booking';
  end if;

  insert into booking.provider_time_off_windows (
    user_id,
    off_date,
    start_time,
    end_time,
    reason
  )
  values (
    p_provider_id,
    p_off_date,
    v_start,
    v_end,
    p_reason
  );

  return public.servease_get_provider_availability(p_provider_id);
end;
$$;

create or replace function public.servease_remove_provider_time_off_window(
  p_window_id uuid,
  p_provider_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  delete from booking.provider_time_off_windows
  where id = p_window_id
    and user_id = p_provider_id;

  return public.servease_get_provider_availability(p_provider_id);
end;
$$;

create or replace function public.servease_add_provider_day_off(
  p_provider_id uuid,
  p_off_date date,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_off_date < ((now() at time zone 'Asia/Manila')::date + 2) then
    raise exception 'time_off_too_soon';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  if exists (
    select 1
    from booking.bookings b
    where b.provider_id = p_provider_id
      and b.status in ('pending', 'confirmed', 'in_progress')
      and (b.scheduled_at at time zone 'Asia/Manila')::date = p_off_date
  ) then
    raise exception 'time_off_conflicts_booking';
  end if;

  delete from booking.provider_days_off
  where user_id = p_provider_id
    and off_date = p_off_date;

  insert into booking.provider_days_off (
    user_id,
    off_date,
    reason
  )
  values (
    p_provider_id,
    p_off_date,
    p_reason
  );

  return public.servease_get_provider_availability(p_provider_id);
end;
$$;

drop function if exists public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, text, text);

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
  p_accepted_quote_id uuid default null,
  p_quote_fairness_status text default null,
  p_quote_confidence text default null,
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
  service_description text,
  service_address text,
  scheduled_at timestamptz,
  hours_required integer,
  service_amount numeric,
  pricing_mode text,
  accepted_quote_id uuid,
  quote_fairness_status text,
  quote_confidence text,
  customer_notes text,
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

  if exists (
    select 1
    from booking.provider_time_off_windows t
    where t.user_id = p_provider_id
      and t.off_date = v_local_start::date
      and tsrange(v_local_start, v_local_end, '[)') && tsrange(
        t.off_date::timestamp + t.start_time,
        t.off_date::timestamp + t.end_time,
        '[)'
      )
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
    accepted_quote_id,
    quote_fairness_status,
    quote_confidence,
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
    p_accepted_quote_id,
    p_quote_fairness_status,
    p_quote_confidence,
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
    b.service_description,
    b.service_address,
    b.scheduled_at,
    b.hours_required,
    b.service_amount,
    b.pricing_mode,
    b.accepted_quote_id,
    b.quote_fairness_status,
    b.quote_confidence,
    b.customer_notes,
    b.status,
    b.total_amount
  from booking.bookings b
  where b.id = v_booking_id;
end;
$$;

create or replace function public.servease_smoke_cleanup_provider_availability(p_provider_id uuid)
returns void
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  delete from booking.provider_time_off_windows
  where user_id = p_provider_id;

  delete from booking.provider_days_off
  where user_id = p_provider_id;

  delete from booking.provider_availability_windows
  where user_id = p_provider_id;
end;
$$;

do $$
declare
  v_provider_user_id uuid := gen_random_uuid();
  v_provider_id uuid;
  v_customer_id uuid := gen_random_uuid();
  v_time_off_date date := ((now() at time zone 'Asia/Manila')::date + 4);
  v_conflict_date date := ((now() at time zone 'Asia/Manila')::date + 5);
  v_tomorrow date := ((now() at time zone 'Asia/Manila')::date + 1);
begin
  v_provider_id := public.servease_smoke_seed_provider_account(
    v_provider_user_id,
    'time-off-smoke-provider@example.test'
  );

  perform public.servease_smoke_seed_provider_availability(
    v_provider_id,
    (v_time_off_date::timestamp + time '10:00') at time zone 'Asia/Manila'
  );

  perform public.servease_add_provider_time_off_window(
    v_provider_id,
    v_time_off_date,
    '14:00',
    '17:00',
    'Smoke partial block'
  );

  begin
    perform public.servease_create_booking(
      v_customer_id,
      v_provider_id,
      null,
      'Smoke overlap booking',
      null,
      null,
      'Smoke address',
      (v_time_off_date::timestamp + time '15:00') at time zone 'Asia/Manila',
      1,
      0,
      'flat',
      null,
      null,
      null,
      'cash_on_service',
      null
    );
    raise exception 'smoke_missing_partial_block_rejection';
  exception
    when others then
      if sqlerrm not like '%provider_unavailable%' then
        raise;
      end if;
  end;

  perform public.servease_smoke_seed_provider_availability(
    v_provider_id,
    (v_conflict_date::timestamp + time '10:00') at time zone 'Asia/Manila'
  );

  perform public.servease_create_booking(
    v_customer_id,
    v_provider_id,
    null,
    'Smoke existing booking',
    null,
    null,
    'Smoke address',
    (v_conflict_date::timestamp + time '10:00') at time zone 'Asia/Manila',
    1,
    0,
    'flat',
    null,
    null,
    null,
    'cash_on_service',
    null
  );

  begin
    perform public.servease_add_provider_day_off(
      v_provider_id,
      v_conflict_date,
      'Smoke whole day block'
    );
    raise exception 'smoke_missing_booking_conflict_rejection';
  exception
    when others then
      if sqlerrm not like '%time_off_conflicts_booking%' then
        raise;
      end if;
  end;

  begin
    perform public.servease_add_provider_time_off_window(
      v_provider_id,
      v_tomorrow,
      '14:00',
      '17:00',
      'Smoke too soon block'
    );
    raise exception 'smoke_missing_lead_time_rejection';
  exception
    when others then
      if sqlerrm not like '%time_off_too_soon%' then
        raise;
      end if;
  end;

  delete from booking.booking_timeline_events
  where booking_id in (
    select id from booking.bookings where provider_id = v_provider_id
  );

  delete from booking.bookings
  where provider_id = v_provider_id
    or customer_id = v_customer_id;

  perform public.servease_smoke_cleanup_provider_availability(v_provider_id);
  perform public.servease_smoke_cleanup_provider_account(v_provider_user_id);
end;
$$;

revoke all on function public.servease_get_provider_availability(uuid) from public, anon, authenticated;
revoke all on function public.servease_add_provider_time_off_window(uuid, date, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_remove_provider_time_off_window(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_add_provider_day_off(uuid, date, text) from public, anon, authenticated;
revoke all on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_provider_availability(uuid) from public, anon, authenticated;

grant execute on function public.servease_get_provider_availability(uuid) to service_role;
grant execute on function public.servease_add_provider_time_off_window(uuid, date, text, text, text) to service_role;
grant execute on function public.servease_remove_provider_time_off_window(uuid, uuid) to service_role;
grant execute on function public.servease_add_provider_day_off(uuid, date, text) to service_role;
grant execute on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, uuid, text, text, text, text) to service_role;
grant execute on function public.servease_smoke_cleanup_provider_availability(uuid) to service_role;
