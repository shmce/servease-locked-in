create or replace function public.servease_list_catalog_categories()
returns table (
  id uuid,
  name text,
  description text,
  icon text
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    c.id,
    c.name,
    c.description,
    c.icon
  from provider_catalog.service_categories c
  where coalesce(c.is_active, true) = true
  order by coalesce(c.sort_order, 0), c.name;
$$;

create or replace function public.servease_list_catalog_services(p_category_id uuid default null)
returns table (
  id uuid,
  category_id uuid,
  name text,
  description text,
  price numeric,
  pricing_mode text
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    s.id,
    s.category_id,
    s.name,
    s.description,
    s.price,
    s.pricing_mode
  from provider_catalog.services s
  where coalesce(s.is_active, true) = true
    and (p_category_id is null or s.category_id = p_category_id)
  order by s.name;
$$;

create or replace function public.servease_list_provider_service_listings(p_service_id uuid default null)
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
  verification_status text
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
    ps.pricing_mode,
    coalesce(pp.average_rating, 0) as average_rating,
    coalesce(pp.review_count, 0) as review_count,
    coalesce(pp.verification_status, 'pending') as verification_status
  from provider_catalog.provider_services ps
  left join provider_catalog.provider_profiles pp
    on pp.id = ps.provider_id
  where coalesce(ps.is_active, true) = true
    and coalesce(pp.is_active, true) = true
    and coalesce(pp.verification_status, 'pending') = 'approved'
    and (p_service_id is null or ps.service_id = p_service_id)
  order by coalesce(pp.average_rating, 0) desc, ps.title;
$$;

create or replace function public.servease_smoke_seed_catalog()
returns jsonb
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
declare
  v_category_id uuid := gen_random_uuid();
  v_service_id uuid := gen_random_uuid();
  v_provider_id uuid := gen_random_uuid();
  v_listing_id uuid := gen_random_uuid();
begin
  insert into provider_catalog.service_categories (
    id,
    name,
    description,
    icon,
    is_active,
    sort_order
  )
  values (
    v_category_id,
    'Smoke Cleaning',
    'Temporary smoke test category',
    'sparkles',
    true,
    1
  );

  insert into provider_catalog.services (
    id,
    category_id,
    name,
    description,
    price,
    pricing_mode,
    is_active
  )
  values (
    v_service_id,
    v_category_id,
    'Smoke Deep Clean',
    'Temporary smoke test service',
    1200,
    'flat',
    true
  );

  insert into provider_catalog.provider_profiles (
    id,
    user_id,
    business_name,
    bio,
    service_description,
    years_experience,
    service_area,
    verification_status,
    average_rating,
    review_count,
    is_active
  )
  values (
    v_provider_id,
    gen_random_uuid(),
    'Smoke Reliable Services',
    'Temporary smoke test provider',
    'Temporary smoke test services',
    3,
    'Local',
    'approved',
    4.8,
    12,
    true
  );

  insert into provider_catalog.provider_services (
    id,
    provider_id,
    service_id,
    title,
    description,
    price,
    pricing_mode,
    flat_rate,
    is_active
  )
  values (
    v_listing_id,
    v_provider_id,
    v_service_id,
    'Smoke Deep Clean Package',
    'Temporary smoke test listing',
    1500,
    'flat',
    1500,
    true
  );

  return jsonb_build_object(
    'categoryId', v_category_id,
    'serviceId', v_service_id,
    'providerId', v_provider_id,
    'listingId', v_listing_id
  );
end;
$$;

create or replace function public.servease_smoke_cleanup_catalog(
  p_category_id uuid,
  p_service_id uuid,
  p_provider_id uuid
)
returns void
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  delete from provider_catalog.provider_services
  where provider_id = p_provider_id
     or service_id = p_service_id;

  delete from provider_catalog.provider_profiles
  where id = p_provider_id;

  delete from provider_catalog.services
  where id = p_service_id;

  delete from provider_catalog.service_categories
  where id = p_category_id;
end;
$$;

revoke all on function public.servease_list_catalog_categories() from public, anon, authenticated;
revoke all on function public.servease_list_catalog_services(uuid) from public, anon, authenticated;
revoke all on function public.servease_list_provider_service_listings(uuid) from public, anon, authenticated;
revoke all on function public.servease_smoke_seed_catalog() from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_catalog(uuid, uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_list_catalog_categories() to service_role;
grant execute on function public.servease_list_catalog_services(uuid) to service_role;
grant execute on function public.servease_list_provider_service_listings(uuid) to service_role;
grant execute on function public.servease_smoke_seed_catalog() to service_role;
grant execute on function public.servease_smoke_cleanup_catalog(uuid, uuid, uuid) to service_role;
