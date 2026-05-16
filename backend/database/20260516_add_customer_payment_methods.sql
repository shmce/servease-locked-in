-- Owner: Payment Service
-- Purpose: Store customer payment method display metadata for mobile without storing sensitive payment credentials.

create table if not exists payment.customer_payment_methods (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null,
  method_type text not null,
  label text not null,
  brand text,
  last4 text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint customer_payment_methods_type_check
    check (method_type in ('cash_on_service', 'card', 'gcash', 'paymaya')),
  constraint customer_payment_methods_last4_check
    check (last4 is null or last4 ~ '^[0-9]{1,4}$')
);

alter table payment.customer_payment_methods enable row level security;

drop policy if exists customer_payment_methods_service_role_all
  on payment.customer_payment_methods;

create policy customer_payment_methods_service_role_all
  on payment.customer_payment_methods
  for all
  to service_role
  using (true)
  with check (true);

create unique index if not exists customer_payment_methods_one_default_idx
  on payment.customer_payment_methods (customer_id)
  where is_default = true and deleted_at is null;

create unique index if not exists customer_payment_methods_one_cash_idx
  on payment.customer_payment_methods (customer_id)
  where method_type = 'cash_on_service' and deleted_at is null;

create index if not exists customer_payment_methods_customer_created_idx
  on payment.customer_payment_methods (customer_id, created_at desc)
  where deleted_at is null;

