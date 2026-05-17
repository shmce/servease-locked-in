create table if not exists payment.apicenter_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payment.payments(id) on delete cascade,
  booking_id uuid not null,
  checkout_id text not null,
  provider text not null,
  provider_mode text,
  status text not null,
  reference_id text not null,
  redirect_url text,
  expires_at timestamptz,
  amount_value numeric,
  amount_currency text,
  currency text,
  payment_methods_allowed text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table payment.apicenter_checkout_sessions enable row level security;

create unique index if not exists apicenter_checkout_sessions_checkout_id_key
  on payment.apicenter_checkout_sessions (checkout_id);

create index if not exists apicenter_checkout_sessions_booking_created_idx
  on payment.apicenter_checkout_sessions (booking_id, created_at desc);

create index if not exists apicenter_checkout_sessions_payment_idx
  on payment.apicenter_checkout_sessions (payment_id);

create or replace function public.servease_record_apicenter_checkout(
  p_booking_id uuid,
  p_customer_id uuid,
  p_provider_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_checkout_id text,
  p_provider text,
  p_provider_mode text default null,
  p_checkout_status text default 'created',
  p_reference_id text default null,
  p_redirect_url text default null,
  p_expires_at timestamptz default null,
  p_amount_value numeric default null,
  p_amount_currency text default null,
  p_currency text default null,
  p_payment_methods_allowed text[] default '{}'::text[],
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  payment_id uuid,
  booking_id uuid,
  local_payment_status text,
  paid_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_commission_rate numeric;
  v_platform_fee numeric;
  v_provider_payout numeric;
  v_payment_id uuid;
  v_local_status text;
begin
  if p_booking_id is null
    or p_customer_id is null
    or p_provider_id is null
    or p_amount is null
    or p_amount <= 0
    or nullif(trim(p_payment_method), '') is null
    or nullif(trim(p_checkout_id), '') is null
    or nullif(trim(p_provider), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  v_local_status := case
    when p_checkout_status = 'paid' then 'paid'
    when p_checkout_status in ('refunded', 'partially_refunded') then 'refunded'
    when p_checkout_status in ('failed', 'cancelled', 'expired') then 'cancelled'
    else 'pending'
  end;

  select coalesce(pc.commission_rate, 15.00)
    into v_commission_rate
  from payment.platform_pricing_config pc
  order by pc.updated_at desc nulls last
  limit 1;

  v_commission_rate := coalesce(v_commission_rate, 15.00);
  v_platform_fee := round((p_amount * v_commission_rate) / 100, 2);
  v_provider_payout := p_amount - v_platform_fee;

  update payment.payments p
  set
    customer_id = p_customer_id,
    provider_id = p_provider_id,
    amount = p_amount,
    platform_fee = v_platform_fee,
    provider_payout = v_provider_payout,
    status = case
      when p.status = 'paid' and v_local_status = 'pending' then p.status
      else v_local_status
    end,
    paid_at = case
      when v_local_status = 'paid' then coalesce(p.paid_at, now())
      else p.paid_at
    end,
    payment_method = trim(p_payment_method)
  where p.booking_id = p_booking_id
  returning p.id into v_payment_id;

  if v_payment_id is null then
    begin
      insert into payment.payments (
        booking_id,
        customer_id,
        provider_id,
        amount,
        platform_fee,
        provider_payout,
        status,
        paid_at,
        payment_method
      )
      values (
        p_booking_id,
        p_customer_id,
        p_provider_id,
        p_amount,
        v_platform_fee,
        v_provider_payout,
        v_local_status,
        case when v_local_status = 'paid' then now() else null end,
        trim(p_payment_method)
      )
      returning payment.payments.id into v_payment_id;
    exception
      when unique_violation then
        update payment.payments p
        set
          customer_id = p_customer_id,
          provider_id = p_provider_id,
          amount = p_amount,
          platform_fee = v_platform_fee,
          provider_payout = v_provider_payout,
          status = case
            when p.status = 'paid' and v_local_status = 'pending' then p.status
            else v_local_status
          end,
          paid_at = case
            when v_local_status = 'paid' then coalesce(p.paid_at, now())
            else p.paid_at
          end,
          payment_method = trim(p_payment_method)
        where p.booking_id = p_booking_id
        returning p.id into v_payment_id;
    end;
  end if;

  insert into payment.apicenter_checkout_sessions (
    payment_id,
    booking_id,
    checkout_id,
    provider,
    provider_mode,
    status,
    reference_id,
    redirect_url,
    expires_at,
    amount_value,
    amount_currency,
    currency,
    payment_methods_allowed,
    metadata
  )
  values (
    v_payment_id,
    p_booking_id,
    trim(p_checkout_id),
    trim(p_provider),
    nullif(trim(coalesce(p_provider_mode, '')), ''),
    coalesce(nullif(trim(p_checkout_status), ''), 'created'),
    coalesce(nullif(trim(coalesce(p_reference_id, '')), ''), p_booking_id::text),
    nullif(trim(coalesce(p_redirect_url, '')), ''),
    p_expires_at,
    p_amount_value,
    nullif(trim(coalesce(p_amount_currency, '')), ''),
    nullif(trim(coalesce(p_currency, '')), ''),
    coalesce(p_payment_methods_allowed, '{}'::text[]),
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (checkout_id)
  do update set
    payment_id = excluded.payment_id,
    booking_id = excluded.booking_id,
    provider = excluded.provider,
    provider_mode = excluded.provider_mode,
    status = excluded.status,
    reference_id = excluded.reference_id,
    redirect_url = excluded.redirect_url,
    expires_at = excluded.expires_at,
    amount_value = excluded.amount_value,
    amount_currency = excluded.amount_currency,
    currency = excluded.currency,
    payment_methods_allowed = excluded.payment_methods_allowed,
    metadata = excluded.metadata,
    updated_at = now();

  return query
    select p.id, p.booking_id, p.status, p.paid_at
    from payment.payments p
    where p.id = v_payment_id
    limit 1;
end;
$$;

create or replace function public.servease_sync_apicenter_checkout_status(
  p_checkout_id text,
  p_checkout_status text,
  p_provider_mode text default null,
  p_reference_id text default null,
  p_redirect_url text default null,
  p_expires_at timestamptz default null,
  p_amount_value numeric default null,
  p_amount_currency text default null,
  p_currency text default null,
  p_payment_methods_allowed text[] default '{}'::text[],
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  payment_id uuid,
  booking_id uuid,
  local_payment_status text,
  paid_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_checkout payment.apicenter_checkout_sessions%rowtype;
  v_local_status text;
begin
  if nullif(trim(p_checkout_id), '') is null
    or nullif(trim(p_checkout_status), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  select *
    into v_checkout
  from payment.apicenter_checkout_sessions
  where checkout_id = trim(p_checkout_id)
  limit 1;

  if v_checkout.id is null then
    raise exception 'payment_not_found';
  end if;

  v_local_status := case
    when p_checkout_status = 'paid' then 'paid'
    when p_checkout_status in ('refunded', 'partially_refunded') then 'refunded'
    when p_checkout_status in ('failed', 'cancelled', 'expired') then 'cancelled'
    else 'pending'
  end;

  update payment.apicenter_checkout_sessions c
  set
    status = p_checkout_status,
    provider_mode = coalesce(nullif(trim(coalesce(p_provider_mode, '')), ''), c.provider_mode),
    reference_id = coalesce(nullif(trim(coalesce(p_reference_id, '')), ''), c.reference_id),
    redirect_url = coalesce(nullif(trim(coalesce(p_redirect_url, '')), ''), c.redirect_url),
    expires_at = coalesce(p_expires_at, c.expires_at),
    amount_value = coalesce(p_amount_value, c.amount_value),
    amount_currency = coalesce(nullif(trim(coalesce(p_amount_currency, '')), ''), c.amount_currency),
    currency = coalesce(nullif(trim(coalesce(p_currency, '')), ''), c.currency),
    payment_methods_allowed = case
      when coalesce(array_length(p_payment_methods_allowed, 1), 0) > 0 then p_payment_methods_allowed
      else c.payment_methods_allowed
    end,
    metadata = coalesce(p_metadata, c.metadata),
    updated_at = now()
  where c.id = v_checkout.id;

  return query
    update payment.payments p
    set
      status = case
        when p.status = 'paid' and v_local_status in ('pending', 'cancelled') then p.status
        else v_local_status
      end,
      paid_at = case
        when v_local_status = 'paid' then coalesce(p.paid_at, now())
        else p.paid_at
      end
    where p.id = v_checkout.payment_id
    returning p.id, p.booking_id, p.status, p.paid_at;
end;
$$;

revoke all on function public.servease_record_apicenter_checkout(uuid, uuid, uuid, numeric, text, text, text, text, text, text, text, timestamptz, numeric, text, text, text[], jsonb) from public, anon, authenticated;
revoke all on function public.servease_sync_apicenter_checkout_status(text, text, text, text, text, timestamptz, numeric, text, text, text[], jsonb) from public, anon, authenticated;

grant execute on function public.servease_record_apicenter_checkout(uuid, uuid, uuid, numeric, text, text, text, text, text, text, text, timestamptz, numeric, text, text, text[], jsonb) to service_role;
grant execute on function public.servease_sync_apicenter_checkout_status(text, text, text, text, text, timestamptz, numeric, text, text, text[], jsonb) to service_role;
