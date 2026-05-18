-- Payment Service owns pricing rules, fuel index snapshots, and quote snapshots.

create table if not exists payment.pricing_rule_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default pricing rules',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment.pricing_category_rules (
  id uuid primary key default gen_random_uuid(),
  rule_set_id uuid references payment.pricing_rule_sets(id),
  category_id uuid null,
  category_name text not null,
  pricing_mode text not null default 'any' check (pricing_mode in ('any', 'flat', 'hourly')),
  baseline_min numeric not null check (baseline_min >= 0),
  baseline_max numeric not null check (baseline_max >= baseline_min),
  fair_band_percent numeric not null default 15 check (fair_band_percent >= 0 and fair_band_percent <= 100),
  travel_fee_min numeric not null default 0 check (travel_fee_min >= 0),
  travel_fee_max numeric not null default 500 check (travel_fee_max >= travel_fee_min),
  travel_multiplier numeric not null default 1.2 check (travel_multiplier >= 0),
  travel_time_fee_per_minute numeric not null default 2 check (travel_time_fee_per_minute >= 0),
  urgency_priority_multiplier numeric not null default 0.1 check (urgency_priority_multiplier >= 0),
  urgency_emergency_multiplier numeric not null default 0.25 check (urgency_emergency_multiplier >= 0),
  outlier_warn_percent numeric not null default 20 check (outlier_warn_percent >= 0),
  is_active boolean not null default true,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pricing_category_rules_category_idx
  on payment.pricing_category_rules(category_id, pricing_mode)
  where is_active = true;

create table if not exists payment.pricing_fuel_index_snapshots (
  id uuid primary key default gen_random_uuid(),
  region text not null default 'default',
  fuel_price_per_liter numeric not null check (fuel_price_per_liter > 0),
  source text null,
  effective_at timestamptz not null default now(),
  created_by uuid null,
  created_at timestamptz not null default now()
);

create index if not exists pricing_fuel_index_region_effective_idx
  on payment.pricing_fuel_index_snapshots(region, effective_at desc);

create table if not exists payment.pricing_quote_snapshots (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  provider_id uuid not null,
  service_id uuid not null,
  category_id uuid null,
  expires_at timestamptz not null,
  currency text not null default 'PHP',
  estimated_total numeric not null check (estimated_total >= 0),
  fair_range_min numeric not null check (fair_range_min >= 0),
  fair_range_max numeric not null check (fair_range_max >= fair_range_min),
  fairness_status text not null check (fairness_status in ('below_range', 'within_range', 'above_range')),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  line_items jsonb not null default '[]'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  explanation text not null,
  created_at timestamptz not null default now()
);

create index if not exists pricing_quote_snapshots_lookup_idx
  on payment.pricing_quote_snapshots(customer_id, provider_id, service_id, expires_at desc);

create table if not exists payment.pricing_outlier_reviews (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references payment.pricing_quote_snapshots(id),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  reviewed_by uuid null,
  reviewed_at timestamptz null,
  note text null,
  created_at timestamptz not null default now()
);

alter table booking.bookings
  add column if not exists accepted_quote_id uuid null,
  add column if not exists quote_fairness_status text null,
  add column if not exists quote_confidence text null;

insert into payment.pricing_rule_sets (name, is_active)
select 'Default pricing rules', true
where not exists (select 1 from payment.pricing_rule_sets where is_active = true);

insert into payment.pricing_category_rules (
  rule_set_id,
  category_name,
  pricing_mode,
  baseline_min,
  baseline_max,
  fair_band_percent,
  travel_fee_min,
  travel_fee_max,
  travel_multiplier,
  travel_time_fee_per_minute,
  urgency_priority_multiplier,
  urgency_emergency_multiplier,
  outlier_warn_percent,
  is_active
)
select
  (select id from payment.pricing_rule_sets where is_active = true order by created_at desc limit 1),
  'Default services',
  'any',
  300,
  5000,
  15,
  0,
  500,
  1.2,
  2,
  0.1,
  0.25,
  20,
  true
where not exists (
  select 1 from payment.pricing_category_rules where category_name = 'Default services'
);

insert into payment.pricing_fuel_index_snapshots (
  region,
  fuel_price_per_liter,
  source,
  effective_at
)
select 'default', 68, 'admin-default', now()
where not exists (select 1 from payment.pricing_fuel_index_snapshots);

