alter table booking.bookings
  add column if not exists price_breakdown jsonb null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_price_breakdown_object'
  ) then
    alter table booking.bookings
      add constraint bookings_price_breakdown_object
      check (price_breakdown is null or jsonb_typeof(price_breakdown) = 'object')
      not valid;
  end if;
end;
$$;

drop function if exists public.servease_create_booking(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  integer,
  numeric,
  text,
  uuid,
  text,
  text,
  text,
  text,
  numeric,
  numeric
);

drop function if exists public.servease_create_booking(
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  timestamptz,
  integer,
  numeric,
  numeric,
  text,
  uuid,
  text,
  text,
  jsonb,
  text,
  text,
  numeric,
  numeric
);

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
  p_total_amount numeric default null,
  p_pricing_mode text default 'flat',
  p_accepted_quote_id uuid default null,
  p_quote_fairness_status text default null,
  p_quote_confidence text default null,
  p_price_breakdown jsonb default null,
  p_payment_method text default 'cash_on_service',
  p_customer_notes text default null,
  p_service_latitude numeric default null,
  p_service_longitude numeric default null
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
  service_latitude numeric,
  service_longitude numeric,
  scheduled_at timestamptz,
  hours_required integer,
  service_amount numeric,
  pricing_mode text,
  accepted_quote_id uuid,
  quote_fairness_status text,
  quote_confidence text,
  customer_notes text,
  status text,
  total_amount numeric,
  price_breakdown jsonb
)
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_booking_id uuid := gen_random_uuid();
  v_reference text := 'SE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_hours integer := greatest(coalesce(p_hours_required, 1), 1);
  v_service_amount numeric := coalesce(p_service_amount, 0);
  v_total numeric := coalesce(p_total_amount, p_service_amount, 0);
  v_local_start timestamp := p_scheduled_at at time zone 'Asia/Manila';
  v_local_end timestamp := (p_scheduled_at + make_interval(hours => v_hours)) at time zone 'Asia/Manila';
  v_day_name text := trim(lower(to_char(p_scheduled_at at time zone 'Asia/Manila', 'Day')));
  v_requested_range tstzrange := tstzrange(
    p_scheduled_at,
    p_scheduled_at + make_interval(hours => v_hours),
    '[)'
  );
begin
  if p_scheduled_at is null or p_scheduled_at < now() then
    raise exception 'booking_schedule_in_past';
  end if;

  if p_service_latitude is not null and p_service_latitude not between -90 and 90 then
    raise exception 'invalid_booking_request';
  end if;

  if p_service_longitude is not null and p_service_longitude not between -180 and 180 then
    raise exception 'invalid_booking_request';
  end if;

  if p_price_breakdown is not null and jsonb_typeof(p_price_breakdown) <> 'object' then
    raise exception 'invalid_booking_request';
  end if;

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
    service_latitude,
    service_longitude,
    scheduled_at,
    hours_required,
    service_amount,
    additional_amount,
    total_amount,
    pricing_mode,
    accepted_quote_id,
    quote_fairness_status,
    quote_confidence,
    price_breakdown,
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
    p_service_latitude,
    p_service_longitude,
    p_scheduled_at,
    v_hours,
    v_service_amount,
    greatest(v_total - v_service_amount, 0),
    v_total,
    coalesce(p_pricing_mode, 'flat'),
    p_accepted_quote_id,
    p_quote_fairness_status,
    p_quote_confidence,
    p_price_breakdown,
    case when coalesce(p_pricing_mode, 'flat') = 'flat' then v_service_amount else null end,
    case when coalesce(p_pricing_mode, 'flat') = 'hourly' then v_service_amount / v_hours else null end,
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
    b.service_latitude,
    b.service_longitude,
    b.scheduled_at,
    b.hours_required,
    b.service_amount,
    b.pricing_mode,
    b.accepted_quote_id,
    b.quote_fairness_status,
    b.quote_confidence,
    b.customer_notes,
    b.status,
    b.total_amount,
    b.price_breakdown
  from booking.bookings b
  where b.id = v_booking_id;
end;
$$;

