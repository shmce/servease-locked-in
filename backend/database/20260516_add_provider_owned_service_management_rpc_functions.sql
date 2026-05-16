create or replace function public.servease_list_provider_owned_services(p_user_id uuid)
returns table (
  id uuid,
  provider_id uuid,
  provider_business_name text,
  service_id uuid,
  title text,
  description text,
  price numeric,
  pricing_mode text,
  average_rating numeric,
  review_count integer,
  verification_status text,
  is_active boolean
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    ps.id,
    ps.provider_id,
    pp.business_name as provider_business_name,
    ps.service_id,
    ps.title,
    ps.description,
    ps.price,
    coalesce(ps.pricing_mode, 'flat') as pricing_mode,
    coalesce(pp.average_rating, 0) as average_rating,
    coalesce(pp.review_count, 0) as review_count,
    coalesce(pp.verification_status, 'pending') as verification_status,
    coalesce(ps.is_active, true) as is_active
  from provider_catalog.provider_services ps
  join provider_catalog.provider_profiles pp
    on pp.id = ps.provider_id
  where pp.user_id = p_user_id
  order by coalesce(ps.is_active, true) desc, ps.title;
$$;

create or replace function public.servease_replace_provider_owned_services(
  p_user_id uuid,
  p_services jsonb
)
returns table (
  id uuid,
  provider_id uuid,
  provider_business_name text,
  service_id uuid,
  title text,
  description text,
  price numeric,
  pricing_mode text,
  average_rating numeric,
  review_count integer,
  verification_status text,
  is_active boolean
)
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
declare
  v_provider_id uuid;
  v_seen_ids uuid[] := array[]::uuid[];
  v_item jsonb;
  v_service_id uuid;
  v_service_row_id uuid;
  v_title text;
  v_description text;
  v_price numeric;
  v_pricing_mode text;
  v_is_active boolean;
begin
  if jsonb_typeof(coalesce(p_services, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_provider_service_request';
  end if;

  select pp.id
    into v_provider_id
  from provider_catalog.provider_profiles pp
  where pp.user_id = p_user_id
  limit 1;

  if v_provider_id is null then
    raise exception 'provider_profile_not_found';
  end if;

  for v_item in
    select value from jsonb_array_elements(coalesce(p_services, '[]'::jsonb))
  loop
    v_title := nullif(btrim(v_item ->> 'title'), '');
    v_description := nullif(btrim(coalesce(v_item ->> 'description', '')), '');
    v_pricing_mode := coalesce(nullif(v_item ->> 'pricingMode', ''), 'flat');
    v_is_active := coalesce((v_item ->> 'isActive')::boolean, true);
    v_price := nullif(v_item ->> 'price', '')::numeric;

    if v_title is null or v_pricing_mode not in ('flat', 'hourly') then
      raise exception 'invalid_provider_service_request';
    end if;

    if v_price is not null and v_price < 0 then
      raise exception 'invalid_provider_service_request';
    end if;

    v_service_id := case
      when coalesce(v_item ->> 'serviceId', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then (v_item ->> 'serviceId')::uuid
      else null
    end;

    if coalesce(v_item ->> 'id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      and exists (
        select 1
        from provider_catalog.provider_services ps
        where ps.id = (v_item ->> 'id')::uuid
          and ps.provider_id = v_provider_id
      )
    then
      v_service_row_id := (v_item ->> 'id')::uuid;
    else
      v_service_row_id := gen_random_uuid();
    end if;

    insert into provider_catalog.provider_services (
      id,
      provider_id,
      service_id,
      title,
      description,
      price,
      pricing_mode,
      hourly_rate,
      flat_rate,
      is_active
    )
    values (
      v_service_row_id,
      v_provider_id,
      v_service_id,
      v_title,
      v_description,
      v_price,
      v_pricing_mode,
      case when v_pricing_mode = 'hourly' then v_price else null end,
      case when v_pricing_mode = 'flat' then v_price else null end,
      v_is_active
    )
    on conflict (id) do update set
      service_id = excluded.service_id,
      title = excluded.title,
      description = excluded.description,
      price = excluded.price,
      pricing_mode = excluded.pricing_mode,
      hourly_rate = excluded.hourly_rate,
      flat_rate = excluded.flat_rate,
      is_active = excluded.is_active;

    v_seen_ids := array_append(v_seen_ids, v_service_row_id);
  end loop;

  update provider_catalog.provider_services ps
  set is_active = false
  where ps.provider_id = v_provider_id
    and ps.id <> all(v_seen_ids);

  return query
  select *
  from public.servease_list_provider_owned_services(p_user_id);
end;
$$;

revoke all on function public.servease_list_provider_owned_services(uuid) from public, anon, authenticated;
revoke all on function public.servease_replace_provider_owned_services(uuid, jsonb) from public, anon, authenticated;

grant execute on function public.servease_list_provider_owned_services(uuid) to service_role;
grant execute on function public.servease_replace_provider_owned_services(uuid, jsonb) to service_role;
