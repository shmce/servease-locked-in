-- Owner: User Service / Admin Service
-- Purpose: Back admin user listing, status changes, and admin access roles.

create schema if not exists admin;

create table if not exists admin.admin_user_access (
  admin_user_id uuid primary key,
  access_role text not null default 'super-admin',
  require_two_factor boolean not null default false,
  invitation_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_user_access_role_check
    check (access_role in (
      'super-admin',
      'finance-manager',
      'operations-manager',
      'customer-support',
      'content-moderator'
    ))
);

alter table admin.admin_user_access enable row level security;

drop policy if exists admin_user_access_service_role_all
  on admin.admin_user_access;

create policy admin_user_access_service_role_all
  on admin.admin_user_access
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.servease_admin_users_summary()
returns jsonb
language sql
security definer
set search_path = identity_and_user, public
as $$
  with counts as (
    select
      count(*)::integer as total_count,
      count(*) filter (where u.created_at >= now() - interval '30 days')::integer as recent_count,
      count(*) filter (
        where date_trunc('month', u.created_at) = date_trunc('month', now())
      )::integer as new_this_month,
      count(*) filter (where u.role = 'customer')::integer as customers,
      count(*) filter (where u.role = 'provider')::integer as providers,
      count(*) filter (where u.role = 'admin')::integer as admins,
      count(*) filter (where u.status = 'active')::integer as active,
      count(*) filter (where u.status = 'suspended')::integer as suspended,
      count(*) filter (where u.status = 'inactive')::integer as inactive
    from identity_and_user.users u
  )
  select jsonb_build_object(
    'totalCount', total_count,
    'byRole', jsonb_build_object(
      'customer', customers,
      'provider', providers,
      'admin', admins
    ),
    'byStatus', jsonb_build_object(
      'active', active,
      'suspended', suspended,
      'inactive', inactive
    ),
    'recentCount', recent_count,
    'newThisMonth', new_this_month
  )
  from counts;
$$;

create or replace function public.servease_admin_list_users(
  p_role text default null,
  p_status text default null,
  p_query text default null,
  p_limit integer default 200
)
returns table (
  id uuid,
  email text,
  full_name text,
  contact_number text,
  role text,
  status text,
  created_at timestamptz
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
    u.created_at
  from identity_and_user.users u
  where (p_role is null or u.role = p_role)
    and (p_status is null or u.status = p_status)
    and (
      nullif(trim(coalesce(p_query, '')), '') is null
      or u.id::text ilike '%' || trim(p_query) || '%'
      or coalesce(u.email, '') ilike '%' || trim(p_query) || '%'
      or coalesce(u.full_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(u.contact_number, '') ilike '%' || trim(p_query) || '%'
    )
  order by u.created_at desc nulls last, u.email asc
  limit least(greatest(coalesce(p_limit, 200), 1), 500);
$$;

create or replace function public.servease_admin_update_user_status(
  p_user_id uuid,
  p_status text
)
returns table (
  id uuid,
  email text,
  full_name text,
  contact_number text,
  role text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  if p_user_id is null or p_status not in ('active', 'suspended', 'inactive') then
    raise exception 'invalid_user_request';
  end if;

  return query
    update identity_and_user.users u
    set status = p_status
    where u.id = p_user_id
    returning
      u.id,
      u.email,
      u.full_name,
      u.contact_number,
      u.role,
      u.status,
      u.created_at;
end;
$$;

create or replace function public.servease_admin_upsert_user_access(
  p_admin_user_id uuid,
  p_access_role text,
  p_require_two_factor boolean default false,
  p_invitation_sent boolean default false
)
returns table (
  admin_user_id uuid,
  access_role text,
  require_two_factor boolean,
  invitation_sent boolean
)
language plpgsql
security definer
set search_path = admin, public
as $$
declare
  v_access_role text := coalesce(nullif(trim(p_access_role), ''), 'super-admin');
begin
  if p_admin_user_id is null
    or v_access_role not in (
      'super-admin',
      'finance-manager',
      'operations-manager',
      'customer-support',
      'content-moderator'
    )
  then
    raise exception 'invalid_admin_user_access_request';
  end if;

  return query
    insert into admin.admin_user_access (
      admin_user_id,
      access_role,
      require_two_factor,
      invitation_sent,
      updated_at
    )
    values (
      p_admin_user_id,
      v_access_role,
      coalesce(p_require_two_factor, false),
      coalesce(p_invitation_sent, false),
      now()
    )
    on conflict (admin_user_id) do update
      set access_role = excluded.access_role,
          require_two_factor = excluded.require_two_factor,
          invitation_sent = excluded.invitation_sent,
          updated_at = now()
    returning
      admin_user_access.admin_user_id,
      admin_user_access.access_role,
      admin_user_access.require_two_factor,
      admin_user_access.invitation_sent;
end;
$$;

create or replace function public.servease_admin_list_user_access(
  p_admin_user_ids uuid[] default null
)
returns table (
  admin_user_id uuid,
  access_role text,
  require_two_factor boolean,
  invitation_sent boolean
)
language sql
security definer
set search_path = admin, public
as $$
  select
    a.admin_user_id,
    a.access_role,
    a.require_two_factor,
    a.invitation_sent
  from admin.admin_user_access a
  where p_admin_user_ids is null or a.admin_user_id = any(p_admin_user_ids);
$$;

revoke all on table admin.admin_user_access from public, anon, authenticated;

revoke all on function public.servease_admin_users_summary()
  from public, anon, authenticated;
revoke all on function public.servease_admin_list_users(text, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.servease_admin_update_user_status(uuid, text)
  from public, anon, authenticated;
revoke all on function public.servease_admin_upsert_user_access(uuid, text, boolean, boolean)
  from public, anon, authenticated;
revoke all on function public.servease_admin_list_user_access(uuid[])
  from public, anon, authenticated;

grant execute on function public.servease_admin_users_summary()
  to service_role;
grant execute on function public.servease_admin_list_users(text, text, text, integer)
  to service_role;
grant execute on function public.servease_admin_update_user_status(uuid, text)
  to service_role;
grant execute on function public.servease_admin_upsert_user_access(uuid, text, boolean, boolean)
  to service_role;
grant execute on function public.servease_admin_list_user_access(uuid[])
  to service_role;
