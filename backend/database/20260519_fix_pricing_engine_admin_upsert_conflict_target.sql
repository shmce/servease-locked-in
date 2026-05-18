-- Avoid PL/pgSQL output-column ambiguity in pricing rule upserts.

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
    returning pricing_rule_sets.id into v_rule_set_id;
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