create or replace function public.servease_admin_list_pricing_rules()
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  pricing_mode text,
  baseline_min numeric,
  baseline_max numeric,
  fair_band_percent numeric,
  travel_fee_min numeric,
  travel_fee_max numeric,
  travel_multiplier numeric,
  travel_time_fee_per_minute numeric,
  urgency_priority_multiplier numeric,
  urgency_emergency_multiplier numeric,
  outlier_warn_percent numeric,
  is_active boolean,
  updated_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    r.id,
    r.category_id,
    r.category_name,
    r.pricing_mode,
    r.baseline_min,
    r.baseline_max,
    r.fair_band_percent,
    r.travel_fee_min,
    r.travel_fee_max,
    r.travel_multiplier,
    r.travel_time_fee_per_minute,
    r.urgency_priority_multiplier,
    r.urgency_emergency_multiplier,
    r.outlier_warn_percent,
    r.is_active,
    r.updated_at
  from payment.pricing_category_rules r
  order by r.category_name, r.pricing_mode;
$$;

create or replace function public.servease_admin_upsert_pricing_rule(
  p_rule_id uuid default null,
  p_category_id uuid default null,
  p_category_name text default null,
  p_pricing_mode text default 'any',
  p_baseline_min numeric default 0,
  p_baseline_max numeric default 0,
  p_fair_band_percent numeric default 15,
  p_travel_fee_min numeric default 0,
  p_travel_fee_max numeric default 500,
  p_travel_multiplier numeric default 1.2,
  p_travel_time_fee_per_minute numeric default 2,
  p_urgency_priority_multiplier numeric default 0.1,
  p_urgency_emergency_multiplier numeric default 0.25,
  p_outlier_warn_percent numeric default 20,
  p_is_active boolean default true,
  p_admin_user_id uuid default null
)
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  pricing_mode text,
  baseline_min numeric,
  baseline_max numeric,
  fair_band_percent numeric,
  travel_fee_min numeric,
  travel_fee_max numeric,
  travel_multiplier numeric,
  travel_time_fee_per_minute numeric,
  urgency_priority_multiplier numeric,
  urgency_emergency_multiplier numeric,
  outlier_warn_percent numeric,
  is_active boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_rule_set_id uuid;
  v_rule_id uuid := coalesce(p_rule_id, gen_random_uuid());
begin
  if p_category_name is null or btrim(p_category_name) = '' then
    raise exception 'invalid_pricing_rule_request';
  end if;

  if p_pricing_mode not in ('any', 'flat', 'hourly') then
    raise exception 'invalid_pricing_rule_request';
  end if;

  if p_baseline_min < 0 or p_baseline_max < p_baseline_min then
    raise exception 'invalid_pricing_rule_request';
  end if;

  select pricing_rule_sets.id into v_rule_set_id
  from payment.pricing_rule_sets
  where pricing_rule_sets.is_active = true
  order by pricing_rule_sets.created_at desc
  limit 1;

  if v_rule_set_id is null then
    insert into payment.pricing_rule_sets (name, is_active)
    values ('Default pricing rules', true)
    returning id into v_rule_set_id;
  end if;

  insert into payment.pricing_category_rules (
    id,
    rule_set_id,
    category_id,
    category_name,
    pricing_mode,
    baseline_min,
    baseline_max,
    fair_band_percent,
    travel_fee_min,
    travel_fee_max,
    travel_multiplier,
    travel_time_fee_per_minute,
    urgency_priority_multiplier,
    urgency_emergency_multiplier,
    outlier_warn_percent,
    is_active,
    updated_by,
    updated_at
  )
  values (
    v_rule_id,
    v_rule_set_id,
    p_category_id,
    btrim(p_category_name),
    p_pricing_mode,
    p_baseline_min,
    p_baseline_max,
    p_fair_band_percent,
    p_travel_fee_min,
    p_travel_fee_max,
    p_travel_multiplier,
    p_travel_time_fee_per_minute,
    p_urgency_priority_multiplier,
    p_urgency_emergency_multiplier,
    p_outlier_warn_percent,
    coalesce(p_is_active, true),
    p_admin_user_id,
    now()
  )
  on conflict on constraint pricing_category_rules_pkey do update set
    category_id = excluded.category_id,
    category_name = excluded.category_name,
    pricing_mode = excluded.pricing_mode,
    baseline_min = excluded.baseline_min,
    baseline_max = excluded.baseline_max,
    fair_band_percent = excluded.fair_band_percent,
    travel_fee_min = excluded.travel_fee_min,
    travel_fee_max = excluded.travel_fee_max,
    travel_multiplier = excluded.travel_multiplier,
    travel_time_fee_per_minute = excluded.travel_time_fee_per_minute,
    urgency_priority_multiplier = excluded.urgency_priority_multiplier,
    urgency_emergency_multiplier = excluded.urgency_emergency_multiplier,
    outlier_warn_percent = excluded.outlier_warn_percent,
    is_active = excluded.is_active,
    updated_by = excluded.updated_by,
    updated_at = now();

  return query
  select *
  from public.servease_admin_list_pricing_rules() as pricing_rule_row
  where pricing_rule_row.id = v_rule_id;
