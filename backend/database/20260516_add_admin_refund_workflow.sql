create table if not exists payment.refund_requests (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payment.payments(id) on delete cascade,
  booking_id uuid not null,
  customer_id uuid,
  provider_id uuid,
  amount numeric not null default 0,
  reason text not null default 'Customer requested a refund.',
  status text not null default 'requested',
  requested_at timestamptz not null default now(),
  decided_by uuid,
  decision_reason text,
  decided_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table payment.refund_requests enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'refund_requests_payment_id_key'
      and conrelid = 'payment.refund_requests'::regclass
  ) then
    alter table payment.refund_requests
      add constraint refund_requests_payment_id_key unique (payment_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'refund_requests_status_check'
      and conrelid = 'payment.refund_requests'::regclass
  ) then
    alter table payment.refund_requests
      add constraint refund_requests_status_check
      check (status in ('requested', 'approved', 'processed', 'rejected'));
  end if;
end $$;

create index if not exists refund_requests_status_created_at_idx
  on payment.refund_requests (status, created_at desc);

create or replace function public.servease_admin_list_refund_requests(
  p_status text default null
)
returns table (
  id uuid,
  payment_id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  amount numeric,
  reason text,
  status text,
  requested_at timestamptz,
  decided_by uuid,
  decision_reason text,
  decided_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    rr.id,
    rr.payment_id,
    rr.booking_id,
    rr.customer_id,
    rr.provider_id,
    rr.amount,
    rr.reason,
    rr.status,
    rr.requested_at,
    rr.decided_by,
    rr.decision_reason,
    rr.decided_at,
    rr.processed_at,
    rr.created_at
  from payment.refund_requests rr
  where p_status is null
    or rr.status = p_status
  order by rr.created_at desc nulls last
  limit 100;
$$;

create or replace function public.servease_admin_decide_refund_request(
  p_refund_id uuid,
  p_admin_user_id uuid,
  p_status text,
  p_reason text default null
)
returns table (
  id uuid,
  payment_id uuid,
  booking_id uuid,
  customer_id uuid,
  provider_id uuid,
  amount numeric,
  reason text,
  status text,
  requested_at timestamptz,
  decided_by uuid,
  decision_reason text,
  decided_at timestamptz,
  processed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_payment_id uuid;
begin
  if p_refund_id is null
    or p_admin_user_id is null
    or p_status not in ('approved', 'processed', 'rejected') then
    raise exception 'invalid_payment_request';
  end if;

  if p_status = 'rejected' and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  select rr.payment_id
    into v_payment_id
  from payment.refund_requests rr
  where rr.id = p_refund_id;

  if v_payment_id is null then
    raise exception 'payment_not_found';
  end if;

  update payment.refund_requests rr
  set status = p_status,
      decided_by = p_admin_user_id,
      decision_reason = nullif(trim(coalesce(p_reason, '')), ''),
      decided_at = now(),
      processed_at = case
        when p_status = 'processed' then now()
        else rr.processed_at
      end
  where rr.id = p_refund_id;

  if p_status in ('approved', 'processed') then
    update payment.payments p
    set status = 'refunded'
    where p.id = v_payment_id;
  end if;

  return query
    select *
    from public.servease_admin_list_refund_requests(null) rr
    where rr.id = p_refund_id;
end;
$$;

create or replace function public.servease_seed_demo_refund_request(
  p_refund_id uuid,
  p_payment_id uuid,
  p_booking_id uuid,
  p_customer_id uuid,
  p_provider_id uuid,
  p_amount numeric,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = payment, public
as $$
begin
  insert into payment.refund_requests (
    id,
    payment_id,
    booking_id,
    customer_id,
    provider_id,
    amount,
    reason,
    status
  )
  values (
    p_refund_id,
    p_payment_id,
    p_booking_id,
    p_customer_id,
    p_provider_id,
    p_amount,
    p_reason,
    'requested'
  )
  on conflict (payment_id) do update
  set status = 'requested',
      reason = excluded.reason,
      decided_by = null,
      decision_reason = null,
      decided_at = null,
      processed_at = null;

  return p_refund_id;
end;
$$;

revoke all on function public.servease_admin_list_refund_requests(text) from public, anon, authenticated;
revoke all on function public.servease_admin_decide_refund_request(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.servease_seed_demo_refund_request(uuid, uuid, uuid, uuid, uuid, numeric, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_refund_requests(text) to service_role;
grant execute on function public.servease_admin_decide_refund_request(uuid, uuid, text, text) to service_role;
grant execute on function public.servease_seed_demo_refund_request(uuid, uuid, uuid, uuid, uuid, numeric, text) to service_role;
