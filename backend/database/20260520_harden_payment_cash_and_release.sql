alter table payment.provider_payouts
  add column if not exists payment_id uuid references payment.payments(id) on delete set null;

create unique index if not exists provider_payouts_payment_id_key
  on payment.provider_payouts (payment_id)
  where payment_id is not null;

create or replace function public.servease_confirm_cash_on_service_payment(
  p_booking_id uuid,
  p_provider_id uuid default null
)
returns table (
  id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  amount numeric,
  platform_fee numeric,
  provider_payout numeric,
  status text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz,
  failure_reason text,
  failure_code text,
  retry_count integer,
  last_retry_at timestamptz,
  dispute_id uuid
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_payment payment.payments%rowtype;
begin
  if p_booking_id is null then
    raise exception 'invalid_payment_request';
  end if;

  select *
    into v_payment
  from payment.payments p
  where p.booking_id = p_booking_id
    and (p_provider_id is null or p.provider_id = p_provider_id)
  limit 1
  for update;

  if v_payment.id is null then
    raise exception 'payment_not_found';
  end if;

  if coalesce(v_payment.payment_method, '') <> 'cash_on_service'
    or v_payment.status in ('cancelled', 'refunded') then
    raise exception 'invalid_payment_request';
  end if;

  return query
    update payment.payments p
    set
      status = 'paid',
      paid_at = coalesce(p.paid_at, now())
    where p.id = v_payment.id
    returning
      p.id,
      p.booking_id,
      p.customer_id,
      p.provider_id,
      p.amount,
      p.platform_fee,
      p.provider_payout,
      p.status,
      p.payment_method,
      p.paid_at,
      p.created_at,
      p.failure_reason,
      p.failure_code,
      p.retry_count,
      p.last_retry_at,
      p.dispute_id;
end;
$$;

create or replace function public.servease_admin_release_payment_to_provider(
  p_payment_id uuid,
  p_admin_user_id uuid,
  p_note text default null
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
  v_payment payment.payments%rowtype;
  v_method payment.provider_payout_methods%rowtype;
  v_existing_id uuid;
  v_payout_id uuid := gen_random_uuid();
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
    0,
    v_payment.provider_payout,
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

revoke all on function public.servease_confirm_cash_on_service_payment(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.servease_admin_release_payment_to_provider(uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.servease_confirm_cash_on_service_payment(uuid, uuid)
  to service_role;
grant execute on function public.servease_admin_release_payment_to_provider(uuid, uuid, text)
  to service_role;