end;
$$;

create or replace function public.servease_admin_list_pricing_fuel_index()
returns table (
  id uuid,
  region text,
  fuel_price_per_liter numeric,
  source text,
  effective_at timestamptz,
  created_by uuid,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    f.id,
    f.region,
    f.fuel_price_per_liter,
    f.source,
    f.effective_at,
    f.created_by,
    f.created_at
  from payment.pricing_fuel_index_snapshots f
  order by f.effective_at desc
  limit 100;
$$;

create or replace function public.servease_admin_create_pricing_fuel_index(
  p_region text,
  p_fuel_price_per_liter numeric,
  p_source text default null,
  p_effective_at timestamptz default now(),
  p_admin_user_id uuid default null
)
returns table (
  id uuid,
  region text,
  fuel_price_per_liter numeric,
  source text,
  effective_at timestamptz,
  created_by uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_id uuid;
begin
  if p_region is null or btrim(p_region) = '' or p_fuel_price_per_liter <= 0 then
    raise exception 'invalid_pricing_rule_request';
  end if;

  insert into payment.pricing_fuel_index_snapshots (
    region,
    fuel_price_per_liter,
    source,
    effective_at,
    created_by
  )
  values (
    lower(btrim(p_region)),
    p_fuel_price_per_liter,
    nullif(btrim(coalesce(p_source, 'admin')), ''),
    coalesce(p_effective_at, now()),
    p_admin_user_id
  )
  returning pricing_fuel_index_snapshots.id into v_id;

  return query
  select *
  from public.servease_admin_list_pricing_fuel_index() as fuel_index_row
  where fuel_index_row.id = v_id;
end;
$$;

create or replace function public.servease_create_pricing_quote(
  p_customer_id uuid,
  p_provider_id uuid,
  p_service_id uuid,
  p_category_id uuid default null,
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
  insert into payment.pricing_quote_snapshots (
    customer_id,
    provider_id,
    service_id,
    category_id,
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

create or replace function public.servease_validate_pricing_quote(p_quote_id uuid)
returns table (
  id uuid,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  category_id uuid,
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
    q.expires_at,
    q.estimated_total,
    q.fair_range_min,
    q.fair_range_max,
    q.fairness_status,
    q.confidence,
    'flat'::text,
    q.created_at
  from payment.pricing_quote_snapshots q
  where q.id = p_quote_id;

  if not found then
    raise exception 'pricing_quote_not_found';
  end if;
end;
$$;

create or replace function public.servease_admin_list_pricing_quote_audits()
returns table (
  id uuid,
  customer_id uuid,
  provider_id uuid,
  service_id uuid,
  category_id uuid,
  expires_at timestamptz,
  estimated_total numeric,
  fair_range_min numeric,
  fair_range_max numeric,
  fairness_status text,
  confidence text,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    q.id,
    q.customer_id,
    q.provider_id,
    q.service_id,
    q.category_id,
    q.expires_at,
    q.estimated_total,
    q.fair_range_min,
    q.fair_range_max,
    q.fairness_status,
    q.confidence,
    q.created_at
  from payment.pricing_quote_snapshots q
  order by q.created_at desc
  limit 250;
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
    coalesce(p_hours_required, 1),
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

revoke all on function public.servease_admin_list_pricing_rules() from public, anon, authenticated;
revoke all on function public.servease_admin_upsert_pricing_rule(uuid, uuid, text, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, boolean, uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_list_pricing_fuel_index() from public, anon, authenticated;
revoke all on function public.servease_admin_create_pricing_fuel_index(text, numeric, text, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.servease_create_pricing_quote(uuid, uuid, uuid, uuid, timestamptz, numeric, numeric, numeric, text, text, jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.servease_validate_pricing_quote(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_list_pricing_quote_audits() from public, anon, authenticated;
revoke all on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, uuid, text, text, text, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_pricing_rules() to service_role;
grant execute on function public.servease_admin_upsert_pricing_rule(uuid, uuid, text, text, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric, boolean, uuid) to service_role;
grant execute on function public.servease_admin_list_pricing_fuel_index() to service_role;
grant execute on function public.servease_admin_create_pricing_fuel_index(text, numeric, text, timestamptz, uuid) to service_role;
grant execute on function public.servease_create_pricing_quote(uuid, uuid, uuid, uuid, timestamptz, numeric, numeric, numeric, text, text, jsonb, jsonb, text) to service_role;
grant execute on function public.servease_validate_pricing_quote(uuid) to service_role;
grant execute on function public.servease_admin_list_pricing_quote_audits() to service_role;
grant execute on function public.servease_create_booking(uuid, uuid, uuid, text, text, text, text, timestamptz, integer, numeric, text, uuid, text, text, text, text) to service_role;
