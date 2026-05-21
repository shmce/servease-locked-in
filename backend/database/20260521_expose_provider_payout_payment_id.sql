drop function if exists public.servease_request_provider_payout(uuid, uuid, numeric, uuid, text);
drop function if exists public.servease_admin_release_payment_to_provider(uuid, uuid, text);
drop function if exists public.servease_admin_update_provider_payout_status(uuid, text);
drop function if exists public.servease_list_provider_payouts(uuid);
drop function if exists public.servease_admin_list_provider_payouts(text);

create or replace function public.servease_list_provider_payouts(
  p_provider_id uuid
)
returns table (
  id uuid,
  payment_id uuid,
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
    p.payment_id,
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

create or replace function public.servease_admin_list_provider_payouts(
  p_status text default null
)
returns table (
  id uuid,
  payment_id uuid,
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
    p.payment_id,
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
  where p_status is null
    or p.status = p_status
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
  payment_id uuid,
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
  v_processing_fee numeric;
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

  v_processing_fee := public.servease_provider_payout_processing_fee(
    v_method.method_type,
    p_amount
  );

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
    greatest(p_amount - v_processing_fee, 0),
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

create or replace function public.servease_admin_update_provider_payout_status(
  p_payout_id uuid,
  p_status text
)
returns table (
  id uuid,
  payment_id uuid,
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
begin
  if p_payout_id is null
    or p_status not in ('requested', 'processing', 'paid', 'cancelled') then
    raise exception 'invalid_payment_request';
  end if;

  update payment.provider_payouts p
  set status = p_status,
      paid_at = case
        when p_status = 'paid' then coalesce(p.paid_at, now())
        when p_status in ('requested', 'processing') then null
        else p.paid_at
      end
  where p.id = p_payout_id;

  if not found then
    raise exception 'payment_not_found';
  end if;

  return query
  select *
  from public.servease_admin_list_provider_payouts(null) p
  where p.id = p_payout_id;
end;
$$;

create or replace function public.servease_admin_release_payment_to_provider(
  p_payment_id uuid,
  p_admin_user_id uuid,
  p_note text default null
)
returns table (
  id uuid,
  payment_id uuid,
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
  v_payment payment.payments%rowtype;
  v_method payment.provider_payout_methods%rowtype;
  v_existing_id uuid;
  v_payout_id uuid := gen_random_uuid();
  v_processing_fee numeric;
begin
  if p_payment_id is null or p_admin_user_id is null then
    raise exception 'invalid_payment_request';
  end if;

  select *
    into v_payment
  from payment.payments p
  where p.id = p_payment_id
  limit 1
  for update;

  if v_payment.id is null then
    raise exception 'payment_not_found';
  end if;

  if v_payment.status <> 'paid'
    or v_payment.provider_id is null
    or coalesce(v_payment.provider_payout, 0) <= 0 then
    raise exception 'invalid_payment_request';
  end if;

  select p.id
    into v_existing_id
  from payment.provider_payouts p
  where p.payment_id = p_payment_id
  limit 1;

  if v_existing_id is not null then
    return query
      select *
      from public.servease_admin_list_provider_payouts(null) p
      where p.id = v_existing_id;
    return;
  end if;

  select *
    into v_method
  from payment.provider_payout_methods m
  where m.provider_id = v_payment.provider_id
  order by m.is_default desc, m.created_at desc
  limit 1;

  if v_method.id is null then
    raise exception 'invalid_payment_request';
  end if;

  v_processing_fee := public.servease_provider_payout_processing_fee(
    v_method.method_type,
    v_payment.provider_payout
  );

  insert into payment.provider_payouts (
    id,
    payment_id,
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
    v_payment.id,
    v_payment.provider_id,
    v_payment.provider_payout,
    'processing',
    coalesce(v_payment.paid_at, now()),
    now(),
    v_method.id,
    v_method.method_type,
    v_method.account_label,
    v_processing_fee,
    greatest(v_payment.provider_payout - v_processing_fee, 0),
    'PO-' || upper(substr(replace(v_payout_id::text, '-', ''), 1, 10)),
    p_admin_user_id,
    now(),
    'payment-release:' || v_payment.id::text
  );

  insert into payment.provider_payout_events (
    payout_id,
    event_type,
    status,
    note,
    admin_user_id
  )
  values (
    v_payout_id,
    'approved',
    'processing',
    coalesce(nullif(btrim(coalesce(p_note, '')), ''), 'Payment released by admin.'),
    p_admin_user_id
  );

  return query
    select *
    from public.servease_admin_list_provider_payouts(null) p
    where p.id = v_payout_id;
end;
$$;

revoke all on function public.servease_list_provider_payouts(uuid)
  from public, anon, authenticated;
revoke all on function public.servease_admin_list_provider_payouts(text)
  from public, anon, authenticated;
revoke all on function public.servease_request_provider_payout(uuid, uuid, numeric, uuid, text)
  from public, anon, authenticated;
revoke all on function public.servease_admin_update_provider_payout_status(uuid, text)
  from public, anon, authenticated;
revoke all on function public.servease_admin_release_payment_to_provider(uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.servease_list_provider_payouts(uuid)
  to service_role;
grant execute on function public.servease_admin_list_provider_payouts(text)
  to service_role;
grant execute on function public.servease_request_provider_payout(uuid, uuid, numeric, uuid, text)
  to service_role;
grant execute on function public.servease_admin_update_provider_payout_status(uuid, text)
  to service_role;
grant execute on function public.servease_admin_release_payment_to_provider(uuid, uuid, text)
  to service_role;
