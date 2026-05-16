create table if not exists payment.promotion_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null,
  discount_value numeric not null,
  max_discount_amount numeric,
  min_order_amount numeric not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  constraint promotion_codes_discount_type_check
    check (discount_type in ('percent', 'fixed')),
  constraint promotion_codes_discount_value_check
    check (discount_value > 0),
  constraint promotion_codes_min_order_amount_check
    check (min_order_amount >= 0)
);

alter table payment.promotion_codes enable row level security;

drop policy if exists promotion_codes_service_role_all
  on payment.promotion_codes;

create policy promotion_codes_service_role_all
  on payment.promotion_codes
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists promotion_codes_active_code_idx
  on payment.promotion_codes (upper(code), is_active);

insert into payment.promotion_codes (
  code,
  description,
  discount_type,
  discount_value,
  max_discount_amount,
  min_order_amount,
  is_active
)
values (
  'SERVEASE10',
  'Demo ten percent service discount.',
  'percent',
  10,
  300,
  500,
  true
)
on conflict (code) do update
set
  description = excluded.description,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  max_discount_amount = excluded.max_discount_amount,
  min_order_amount = excluded.min_order_amount,
  is_active = excluded.is_active;

create or replace function public.servease_validate_promotion(
  p_code text,
  p_amount numeric
)
returns table (
  code text,
  valid boolean,
  discount_amount numeric,
  final_amount numeric,
  message text
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_promo payment.promotion_codes%rowtype;
  v_discount numeric := 0;
  v_code text := upper(trim(coalesce(p_code, '')));
begin
  if p_amount is null or p_amount <= 0 or v_code = '' then
    raise exception 'invalid_payment_request';
  end if;

  select *
  into v_promo
  from payment.promotion_codes pc
  where upper(pc.code) = v_code
    and pc.is_active = true
    and (pc.starts_at is null or pc.starts_at <= now())
    and (pc.ends_at is null or pc.ends_at >= now())
  limit 1;

  if v_promo.id is null then
    return query select v_code, false, 0::numeric, p_amount, 'Promo code is not valid.';
    return;
  end if;

  if p_amount < v_promo.min_order_amount then
    return query
      select
        v_promo.code,
        false,
        0::numeric,
        p_amount,
        'Minimum order amount is ' || v_promo.min_order_amount::text || '.';
    return;
  end if;

  if v_promo.discount_type = 'percent' then
    v_discount := round(p_amount * (v_promo.discount_value / 100), 2);
  else
    v_discount := v_promo.discount_value;
  end if;

  if v_promo.max_discount_amount is not null then
    v_discount := least(v_discount, v_promo.max_discount_amount);
  end if;

  v_discount := least(v_discount, p_amount);

  return query
    select
      v_promo.code,
      true,
      v_discount,
      greatest(p_amount - v_discount, 0),
      coalesce(v_promo.description, 'Promo applied.');
end;
$$;

revoke all on function public.servease_validate_promotion(text, numeric) from public, anon, authenticated;

grant execute on function public.servease_validate_promotion(text, numeric) to service_role;
