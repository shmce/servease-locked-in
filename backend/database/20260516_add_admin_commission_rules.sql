create table if not exists payment.commission_rules (
  id text primary key,
  category_key text not null unique,
  category_label text not null,
  current_rate numeric not null default 15,
  previous_rate numeric not null default 15,
  status text not null default 'active',
  monthly_revenue numeric not null default 0,
  monthly_commission numeric not null default 0,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table payment.commission_rules enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'commission_rules_rate_check'
      and conrelid = 'payment.commission_rules'::regclass
  ) then
    alter table payment.commission_rules
      add constraint commission_rules_rate_check
      check (
        current_rate >= 0
        and current_rate <= 100
        and previous_rate >= 0
        and previous_rate <= 100
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'commission_rules_status_check'
      and conrelid = 'payment.commission_rules'::regclass
  ) then
    alter table payment.commission_rules
      add constraint commission_rules_status_check
      check (status in ('active', 'pending', 'inactive'));
  end if;
end $$;

insert into payment.commission_rules (
  id,
  category_key,
  category_label,
  current_rate,
  previous_rate,
  monthly_revenue,
  monthly_commission
)
values
  ('platform-default', 'platform-default', 'Platform Default', 15, 15, 0, 0),
  ('home-maintenance-repair', 'home-maintenance-repair', 'Home Maintenance & Repair', 12, 10, 1250000, 150000),
  ('beauty-wellness-personal-care', 'beauty-wellness-personal-care', 'Beauty, Wellness & Personal Care', 15, 15, 850000, 127500),
  ('domestic-cleaning-services', 'domestic-cleaning-services', 'Domestic & Cleaning Services', 10, 8, 980000, 98000),
  ('pet-services', 'pet-services', 'Pet Services', 18, 18, 450000, 81000),
  ('events-entertainment', 'events-entertainment', 'Events & Entertainment', 20, 18, 2100000, 420000),
  ('automotive-tech-support', 'automotive-tech-support', 'Automotive & Tech Support', 14, 14, 670000, 93800),
  ('educational-professional-services', 'educational-professional-services', 'Educational & Professional Services', 16, 15, 540000, 86400)
on conflict (id) do nothing;

create or replace function public.servease_admin_list_commission_rules()
returns table (
  id text,
  category_key text,
  category_label text,
  current_rate numeric,
  previous_rate numeric,
  status text,
  monthly_revenue numeric,
  monthly_commission numeric,
  updated_by uuid,
  updated_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    cr.id,
    cr.category_key,
    cr.category_label,
    cr.current_rate,
    cr.previous_rate,
    cr.status,
    cr.monthly_revenue,
    cr.monthly_commission,
    cr.updated_by,
    cr.updated_at,
    cr.created_at
  from payment.commission_rules cr
  order by
    case when cr.id = 'platform-default' then 0 else 1 end,
    cr.category_label asc;
$$;

create or replace function public.servease_admin_update_commission_rule(
  p_rule_id text,
  p_current_rate numeric,
  p_status text,
  p_admin_user_id uuid
)
returns table (
  id text,
  category_key text,
  category_label text,
  current_rate numeric,
  previous_rate numeric,
  status text,
  monthly_revenue numeric,
  monthly_commission numeric,
  updated_by uuid,
  updated_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_previous_rate numeric;
begin
  if nullif(trim(coalesce(p_rule_id, '')), '') is null
    or p_current_rate is null
    or p_current_rate < 0
    or p_current_rate > 100
    or p_status not in ('active', 'pending', 'inactive')
    or p_admin_user_id is null then
    raise exception 'invalid_payment_request';
  end if;

  select cr.current_rate
    into v_previous_rate
  from payment.commission_rules cr
  where cr.id = p_rule_id;

  if v_previous_rate is null then
    raise exception 'payment_not_found';
  end if;

  update payment.commission_rules cr
  set previous_rate = v_previous_rate,
      current_rate = p_current_rate,
      status = p_status,
      monthly_commission = round((cr.monthly_revenue * p_current_rate) / 100, 2),
      updated_by = p_admin_user_id,
      updated_at = now()
  where cr.id = p_rule_id;

  if p_rule_id = 'platform-default' then
    insert into payment.platform_pricing_config (commission_rate)
    values (p_current_rate);
  end if;

  return query
    select *
    from public.servease_admin_list_commission_rules() cr
    where cr.id = p_rule_id;
end;
$$;

revoke all on function public.servease_admin_list_commission_rules() from public, anon, authenticated;
revoke all on function public.servease_admin_update_commission_rule(text, numeric, text, uuid) from public, anon, authenticated;

grant execute on function public.servease_admin_list_commission_rules() to service_role;
grant execute on function public.servease_admin_update_commission_rule(text, numeric, text, uuid) to service_role;
