create or replace function public.servease_get_internal_user_summary(
  p_user_id uuid
)
returns table (
  id uuid,
  email text,
  full_name text,
  contact_number text,
  role text,
  status text,
  avatar_url text,
  avatar_storage_path text
)
language sql
security definer
set search_path = identity_and_user, public
as $$
  select
    u.id,
    u.email,
    u.full_name,
    u.contact_number,
    u.role,
    u.status,
    u.avatar_url,
    u.avatar_storage_path
  from identity_and_user.users u
  where u.id = p_user_id
  limit 1;
$$;

revoke all on function public.servease_get_internal_user_summary(uuid)
  from public, anon, authenticated;

grant execute on function public.servease_get_internal_user_summary(uuid)
  to service_role;

create index if not exists service_categories_mobile_active_sort_idx
  on provider_catalog.service_categories (sort_order, name)
  where coalesce(is_active, true) = true;

create index if not exists services_mobile_active_category_name_idx
  on provider_catalog.services (category_id, name)
  where coalesce(is_active, true) = true;

create index if not exists provider_services_mobile_active_lookup_idx
  on provider_catalog.provider_services (service_id, provider_id, title)
  where coalesce(is_active, true) = true;

create index if not exists provider_profiles_mobile_approved_rating_idx
  on provider_catalog.provider_profiles (
    verification_status,
    average_rating desc,
    id
  )
  where coalesce(is_active, true) = true;

create or replace function public.servease_list_catalog_categories_mobile(
  p_limit integer default 20
)
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
  order by coalesce(c.sort_order, 0), c.name
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

create or replace function public.servease_list_catalog_services_mobile(
  p_category_id uuid default null,
  p_limit integer default 75
)
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
  order by s.name
  limit greatest(1, least(coalesce(p_limit, 75), 100));
$$;

create or replace function public.servease_list_provider_service_listings_mobile(
  p_service_id uuid default null,
  p_provider_id uuid default null,
  p_limit integer default 50
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
  join provider_catalog.provider_profiles pp
    on pp.id = ps.provider_id
  where coalesce(ps.is_active, true) = true
    and coalesce(pp.is_active, true) = true
    and coalesce(pp.verification_status, 'pending') = 'approved'
    and (p_service_id is null or ps.service_id = p_service_id)
    and (p_provider_id is null or ps.provider_id = p_provider_id)
  order by coalesce(pp.average_rating, 0) desc, ps.title
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

revoke all on function public.servease_list_catalog_categories_mobile(integer)
  from public, anon, authenticated;
revoke all on function public.servease_list_catalog_services_mobile(uuid, integer)
  from public, anon, authenticated;
revoke all on function public.servease_list_provider_service_listings_mobile(uuid, uuid, integer)
  from public, anon, authenticated;

grant execute on function public.servease_list_catalog_categories_mobile(integer)
  to service_role;
grant execute on function public.servease_list_catalog_services_mobile(uuid, integer)
  to service_role;
grant execute on function public.servease_list_provider_service_listings_mobile(uuid, uuid, integer)
  to service_role;

create index if not exists bookings_mobile_customer_list_idx
  on booking.bookings (customer_id, created_at desc, scheduled_at desc);

create index if not exists bookings_mobile_provider_list_idx
  on booking.bookings (provider_id, created_at desc, scheduled_at desc);

create index if not exists booking_timeline_mobile_booking_created_idx
  on booking.booking_timeline_events (booking_id, created_at);

create index if not exists booking_service_updates_mobile_booking_created_idx
  on booking.booking_service_updates (booking_id, created_at desc);

create index if not exists notifications_mobile_user_created_idx
  on notification_and_support.notifications (user_id, created_at desc);

create index if not exists notifications_mobile_user_unread_idx
  on notification_and_support.notifications (user_id, created_at desc)
  where coalesce(is_read, false) = false;

create or replace function public.servease_list_notifications_mobile(
  p_user_id uuid,
  p_limit integer default 30
)
returns table (
  id uuid,
  user_id uuid,
  type text,
  title text,
  body text,
  is_read boolean,
  metadata jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = notification_and_support, public
as $$
  select
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.body,
    n.is_read,
    n.metadata,
    n.created_at
  from notification_and_support.notifications n
  where n.user_id = p_user_id
  order by n.created_at desc nulls last
  limit greatest(1, least(coalesce(p_limit, 30), 50));
$$;

revoke all on function public.servease_list_notifications_mobile(uuid, integer)
  from public, anon, authenticated;

grant execute on function public.servease_list_notifications_mobile(uuid, integer)
  to service_role;

create or replace function public.servease_list_customer_addresses_mobile(
  p_user_id uuid,
  p_limit integer default 20
)
returns table (
  id uuid,
  user_id uuid,
  label text,
  address text,
  barangay text,
  city text,
  province text,
  region text,
  latitude double precision,
  longitude double precision,
  is_default boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = identity_and_user, public
as $$
  select
    ua.id,
    ua.user_id,
    coalesce(nullif(trim(ua.label), ''), 'Saved address') as label,
    ua.address,
    ua.barangay,
    ua.city,
    ua.province,
    ua.region,
    ua.latitude,
    ua.longitude,
    coalesce(ua.is_default, false) as is_default,
    ua.created_at,
    ua.updated_at
  from identity_and_user.user_addresses ua
  where ua.user_id = p_user_id
    and nullif(trim(ua.address), '') is not null
  order by coalesce(ua.is_default, false) desc, ua.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

revoke all on function public.servease_list_customer_addresses_mobile(uuid, integer)
  from public, anon, authenticated;

grant execute on function public.servease_list_customer_addresses_mobile(uuid, integer)
  to service_role;
