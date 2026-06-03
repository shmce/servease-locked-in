-- Harden booking schedule creation and accepted pricing quote context.

alter table payment.pricing_quote_snapshots
  add column if not exists service_address text null,
  add column if not exists scheduled_at timestamptz null,
  add column if not exists hours_required numeric null,
  add column if not exists pricing_mode text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pricing_quote_snapshots_pricing_mode_check'
  ) then
    alter table payment.pricing_quote_snapshots
      add constraint pricing_quote_snapshots_pricing_mode_check
      check (pricing_mode is null or pricing_mode in ('flat', 'hourly'));
  end if;
end $$;

create index if not exists pricing_quote_snapshots_context_idx
  on payment.pricing_quote_snapshots(customer_id, provider_id, service_id, scheduled_at, expires_at desc);

drop function if exists public.servease_create_pricing_quote(uuid, uuid, uuid, uuid, timestamptz, numeric, numeric, numeric, text, text, jsonb, jsonb, text);
drop function if exists public.servease_create_pricing_quote(uuid, uuid, uuid, uuid, text, timestamptz, numeric, text, timestamptz, numeric, numeric, numeric, text, text, jsonb, jsonb, text);

create or replace function public.servease_create_pricing_quote(
  p_customer_id uuid,
  p_provider_id uuid,
  p_service_id uuid,
  p_category_id uuid default null,
  p_service_address text default null,
  p_scheduled_at timestamptz default null,
  p_hours_required numeric default null,
  p_pricing_mode text default 'flat',
  p_expires_at timestamptz default now() + interval '15 minutes',
  p_estimated_total numeric default 0,
  p_fair_range_min numeric default 0,
  p_fair_range_max numeric default 0,
  p_fairness_status text default 'within_range',
  p_confidence text default 'medium',
  p_line_items jsonb default '[]'::jsonb,
  p_signals jsonb default '{}'::jsonb,
  p_explanation text default ''
)
returns table (
  id uuid,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  category_id uuid,
  service_address text,
  scheduled_at timestamptz,
  hours_required numeric,
  pricing_mode text,
  expires_at timestamptz,
  estimated_total numeric,
  fair_range_min numeric,
  fair_range_max numeric,
  fairness_status text,
  confidence text,
  line_items jsonb,
  signals jsonb,
  explanation text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_quote_id uuid;
begin
  if p_pricing_mode not in ('flat', 'hourly') then
    raise exception 'invalid_pricing_quote_request';
  end if;

  insert into payment.pricing_quote_snapshots (
    customer_id,
    provider_id,
    service_id,
    category_id,
    service_address,
    scheduled_at,
    hours_required,
    pricing_mode,
    expires_at,
    estimated_total,
    fair_range_min,
    fair_range_max,
    fairness_status,
    confidence,
    line_items,
    signals,
    explanation
  )
  values (
    p_customer_id,
    p_provider_id,
    p_service_id,
    p_category_id,
    nullif(btrim(coalesce(p_service_address, '')), ''),
    p_scheduled_at,
    p_hours_required,
    p_pricing_mode,
    p_expires_at,
    p_estimated_total,
    p_fair_range_min,
    p_fair_range_max,
    p_fairness_status,
    p_confidence,
    coalesce(p_line_items, '[]'::jsonb),
    coalesce(p_signals, '{}'::jsonb),
    coalesce(p_explanation, '')
  )
  returning pricing_quote_snapshots.id into v_quote_id;

  insert into payment.pricing_outlier_reviews (quote_id)
  select v_quote_id
  where p_fairness_status in ('below_range', 'above_range');

  return query
  select
    q.id,
    q.customer_id,
    q.provider_id,
    q.service_id,
    q.category_id,
    q.service_address,
    q.scheduled_at,
    q.hours_required,
    coalesce(q.pricing_mode, 'flat'),
    q.expires_at,
    q.estimated_total,
    q.fair_range_min,
    q.fair_range_max,
    q.fairness_status,
    q.confidence,
    q.line_items,
    q.signals,
    q.explanation,
    q.created_at
  from payment.pricing_quote_snapshots q
  where q.id = v_quote_id;
end;
$$;

drop function if exists public.servease_validate_pricing_quote(uuid);

create or replace function public.servease_validate_pricing_quote(p_quote_id uuid)
returns table (
  id uuid,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  category_id uuid,
  service_address text,
  scheduled_at timestamptz,
  hours_required numeric,
  expires_at timestamptz,
  estimated_total numeric,
  fair_range_min numeric,
  fair_range_max numeric,
  fairness_status text,
  confidence text,
  pricing_mode text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
begin
  return query
  select
    q.id,
    q.customer_id,
    q.provider_id,
    q.service_id,
    q.category_id,
    q.service_address,
    q.scheduled_at,
    q.hours_required,
    q.expires_at,
    q.estimated_total,
    q.fair_range_min,
    q.fair_range_max,
    q.fairness_status,
    q.confidence,
    coalesce(q.pricing_mode, 'flat'),
    q.created_at
  from payment.pricing_quote_snapshots q
  where q.id = p_quote_id;

  if not found then
    raise exception 'pricing_quote_not_found';
  end if;
end;
$$;

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
  if p_scheduled_at is null or p_scheduled_at < now() then
    raise exception 'booking_schedule_in_past';
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

revoke all on function public.servease_create_pricing_quote(uuid, uuid, uuid, uuid, text, timestamptz, numeric, text, timestamptz, numeric, numeric, numeric, text, text, jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.servease_validate_pricing_quote(uuid) from public, anon, authenticated;
revoke all on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, uuid, text, text, text, text) from public, anon, authenticated;

grant execute on function public.servease_create_pricing_quote(uuid, uuid, uuid, uuid, text, timestamptz, numeric, text, timestamptz, numeric, numeric, numeric, text, text, jsonb, jsonb, text) to service_role;
grant execute on function public.servease_validate_pricing_quote(uuid) to service_role;
grant execute on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, uuid, text, text, text, text) to service_role;
