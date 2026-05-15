create or replace function public.servease_admin_list_payments(
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
  where p_status is null or p.status = p_status
  order by p.created_at desc nulls last
  limit 100;
$$;

create or replace function public.servease_admin_update_payment_status(
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
  created_at timestamptz
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
      p.created_at;
end;
$$;

revoke all on function public.servease_admin_list_payments(text) from public, anon, authenticated;
revoke all on function public.servease_admin_update_payment_status(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_payments(text) to service_role;
grant execute on function public.servease_admin_update_payment_status(uuid, text) to service_role;
