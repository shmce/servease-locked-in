create table if not exists payment.provider_payout_methods (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null,
  method_type text not null check (method_type in ('bank', 'gcash', 'paymaya')),
  account_label text not null,
  account_name text,
  account_number_last4 text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table payment.provider_payouts
  add column if not exists payout_method_id uuid,
  add column if not exists method_type text,
  add column if not exists account_label text,
  add column if not exists processing_fee numeric not null default 0,
  add column if not exists net_amount numeric,
  add column if not exists reference text,
  add column if not exists requested_by uuid,
  add column if not exists requested_at timestamptz,
  add column if not exists idempotency_key text;

create unique index if not exists provider_payout_methods_one_default_idx
  on payment.provider_payout_methods (provider_id)
  where is_default = true;

create unique index if not exists provider_payouts_idempotency_key_idx
  on payment.provider_payouts (provider_id, idempotency_key)
  where idempotency_key is not null;

create or replace function public.servease_list_provider_payout_methods(
  p_provider_id uuid
)
returns table (
  id uuid,
  provider_id uuid,
  method_type text,
  account_label text,
  account_name text,
  account_number_last4 text,
  is_default boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    m.id,
    m.provider_id,
    m.method_type,
    m.account_label,
    m.account_name,
    m.account_number_last4,
    m.is_default,
    m.created_at
  from payment.provider_payout_methods m
  where m.provider_id = p_provider_id
  order by m.is_default desc, m.created_at desc;
$$;

create or replace function public.servease_upsert_provider_payout_method(
  p_provider_id uuid,
  p_method_id uuid,
  p_method_type text,
  p_account_label text,
  p_account_name text,
  p_account_number_last4 text,
  p_is_default boolean default false
)
returns table (
  id uuid,
  provider_id uuid,
  method_type text,
  account_label text,
  account_name text,
  account_number_last4 text,
  is_default boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_method_id uuid;
  v_is_default boolean := coalesce(p_is_default, false);
begin
  if p_provider_id is null
    or p_method_type not in ('bank', 'gcash', 'paymaya')
    or nullif(btrim(p_account_label), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  if p_method_id is not null and exists (
    select 1
    from payment.provider_payout_methods m
    where m.id = p_method_id
      and m.provider_id = p_provider_id
  ) then
    v_method_id := p_method_id;
  else
    v_method_id := gen_random_uuid();
    v_is_default := true;
  end if;

  if v_is_default then
    update payment.provider_payout_methods m
    set is_default = false,
        updated_at = now()
    where m.provider_id = p_provider_id;
  end if;

  insert into payment.provider_payout_methods (
    id,
    provider_id,
    method_type,
    account_label,
    account_name,
    account_number_last4,
    is_default
  )
  values (
    v_method_id,
    p_provider_id,
    p_method_type,
    btrim(p_account_label),
    nullif(btrim(coalesce(p_account_name, '')), ''),
    nullif(btrim(coalesce(p_account_number_last4, '')), ''),
    v_is_default
  )
  on conflict (id) do update set
    method_type = excluded.method_type,
    account_label = excluded.account_label,
    account_name = excluded.account_name,
    account_number_last4 = excluded.account_number_last4,
    is_default = excluded.is_default,
    updated_at = now();

  return query
  select *
  from public.servease_list_provider_payout_methods(p_provider_id)
  where servease_list_provider_payout_methods.id = v_method_id;
end;
$$;

create or replace function public.servease_get_provider_payout_account(
  p_provider_id uuid
)
returns table (
  available_balance numeric,
  pending_balance numeric,
  total_paid_out numeric,
  next_payout_date text
)
language sql
security definer
set search_path = payment, public
as $$
  with payment_totals as (
    select
      coalesce(sum(p.provider_payout) filter (where p.status = 'paid'), 0) as paid_earnings,
      coalesce(sum(p.provider_payout) filter (where p.status = 'pending'), 0) as pending_earnings
    from payment.payments p
    where p.provider_id = p_provider_id
  ),
  payout_totals as (
    select
      coalesce(sum(po.amount) filter (where po.status in ('requested', 'processing', 'paid')), 0) as reserved_or_paid,
      coalesce(sum(po.amount) filter (where po.status = 'paid'), 0) as paid_out
    from payment.provider_payouts po
    where po.provider_id = p_provider_id
  )
  select
    greatest(pt.paid_earnings - pot.reserved_or_paid, 0) as available_balance,
    pt.pending_earnings as pending_balance,
    pot.paid_out as total_paid_out,
    ((date_trunc('week', now() at time zone 'Asia/Manila') + interval '11 days')::date)::text as next_payout_date
  from payment_totals pt
  cross join payout_totals pot;
$$;

create or replace function public.servease_list_provider_payouts(
  p_provider_id uuid
)
returns table (
  id uuid,
  provider_id uuid,
  amount numeric,
  processing_fee numeric,
  net_amount numeric,
  status text,
  payout_method_id uuid,
  method_type text,
  account_label text,
  reference text,
  period_start timestamptz,
  period_end timestamptz,
  requested_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    p.id,
    p.provider_id,
    p.amount,
    coalesce(p.processing_fee, 0) as processing_fee,
    coalesce(p.net_amount, p.amount - coalesce(p.processing_fee, 0)) as net_amount,
    coalesce(p.status, 'requested') as status,
    p.payout_method_id,
    p.method_type,
    p.account_label,
    p.reference,
    p.period_start,
    p.period_end,
    p.requested_at,
    p.paid_at,
    p.created_at
  from payment.provider_payouts p
  where p.provider_id = p_provider_id
  order by p.created_at desc nulls last;
$$;

create or replace function public.servease_request_provider_payout(
  p_provider_id uuid,
  p_requested_by uuid,
  p_amount numeric,
  p_payout_method_id uuid,
  p_idempotency_key text default null
)
returns table (
  id uuid,
  provider_id uuid,
  amount numeric,
  processing_fee numeric,
  net_amount numeric,
  status text,
  payout_method_id uuid,
  method_type text,
  account_label text,
  reference text,
  period_start timestamptz,
  period_end timestamptz,
  requested_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_available numeric;
  v_method payment.provider_payout_methods%rowtype;
  v_existing_id uuid;
  v_payout_id uuid := gen_random_uuid();
  v_processing_fee numeric := round(p_amount * 0.025, 2);
begin
  if p_provider_id is null
    or p_requested_by is null
    or p_payout_method_id is null
    or p_amount is null
    or p_amount <= 0 then
    raise exception 'invalid_payment_request';
  end if;

  if nullif(btrim(coalesce(p_idempotency_key, '')), '') is not null then
    select p.id
      into v_existing_id
    from payment.provider_payouts p
    where p.provider_id = p_provider_id
      and p.idempotency_key = btrim(p_idempotency_key)
    limit 1;

    if v_existing_id is not null then
      return query
      select *
      from public.servease_list_provider_payouts(p_provider_id) lp
      where lp.id = v_existing_id;
      return;
    end if;
  end if;

  select *
    into v_method
  from payment.provider_payout_methods m
  where m.id = p_payout_method_id
    and m.provider_id = p_provider_id
  limit 1;

  if v_method.id is null then
    raise exception 'invalid_payment_request';
  end if;

  select a.available_balance
    into v_available
  from public.servease_get_provider_payout_account(p_provider_id) a
  limit 1;

  if coalesce(v_available, 0) < p_amount then
    raise exception 'insufficient_payout_balance';
  end if;

  insert into payment.provider_payouts (
    id,
    provider_id,
    amount,
    status,
    period_start,
    period_end,
    payout_method_id,
    method_type,
    account_label,
    processing_fee,
    net_amount,
    reference,
    requested_by,
    requested_at,
    idempotency_key
  )
  values (
    v_payout_id,
    p_provider_id,
    p_amount,
    'requested',
    now() - interval '30 days',
    now(),
    v_method.id,
    v_method.method_type,
    v_method.account_label,
    v_processing_fee,
    p_amount - v_processing_fee,
    'PO-' || upper(substr(replace(v_payout_id::text, '-', ''), 1, 10)),
    p_requested_by,
    now(),
    nullif(btrim(coalesce(p_idempotency_key, '')), '')
  );

  return query
  select *
  from public.servease_list_provider_payouts(p_provider_id) lp
  where lp.id = v_payout_id;
end;
$$;

create or replace function public.servease_seed_demo_payout_method(
  p_provider_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_method_id uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::uuid;
begin
  delete from payment.provider_payout_methods
  where provider_id = p_provider_id;

  insert into payment.provider_payout_methods (
    id,
    provider_id,
    method_type,
    account_label,
    account_name,
    account_number_last4,
    is_default
  )
  values (
    v_method_id,
    p_provider_id,
    'gcash',
    'GCash **** 1234',
    'Priya Demo Provider',
    '1234',
    true
  );

  return v_method_id;
end;
$$;

revoke all on function public.servease_list_provider_payout_methods(uuid) from public, anon, authenticated;
revoke all on function public.servease_upsert_provider_payout_method(uuid, uuid, text, text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.servease_get_provider_payout_account(uuid) from public, anon, authenticated;
revoke all on function public.servease_list_provider_payouts(uuid) from public, anon, authenticated;
revoke all on function public.servease_request_provider_payout(uuid, uuid, numeric, uuid, text) from public, anon, authenticated;
revoke all on function public.servease_seed_demo_payout_method(uuid) from public, anon, authenticated;

grant execute on function public.servease_list_provider_payout_methods(uuid) to service_role;
grant execute on function public.servease_upsert_provider_payout_method(uuid, uuid, text, text, text, text, boolean) to service_role;
grant execute on function public.servease_get_provider_payout_account(uuid) to service_role;
grant execute on function public.servease_list_provider_payouts(uuid) to service_role;
grant execute on function public.servease_request_provider_payout(uuid, uuid, numeric, uuid, text) to service_role;
grant execute on function public.servease_seed_demo_payout_method(uuid) to service_role;
