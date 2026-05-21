drop function if exists public.servease_list_visible_payments(uuid, uuid);

create or replace function public.servease_list_visible_payments(
  p_customer_id uuid default null,
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
    c.checkout_id as apicenter_checkout_id,
    c.status as apicenter_checkout_status,
    c.provider as apicenter_provider,
    c.provider_mode as apicenter_provider_mode
  from payment.payments p
  left join lateral (
    select
      s.checkout_id,
      s.status,
      s.provider,
      s.provider_mode
    from payment.apicenter_checkout_sessions s
    where s.payment_id = p.id
    order by s.updated_at desc nulls last, s.created_at desc nulls last
    limit 1
  ) c on true
  where (p_customer_id is not null and p.customer_id = p_customer_id)
     or (p_provider_id is not null and p.provider_id = p_provider_id)
  order by p.created_at desc nulls last
  limit 50;
$$;

revoke all on function public.servease_list_visible_payments(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.servease_list_visible_payments(uuid, uuid)
  to service_role;
