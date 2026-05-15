create or replace function public.servease_create_payment(
  p_booking_id uuid,
  p_customer_id uuid,
  p_provider_id uuid,
  p_amount numeric,
  p_payment_method text
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
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_commission_rate numeric;
  v_platform_fee numeric;
  v_provider_payout numeric;
begin
  if p_booking_id is null
    or p_customer_id is null
    or p_provider_id is null
    or p_amount is null
    or p_amount <= 0
    or nullif(trim(p_payment_method), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  select coalesce(pc.commission_rate, 15.00)
    into v_commission_rate
  from payment.platform_pricing_config pc
  order by pc.updated_at desc nulls last
  limit 1;

  v_commission_rate := coalesce(v_commission_rate, 15.00);
  v_platform_fee := round((p_amount * v_commission_rate) / 100, 2);
  v_provider_payout := p_amount - v_platform_fee;

  insert into payment.payments (
    booking_id,
    customer_id,
    provider_id,
    amount,
    platform_fee,
    provider_payout,
    status,
    payment_method
  )
  values (
    p_booking_id,
    p_customer_id,
    p_provider_id,
    p_amount,
    v_platform_fee,
    v_provider_payout,
    'pending',
    trim(p_payment_method)
  )
  on conflict (booking_id)
  do update set
    customer_id = excluded.customer_id,
    provider_id = excluded.provider_id,
    amount = excluded.amount,
    platform_fee = excluded.platform_fee,
    provider_payout = excluded.provider_payout,
    payment_method = excluded.payment_method;

  return query
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
      p.created_at
    from payment.payments p
    where p.booking_id = p_booking_id
    limit 1;
end;
$$;

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
  created_at timestamptz
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
    p.created_at
  from payment.payments p
  where (p_customer_id is not null and p.customer_id = p_customer_id)
     or (p_provider_id is not null and p.provider_id = p_provider_id)
  order by p.created_at desc nulls last
  limit 50;
$$;

revoke all on function public.servease_create_payment(uuid, uuid, uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.servease_list_visible_payments(uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_create_payment(uuid, uuid, uuid, numeric, text) to service_role;
grant execute on function public.servease_list_visible_payments(uuid, uuid) to service_role;
