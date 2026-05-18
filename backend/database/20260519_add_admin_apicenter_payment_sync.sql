drop function if exists public.servease_admin_list_payments(text);
drop function if exists public.servease_admin_get_payment(uuid);
drop function if exists public.servease_admin_get_apicenter_checkout_for_payment(uuid);

create function public.servease_admin_list_payments(
  p_status text default null
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
  dispute_id uuid,
  apicenter_checkout_id text,
  apicenter_checkout_status text,
  apicenter_provider text,
  apicenter_provider_mode text
)
language sql
security definer
set search_path = payment, public
as $$
  select
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
    p.dispute_id,
    c.checkout_id,
    c.status,
    c.provider,
    c.provider_mode
  from payment.payments p
  left join lateral (
    select
      checkout_id,
      status,
      provider,
      provider_mode
    from payment.apicenter_checkout_sessions
    where payment_id = p.id
    order by updated_at desc nulls last, created_at desc nulls last
    limit 1
  ) c on true
  where p_status is null or p.status = p_status
  order by p.created_at desc nulls last
  limit 200;
$$;

create function public.servease_admin_get_payment(
  p_payment_id uuid
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
  dispute_id uuid,
  apicenter_checkout_id text,
  apicenter_checkout_status text,
  apicenter_provider text,
  apicenter_provider_mode text
)
language sql
security definer
set search_path = payment, public
as $$
  select
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
    p.dispute_id,
    c.checkout_id,
    c.status,
    c.provider,
    c.provider_mode
  from payment.payments p
  left join lateral (
    select
      checkout_id,
      status,
      provider,
      provider_mode
    from payment.apicenter_checkout_sessions
    where payment_id = p.id
    order by updated_at desc nulls last, created_at desc nulls last
    limit 1
  ) c on true
  where p.id = p_payment_id
  limit 1;
$$;

create function public.servease_admin_get_apicenter_checkout_for_payment(
  p_payment_id uuid
)
returns table (
  checkout_id text
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_checkout_id text;
begin
  if p_payment_id is null then
    raise exception 'invalid_payment_request';
  end if;

  select c.checkout_id
    into v_checkout_id
  from payment.apicenter_checkout_sessions c
  where c.payment_id = p_payment_id
  order by c.updated_at desc nulls last, c.created_at desc nulls last
  limit 1;

  if v_checkout_id is null then
    raise exception 'payment_not_found';
  end if;

  return query select v_checkout_id;
end;
$$;

revoke all on function public.servease_admin_list_payments(text)
  from public, anon, authenticated;
revoke all on function public.servease_admin_get_payment(uuid)
  from public, anon, authenticated;
revoke all on function public.servease_admin_get_apicenter_checkout_for_payment(uuid)
  from public, anon, authenticated;

grant execute on function public.servease_admin_list_payments(text)
  to service_role;
grant execute on function public.servease_admin_get_payment(uuid)
  to service_role;
grant execute on function public.servease_admin_get_apicenter_checkout_for_payment(uuid)
  to service_role;
