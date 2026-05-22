create table if not exists identity_and_user.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references identity_and_user.users(id) on delete cascade,
  label text not null default 'Home',
  address text not null,
  barangay text,
  city text,
  province text,
  region text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table identity_and_user.user_addresses
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists label text not null default 'Home',
  add column if not exists address text,
  add column if not exists barangay text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists region text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists is_default boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists user_addresses_user_default_idx
  on identity_and_user.user_addresses (user_id, is_default desc, created_at desc);

create index if not exists user_addresses_user_created_idx
  on identity_and_user.user_addresses (user_id, created_at desc);

alter table identity_and_user.user_addresses enable row level security;

create or replace function public.servease_list_customer_addresses(p_user_id uuid)
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
  order by coalesce(ua.is_default, false) desc, ua.created_at desc;
$$;

create or replace function public.servease_create_customer_address(
  p_user_id uuid,
  p_label text,
  p_address text,
  p_barangay text default null,
  p_city text default null,
  p_province text default null,
  p_region text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_is_default boolean default false
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
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
declare
  v_address_id uuid;
  v_make_default boolean;
begin
  if nullif(trim(p_address), '') is null then
    raise exception 'invalid_customer_address_request';
  end if;

  if (p_latitude is null) <> (p_longitude is null) then
    raise exception 'invalid_customer_address_request';
  end if;

  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90) then
    raise exception 'invalid_customer_address_request';
  end if;

  if p_longitude is not null and (p_longitude < -180 or p_longitude > 180) then
    raise exception 'invalid_customer_address_request';
  end if;

  v_make_default := coalesce(p_is_default, false) or not exists (
    select 1 from identity_and_user.user_addresses ua where ua.user_id = p_user_id
  );

  if v_make_default then
    update identity_and_user.user_addresses ua
    set is_default = false,
        updated_at = now()
    where ua.user_id = p_user_id;
  end if;

  insert into identity_and_user.user_addresses (
    user_id,
    label,
    address,
    barangay,
    city,
    province,
    region,
    latitude,
    longitude,
    is_default
  )
  values (
    p_user_id,
    coalesce(nullif(trim(p_label), ''), 'Home'),
    nullif(trim(p_address), ''),
    nullif(trim(p_barangay), ''),
    nullif(trim(p_city), ''),
    nullif(trim(p_province), ''),
    nullif(trim(p_region), ''),
    p_latitude,
    p_longitude,
    v_make_default
  )
  returning user_addresses.id into v_address_id;

  if v_make_default then
    update identity_and_user.customer_profiles cp
    set address = nullif(trim(p_address), '')
    where cp.user_id = p_user_id;
  end if;

  return query
  select * from public.servease_list_customer_addresses(p_user_id) listed
  where listed.id = v_address_id;
end;
$$;

create or replace function public.servease_update_customer_address(
  p_user_id uuid,
  p_address_id uuid,
  p_label text default null,
  p_address text default null,
  p_barangay text default null,
  p_city text default null,
  p_province text default null,
  p_region text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_is_default boolean default null
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
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
declare
  v_updated_address text;
begin
  if not exists (
    select 1
    from identity_and_user.user_addresses ua
    where ua.id = p_address_id
      and ua.user_id = p_user_id
  ) then
    raise exception 'customer_address_not_found';
  end if;

  if p_address is not null and nullif(trim(p_address), '') is null then
    raise exception 'invalid_customer_address_request';
  end if;

  if (p_latitude is null) <> (p_longitude is null) then
    raise exception 'invalid_customer_address_request';
  end if;

  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90) then
    raise exception 'invalid_customer_address_request';
  end if;

  if p_longitude is not null and (p_longitude < -180 or p_longitude > 180) then
    raise exception 'invalid_customer_address_request';
  end if;

  if coalesce(p_is_default, false) then
    update identity_and_user.user_addresses ua
    set is_default = false,
        updated_at = now()
    where ua.user_id = p_user_id
      and ua.id <> p_address_id;
  end if;

  update identity_and_user.user_addresses ua
  set
    label = coalesce(nullif(trim(p_label), ''), ua.label),
    address = coalesce(nullif(trim(p_address), ''), ua.address),
    barangay = coalesce(nullif(trim(p_barangay), ''), ua.barangay),
    city = coalesce(nullif(trim(p_city), ''), ua.city),
    province = coalesce(nullif(trim(p_province), ''), ua.province),
    region = coalesce(nullif(trim(p_region), ''), ua.region),
    latitude = coalesce(p_latitude, ua.latitude),
    longitude = coalesce(p_longitude, ua.longitude),
    is_default = case
      when p_is_default is null then ua.is_default
      else p_is_default
    end,
    updated_at = now()
  where ua.id = p_address_id
    and ua.user_id = p_user_id
  returning ua.address into v_updated_address;

  if coalesce(p_is_default, false) then
    update identity_and_user.customer_profiles cp
    set address = v_updated_address
    where cp.user_id = p_user_id;
  end if;

  return query
  select * from public.servease_list_customer_addresses(p_user_id) listed
  where listed.id = p_address_id;
