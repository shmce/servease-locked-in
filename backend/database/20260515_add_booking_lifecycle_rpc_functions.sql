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
  v_total numeric := coalesce(p_service_amount, 0);
begin
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
    coalesce(p_hours_required, 1),
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
    b.service_address,
    b.scheduled_at,
    b.status,
    b.total_amount
  from booking.bookings b
  where b.id = p_booking_id;
end;
$$;

create or replace function public.servease_smoke_cleanup_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  delete from booking.additional_charges where booking_id = p_booking_id;
  delete from booking.booking_attachments where booking_id = p_booking_id;
  delete from booking.booking_timeline_events where booking_id = p_booking_id;
  delete from booking.bookings_cancellations where booking_id = p_booking_id;
  delete from booking.disputes where booking_id = p_booking_id;
  delete from booking.bookings where id = p_booking_id;
end;
$$;

revoke all on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_transition_booking_status(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_booking(uuid) from public, anon, authenticated;

grant execute on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, text, text) to service_role;
grant execute on function public.servease_transition_booking_status(uuid, uuid, text, text, text) to service_role;
grant execute on function public.servease_smoke_cleanup_booking(uuid) to service_role;
