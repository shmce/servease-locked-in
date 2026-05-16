create or replace function public.servease_upsert_provider_payout_method(
  p_provider_id uuid,
  p_method_id uuid default null,
  p_method_type text default 'bank',
  p_account_label text default '',
  p_account_name text default null,
  p_account_number_last4 text default null,
  p_is_default boolean default false
)
returns table (
  id uuid,
  provider_id uuid,
  method_type text,
  account_label text,
  account_name text,
  account_number_last4 text,
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
begin
  if p_provider_id is null
    or p_method_type not in ('bank', 'gcash', 'paymaya')
    or nullif(btrim(p_account_label), '') is null then
    raise exception 'invalid_payment_request';
  end if;

  if p_method_id is not null and exists (
    select 1
    from payment.provider_payout_methods m
    where m.id = p_method_id
      and m.provider_id = p_provider_id
  ) then
    v_method_id := p_method_id;
  else
    v_method_id := gen_random_uuid();
    v_is_default := true;
  end if;

  if v_is_default then
    update payment.provider_payout_methods m
    set is_default = false,
        updated_at = now()
    where m.provider_id = p_provider_id;
  end if;

  insert into payment.provider_payout_methods (
    id,
    provider_id,
    method_type,
    account_label,
    account_name,
    account_number_last4,
    is_default
  )
  values (
    v_method_id,
    p_provider_id,
    p_method_type,
    btrim(p_account_label),
    nullif(btrim(coalesce(p_account_name, '')), ''),
    nullif(btrim(coalesce(p_account_number_last4, '')), ''),
    v_is_default
  )
  on conflict on constraint provider_payout_methods_pkey do update set
    method_type = excluded.method_type,
    account_label = excluded.account_label,
    account_name = excluded.account_name,
    account_number_last4 = excluded.account_number_last4,
    is_default = excluded.is_default,
    updated_at = now();

  return query
  select *
  from public.servease_list_provider_payout_methods(p_provider_id) m
  where m.id = v_method_id;
end;
$$;

revoke all on function public.servease_upsert_provider_payout_method(uuid, uuid, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.servease_upsert_provider_payout_method(uuid, uuid, text, text, text, text, boolean) to service_role;