end;
$$;

create or replace function public.servease_set_default_customer_address(
  p_user_id uuid,
  p_address_id uuid
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
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
declare
  v_default_address text;
begin
  if not exists (
    select 1
    from identity_and_user.user_addresses ua
    where ua.id = p_address_id
      and ua.user_id = p_user_id
  ) then
    raise exception 'customer_address_not_found';
  end if;

  update identity_and_user.user_addresses ua
  set is_default = ua.id = p_address_id,
      updated_at = now()
  where ua.user_id = p_user_id;

  select ua.address
  into v_default_address
  from identity_and_user.user_addresses ua
  where ua.id = p_address_id;

  update identity_and_user.customer_profiles cp
  set address = v_default_address
  where cp.user_id = p_user_id;

  return query
  select * from public.servease_list_customer_addresses(p_user_id) listed
  where listed.id = p_address_id;
end;
$$;

create or replace function public.servease_delete_customer_address(
  p_user_id uuid,
  p_address_id uuid
)
returns void
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
declare
  v_was_default boolean;
  v_next_default_id uuid;
  v_next_default_address text;
begin
  select coalesce(ua.is_default, false)
  into v_was_default
  from identity_and_user.user_addresses ua
  where ua.id = p_address_id
    and ua.user_id = p_user_id;

  if v_was_default is null then
    raise exception 'customer_address_not_found';
  end if;

  delete from identity_and_user.user_addresses ua
  where ua.id = p_address_id
    and ua.user_id = p_user_id;

  if v_was_default then
    select ua.id, ua.address
    into v_next_default_id, v_next_default_address
    from identity_and_user.user_addresses ua
    where ua.user_id = p_user_id
    order by ua.created_at desc
    limit 1;

    if v_next_default_id is not null then
      update identity_and_user.user_addresses ua
      set is_default = ua.id = v_next_default_id,
          updated_at = now()
      where ua.user_id = p_user_id;
    end if;

    update identity_and_user.customer_profiles cp
    set address = v_next_default_address
    where cp.user_id = p_user_id;
  end if;
end;
$$;

revoke all on table identity_and_user.user_addresses from public, anon, authenticated;
revoke all on function public.servease_list_customer_addresses(uuid) from public, anon, authenticated;
revoke all on function public.servease_create_customer_address(uuid, text, text, text, text, text, text, double precision, double precision, boolean) from public, anon, authenticated;
revoke all on function public.servease_update_customer_address(uuid, uuid, text, text, text, text, text, text, double precision, double precision, boolean) from public, anon, authenticated;
revoke all on function public.servease_set_default_customer_address(uuid, uuid) from public, anon, authenticated;
revoke all on function public.servease_delete_customer_address(uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_list_customer_addresses(uuid) to service_role;
grant execute on function public.servease_create_customer_address(uuid, text, text, text, text, text, text, double precision, double precision, boolean) to service_role;
grant execute on function public.servease_update_customer_address(uuid, uuid, text, text, text, text, text, text, double precision, double precision, boolean) to service_role;
grant execute on function public.servease_set_default_customer_address(uuid, uuid) to service_role;
grant execute on function public.servease_delete_customer_address(uuid, uuid) to service_role;