create or replace function public.servease_ensure_cash_payment_method(
  p_customer_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_method_id uuid;
begin
  if p_customer_id is null then
    raise exception 'invalid_payment_request';
  end if;

  select m.id
    into v_method_id
  from payment.customer_payment_methods m
  where m.customer_id = p_customer_id
    and m.method_type = 'cash_on_service'
    and m.deleted_at is null
  limit 1;

  if v_method_id is null then
    insert into payment.customer_payment_methods (
      customer_id,
      method_type,
      label,
      brand,
      is_default
    )
    values (
      p_customer_id,
      'cash_on_service',
      'Cash on service',
      'Cash',
      not exists (
        select 1
        from payment.customer_payment_methods existing
        where existing.customer_id = p_customer_id
          and existing.deleted_at is null
      )
    )
    returning id into v_method_id;
  end if;

  if not exists (
    select 1
    from payment.customer_payment_methods m
    where m.customer_id = p_customer_id
      and m.is_default = true
      and m.deleted_at is null
  ) then
    update payment.customer_payment_methods m
    set is_default = true,
        updated_at = now()
    where m.id = v_method_id;
  end if;

  return v_method_id;
end;
$$;

create or replace function public.servease_list_customer_payment_methods(
  p_customer_id uuid
)
returns table (
  id uuid,
  customer_id uuid,
  method_type text,
  label text,
  brand text,
  last4 text,
  is_default boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
begin
  perform public.servease_ensure_cash_payment_method(p_customer_id);

  return query
    select
      m.id,
      m.customer_id,
      m.method_type,
      m.label,
      m.brand,
      m.last4,
      m.is_default,
      m.created_at
    from payment.customer_payment_methods m
    where m.customer_id = p_customer_id
      and m.deleted_at is null
    order by m.is_default desc, m.created_at desc;
end;
$$;

create or replace function public.servease_upsert_customer_payment_method(
  p_customer_id uuid,
  p_method_id uuid default null,
  p_method_type text default 'cash_on_service',
  p_label text default '',
  p_brand text default null,
  p_last4 text default null,
  p_is_default boolean default false
)
returns table (
  id uuid,
  customer_id uuid,
  method_type text,
  label text,
  brand text,
  last4 text,
  is_default boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_method_id uuid;
  v_is_default boolean := coalesce(p_is_default, false);
  v_label text := nullif(btrim(coalesce(p_label, '')), '');
  v_last4 text := nullif(btrim(coalesce(p_last4, '')), '');
begin
  if p_customer_id is null
    or p_method_type not in ('cash_on_service', 'card', 'gcash', 'paymaya')
    or v_label is null
    or (v_last4 is not null and v_last4 !~ '^[0-9]{1,4}$') then
    raise exception 'invalid_payment_request';
  end if;

  perform public.servease_ensure_cash_payment_method(p_customer_id);

  if p_method_type = 'cash_on_service' then
    select m.id
      into v_method_id
    from payment.customer_payment_methods m
    where m.customer_id = p_customer_id
      and m.method_type = 'cash_on_service'
      and m.deleted_at is null
    limit 1;
  elsif p_method_id is not null and exists (
    select 1
    from payment.customer_payment_methods m
    where m.id = p_method_id
      and m.customer_id = p_customer_id
      and m.deleted_at is null
  ) then
    v_method_id := p_method_id;
  else
    v_method_id := gen_random_uuid();
  end if;

  if v_is_default then
    update payment.customer_payment_methods m
    set is_default = false,
        updated_at = now()
    where m.customer_id = p_customer_id
      and m.deleted_at is null;
  end if;

  insert into payment.customer_payment_methods (
    id,
    customer_id,
    method_type,
    label,
    brand,
    last4,
    is_default
  )
  values (
    v_method_id,
    p_customer_id,
    p_method_type,
    v_label,
    nullif(btrim(coalesce(p_brand, '')), ''),
    v_last4,
    v_is_default
  )
  on conflict on constraint customer_payment_methods_pkey do update set
    method_type = excluded.method_type,
    label = excluded.label,
    brand = excluded.brand,
    last4 = excluded.last4,
    is_default = excluded.is_default,
    updated_at = now(),
    deleted_at = null;

  return query
    select *
    from public.servease_list_customer_payment_methods(p_customer_id) m
    where m.id = v_method_id;
end;
$$;

create or replace function public.servease_delete_customer_payment_method(
  p_customer_id uuid,
  p_method_id uuid
)
returns table (
  id uuid,
  customer_id uuid,
  method_type text,
  label text,
  brand text,
  last4 text,
  is_default boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_method payment.customer_payment_methods%rowtype;
  v_cash_id uuid;
begin
  if p_customer_id is null or p_method_id is null then
    raise exception 'invalid_payment_request';
  end if;

  perform public.servease_ensure_cash_payment_method(p_customer_id);

  select *
    into v_method
  from payment.customer_payment_methods m
  where m.id = p_method_id
    and m.customer_id = p_customer_id
    and m.deleted_at is null
  limit 1;

  if v_method.id is null then
    raise exception 'payment_not_found';
  end if;

  if v_method.method_type = 'cash_on_service' then
    raise exception 'invalid_payment_request';
  end if;

  update payment.customer_payment_methods m
  set deleted_at = now(),
      is_default = false,
      updated_at = now()
  where m.id = p_method_id
    and m.customer_id = p_customer_id;

  if v_method.is_default then
    select public.servease_ensure_cash_payment_method(p_customer_id)
      into v_cash_id;
    update payment.customer_payment_methods m
    set is_default = true,
        updated_at = now()
    where m.id = v_cash_id;
  end if;

  return query
    select
      v_method.id,
      v_method.customer_id,
      v_method.method_type,
      v_method.label,
      v_method.brand,
      v_method.last4,
      false,
      v_method.created_at;
end;
$$;

revoke all on function public.servease_ensure_cash_payment_method(uuid) from public, anon, authenticated;
revoke all on function public.servease_list_customer_payment_methods(uuid) from public, anon, authenticated;
revoke all on function public.servease_upsert_customer_payment_method(uuid, uuid, text, text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.servease_delete_customer_payment_method(uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_ensure_cash_payment_method(uuid) to service_role;
grant execute on function public.servease_list_customer_payment_methods(uuid) to service_role;
grant execute on function public.servease_upsert_customer_payment_method(uuid, uuid, text, text, text, text, boolean) to service_role;
grant execute on function public.servease_delete_customer_payment_method(uuid, uuid) to service_role;
