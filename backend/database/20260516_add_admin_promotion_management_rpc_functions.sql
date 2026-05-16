create or replace function public.servease_admin_list_promotions(
  p_status text default null
)
returns table (
  id uuid,
  code text,
  description text,
  discount_type text,
  discount_value numeric,
  max_discount_amount numeric,
  min_order_amount numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = payment, public
as $$
  select
    pc.id,
    pc.code,
    pc.description,
    pc.discount_type,
    pc.discount_value,
    pc.max_discount_amount,
    pc.min_order_amount,
    pc.starts_at,
    pc.ends_at,
    pc.is_active,
    case
      when pc.is_active = false then 'disabled'
      when pc.starts_at is not null and pc.starts_at > now() then 'scheduled'
      when pc.ends_at is not null and pc.ends_at < now() then 'expired'
      else 'active'
    end as status,
    pc.created_at
  from payment.promotion_codes pc
  where p_status is null
    or p_status = ''
    or case
      when pc.is_active = false then 'disabled'
      when pc.starts_at is not null and pc.starts_at > now() then 'scheduled'
      when pc.ends_at is not null and pc.ends_at < now() then 'expired'
      else 'active'
    end = p_status
  order by pc.created_at desc, pc.code asc;
$$;

create or replace function public.servease_admin_upsert_promotion(
  p_promotion_id uuid,
  p_code text,
  p_description text,
  p_discount_type text,
  p_discount_value numeric,
  p_max_discount_amount numeric,
  p_min_order_amount numeric,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_is_active boolean
)
returns table (
  id uuid,
  code text,
  description text,
  discount_type text,
  discount_value numeric,
  max_discount_amount numeric,
  min_order_amount numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_id uuid;
  v_code text := upper(trim(coalesce(p_code, '')));
begin
  if v_code = ''
    or p_discount_type not in ('percent', 'fixed')
    or p_discount_value is null
    or p_discount_value <= 0
    or coalesce(p_min_order_amount, 0) < 0
    or (p_starts_at is not null and p_ends_at is not null and p_ends_at < p_starts_at)
  then
    raise exception 'invalid_payment_request';
  end if;

  if p_promotion_id is null then
    insert into payment.promotion_codes (
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      starts_at,
      ends_at,
      is_active
    )
    values (
      v_code,
      nullif(trim(coalesce(p_description, '')), ''),
      p_discount_type,
      p_discount_value,
      p_max_discount_amount,
      coalesce(p_min_order_amount, 0),
      p_starts_at,
      p_ends_at,
      coalesce(p_is_active, true)
    )
    on conflict (code) do update set
      description = excluded.description,
      discount_type = excluded.discount_type,
      discount_value = excluded.discount_value,
      max_discount_amount = excluded.max_discount_amount,
      min_order_amount = excluded.min_order_amount,
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      is_active = excluded.is_active
    returning id into v_id;
  else
    update payment.promotion_codes pc
    set
      code = v_code,
      description = nullif(trim(coalesce(p_description, '')), ''),
      discount_type = p_discount_type,
      discount_value = p_discount_value,
      max_discount_amount = p_max_discount_amount,
      min_order_amount = coalesce(p_min_order_amount, 0),
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      is_active = coalesce(p_is_active, pc.is_active)
    where pc.id = p_promotion_id
    returning pc.id into v_id;

    if v_id is null then
      raise exception 'payment_not_found';
    end if;
  end if;

  return query
    select * from public.servease_admin_list_promotions(null) p
    where p.id = v_id;
end;
$$;

create or replace function public.servease_admin_delete_promotion(
  p_promotion_id uuid
)
returns table (
  id uuid,
  code text,
  description text,
  discount_type text,
  discount_value numeric,
  max_discount_amount numeric,
  min_order_amount numeric,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = payment, public
as $$
declare
  v_row payment.promotion_codes%rowtype;
begin
  delete from payment.promotion_codes pc
  where pc.id = p_promotion_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'payment_not_found';
  end if;

  return query
    select
      v_row.id,
      v_row.code,
      v_row.description,
      v_row.discount_type,
      v_row.discount_value,
      v_row.max_discount_amount,
      v_row.min_order_amount,
      v_row.starts_at,
      v_row.ends_at,
      v_row.is_active,
      'disabled'::text,
      v_row.created_at;
end;
$$;

revoke all on function public.servease_admin_list_promotions(text) from public, anon, authenticated;
revoke all on function public.servease_admin_upsert_promotion(uuid, text, text, text, numeric, numeric, numeric, timestamptz, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.servease_admin_delete_promotion(uuid) from public, anon, authenticated;

grant execute on function public.servease_admin_list_promotions(text) to service_role;
grant execute on function public.servease_admin_upsert_promotion(uuid, text, text, text, numeric, numeric, numeric, timestamptz, timestamptz, boolean) to service_role;
grant execute on function public.servease_admin_delete_promotion(uuid) to service_role;