drop function if exists public.servease_list_visible_bookings(uuid, uuid);
drop function if exists public.servease_get_visible_booking(uuid, uuid, uuid);
drop function if exists public.servease_transition_booking_status(uuid, uuid, text, text, text);

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
  service_description text,
  service_address text,
  service_latitude numeric,
  service_longitude numeric,
  scheduled_at timestamptz,
  hours_required integer,
  service_amount numeric,
  pricing_mode text,
  accepted_quote_id uuid,
  quote_fairness_status text,
  quote_confidence text,
  customer_notes text,
  status text,
  total_amount numeric,
  price_breakdown jsonb
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
    b.service_description,
    b.service_address,
    b.service_latitude,
    b.service_longitude,
    b.scheduled_at,
    b.hours_required,
    b.service_amount,
    b.pricing_mode,
    b.accepted_quote_id,
    b.quote_fairness_status,
    b.quote_confidence,
    b.customer_notes,
    b.status,
    b.total_amount,
    b.price_breakdown
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
  service_description text,
  service_address text,
  service_latitude numeric,
  service_longitude numeric,
  scheduled_at timestamptz,
  hours_required integer,
  service_amount numeric,
  pricing_mode text,
  accepted_quote_id uuid,
  quote_fairness_status text,
  quote_confidence text,
  customer_notes text,
  status text,
  total_amount numeric,
  price_breakdown jsonb
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
    b.service_description,
    b.service_address,
    b.service_latitude,
    b.service_longitude,
    b.scheduled_at,
    b.hours_required,
    b.service_amount,
    b.pricing_mode,
    b.accepted_quote_id,
    b.quote_fairness_status,
    b.quote_confidence,
    b.customer_notes,
    b.status,
    b.total_amount,
    b.price_breakdown
  from booking.bookings b
  where b.id = p_booking_id
    and (
      (p_customer_id is not null and b.customer_id = p_customer_id)
      or (p_provider_id is not null and b.provider_id = p_provider_id)
    )
  limit 1;
$$;

create or replace function public.servease_transition_booking_status(
  p_booking_id uuid,
  p_actor_id uuid,
  p_next_status text,
  p_reason text default null,
  p_explanation text default null
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
  service_latitude numeric,
  service_longitude numeric,
  scheduled_at timestamptz,
  hours_required integer,
  service_amount numeric,
  pricing_mode text,
  accepted_quote_id uuid,
  quote_fairness_status text,
  quote_confidence text,
  customer_notes text,
  status text,
  total_amount numeric,
  price_breakdown jsonb
)
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_current_status text;
begin
  select b.status
    into v_current_status
  from booking.bookings b
  where b.id = p_booking_id
  for update;

  if v_current_status is null then
    raise exception 'booking_not_found';
  end if;

  if not (
    (v_current_status = 'pending' and p_next_status in ('confirmed', 'rejected', 'cancelled')) or
    (v_current_status = 'confirmed' and p_next_status in ('in_progress', 'cancelled')) or
    (v_current_status = 'in_progress' and p_next_status in ('completed', 'cancelled'))
  ) then
    raise exception 'invalid_booking_transition';
  end if;

  update booking.bookings b
  set
    status = p_next_status,
    cancelled_by = case when p_next_status = 'cancelled' then p_actor_id else b.cancelled_by end,
    cancel_reason = case when p_next_status = 'cancelled' then p_reason else b.cancel_reason end,
    cancel_explanation = case when p_next_status = 'cancelled' then p_explanation else b.cancel_explanation end,
    cancelled_at = case when p_next_status = 'cancelled' then now() else b.cancelled_at end,
    started_at = case when p_next_status = 'in_progress' then now() else b.started_at end,
    completed_at = case when p_next_status = 'completed' then now() else b.completed_at end,
    updated_at = now()
  where b.id = p_booking_id;

  insert into booking.booking_timeline_events (
    booking_id,
    event_type,
    label,
    icon
  )
  values (
    p_booking_id,
    'status_changed',
    'Booking status changed to ' || p_next_status,
    'activity'
  );

  if p_next_status = 'cancelled' then
    insert into booking.bookings_cancellations (
      booking_id,
      cancelled_by,
      reason,
      detailed_explanation
    )
    values (
      p_booking_id,
      p_actor_id,
      p_reason,
      p_explanation
    );
  end if;

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
    b.service_latitude,
    b.service_longitude,
    b.scheduled_at,
    b.hours_required,
    b.service_amount,
    b.pricing_mode,
    b.accepted_quote_id,
    b.quote_fairness_status,
    b.quote_confidence,
    b.customer_notes,
    b.status,
    b.total_amount,
    b.price_breakdown
  from booking.bookings b
  where b.id = p_booking_id;
end;
$$;

revoke all on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, numeric, text, uuid, text, text, jsonb, text, text, numeric, numeric) from public, anon, authenticated;
revoke all on function public.servease_list_visible_bookings(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_get_visible_booking(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_transition_booking_status(uuid, uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, numeric, text, uuid, text, text, jsonb, text, text, numeric, numeric) to service_role;
grant execute on function public.servease_list_visible_bookings(uuid, uuid) to service_role;
grant execute on function public.servease_get_visible_booking(uuid, uuid, uuid) to service_role;
grant execute on function public.servease_transition_booking_status(uuid, uuid, text, text, text) to service_role;
