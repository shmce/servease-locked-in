alter table payment.provider_payouts
  drop constraint if exists provider_payouts_status_check;

alter table payment.provider_payouts
  alter column status set default 'requested';

alter table payment.provider_payouts
  add constraint provider_payouts_status_check
  check (status in ('requested', 'processing', 'paid', 'cancelled'));

create or replace function public.servease_admin_list_provider_payouts(
  p_status text default null
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
    coalesce(p.net_amount, p.amount) as net_amount,
    p.status,
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

create or replace function public.servease_admin_update_provider_payout_status(
  p_payout_id uuid,
  p_status text
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

revoke all on function public.servease_admin_list_provider_payouts(text) from public, anon, authenticated;
revoke all on function public.servease_admin_update_provider_payout_status(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_provider_payouts(text) to service_role;
grant execute on function public.servease_admin_update_provider_payout_status(uuid, text) to service_role;
