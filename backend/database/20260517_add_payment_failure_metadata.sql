-- Add failure metadata columns to payments + dedicated RPC functions for
-- admin "Failed Payments" workflow (failure reason, gateway code, retry
-- history, dispute linkage, retry attempt).

alter table payment.payments
  add column if not exists failure_reason text,
  add column if not exists failure_code text,
  add column if not exists retry_count integer not null default 0,
  add column if not exists last_retry_at timestamptz,
  add column if not exists dispute_id uuid;

create index if not exists payments_failure_status_idx
  on payment.payments(status)
  where status in ('cancelled', 'refunded');

drop function if exists public.servease_admin_list_payments(text);
drop function if exists public.servease_admin_update_payment_status(uuid, text);

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
  dispute_id uuid
)
language sql
security definer
set search_path = payment, public
as $$
  select
    p.id, p.booking_id, p.customer_id, p.provider_id,
    p.amount, p.platform_fee, p.provider_payout,
    p.status, p.payment_method, p.paid_at, p.created_at,
    p.failure_reason, p.failure_code, p.retry_count, p.last_retry_at, p.dispute_id
  from payment.payments p
  where p_status is null or p.status = p_status
  order by p.created_at desc nulls last
  limit 200;
$$;

create function public.servease_admin_update_payment_status(
  p_payment_id uuid,
  p_status text
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
begin
  if p_payment_id is null
    or p_status not in ('pending', 'paid', 'cancelled', 'refunded') then
    raise exception 'invalid_payment_request';
  end if;

  return query
    update payment.payments p
    set
      status = p_status,
      paid_at = case
        when p_status = 'paid' then coalesce(p.paid_at, now())
        else p.paid_at
      end
    where p.id = p_payment_id
    returning
      p.id, p.booking_id, p.customer_id, p.provider_id,
      p.amount, p.platform_fee, p.provider_payout,
      p.status, p.payment_method, p.paid_at, p.created_at,
      p.failure_reason, p.failure_code, p.retry_count, p.last_retry_at, p.dispute_id;
end;
$$;

create or replace function public.servease_admin_record_payment_failure(
  p_payment_id uuid,
  p_failure_reason text,
  p_failure_code text default null,
  p_dispute_id uuid default null
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
begin
  if p_payment_id is null then
    raise exception 'invalid_payment_request';
  end if;

  return query
    update payment.payments p
    set
      failure_reason = coalesce(p_failure_reason, p.failure_reason),
      failure_code = coalesce(p_failure_code, p.failure_code),
      dispute_id = coalesce(p_dispute_id, p.dispute_id)
    where p.id = p_payment_id
    returning
      p.id, p.booking_id, p.customer_id, p.provider_id,
      p.amount, p.platform_fee, p.provider_payout,
      p.status, p.payment_method, p.paid_at, p.created_at,
      p.failure_reason, p.failure_code, p.retry_count, p.last_retry_at, p.dispute_id;
end;
$$;

create or replace function public.servease_admin_retry_payment(
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
  dispute_id uuid
)
language plpgsql
security definer
set search_path = payment, public
as $$
begin
  if p_payment_id is null then
    raise exception 'invalid_payment_request';
  end if;

  return query
    update payment.payments p
    set
      retry_count = coalesce(p.retry_count, 0) + 1,
      last_retry_at = now(),
      status = 'pending',
      paid_at = null
    where p.id = p_payment_id
    returning
      p.id, p.booking_id, p.customer_id, p.provider_id,
      p.amount, p.platform_fee, p.provider_payout,
      p.status, p.payment_method, p.paid_at, p.created_at,
      p.failure_reason, p.failure_code, p.retry_count, p.last_retry_at, p.dispute_id;
end;
$$;

revoke all on function public.servease_admin_list_payments(text) from public, anon, authenticated;
revoke all on function public.servease_admin_update_payment_status(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_admin_record_payment_failure(uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_retry_payment(uuid) from public, anon, authenticated;

grant execute on function public.servease_admin_list_payments(text) to service_role;
grant execute on function public.servease_admin_update_payment_status(uuid, text) to service_role;
grant execute on function public.servease_admin_record_payment_failure(uuid, text, text, uuid) to service_role;
grant execute on function public.servease_admin_retry_payment(uuid) to service_role;
