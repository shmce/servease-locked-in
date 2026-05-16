-- Owner: Admin Service
-- Purpose: Store immutable audit records for admin-facing operations.

create schema if not exists admin;

create table if not exists admin.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  admin_email text,
  admin_name text,
  action text not null,
  action_type text not null,
  entity_type text not null,
  entity_id text,
  details text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_type_check
    check (action_type in ('create', 'update', 'delete', 'approve', 'reject', 'resolve', 'login', 'export', 'other')),
  constraint audit_logs_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

alter table admin.audit_logs enable row level security;

drop policy if exists audit_logs_service_role_all
  on admin.audit_logs;

create policy audit_logs_service_role_all
  on admin.audit_logs
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists audit_logs_created_at_idx
  on admin.audit_logs (created_at desc);

create index if not exists audit_logs_admin_created_idx
  on admin.audit_logs (admin_user_id, created_at desc);

create index if not exists audit_logs_entity_created_idx
  on admin.audit_logs (entity_type, created_at desc);

create or replace function public.servease_admin_create_audit_log(
  p_admin_user_id uuid,
  p_admin_email text,
  p_admin_name text,
  p_action text,
  p_action_type text,
  p_entity_type text,
  p_entity_id text,
  p_details text,
  p_ip_address text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  admin_user_id uuid,
  admin_email text,
  admin_name text,
  action text,
  action_type text,
  entity_type text,
  entity_id text,
  details text,
  ip_address text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = admin, public
as $$
begin
  if p_admin_user_id is null
    or nullif(trim(coalesce(p_action, '')), '') is null
    or p_action_type not in ('create', 'update', 'delete', 'approve', 'reject', 'resolve', 'login', 'export', 'other')
    or nullif(trim(coalesce(p_entity_type, '')), '') is null
    or jsonb_typeof(coalesce(p_metadata, '{}'::jsonb)) <> 'object'
  then
    raise exception 'invalid_admin_audit_log_request';
  end if;

  return query
    insert into admin.audit_logs (
      admin_user_id,
      admin_email,
      admin_name,
      action,
      action_type,
      entity_type,
      entity_id,
      details,
      ip_address,
      metadata
    )
    values (
      p_admin_user_id,
      nullif(trim(coalesce(p_admin_email, '')), ''),
      nullif(trim(coalesce(p_admin_name, '')), ''),
      trim(p_action),
      p_action_type,
      trim(p_entity_type),
      nullif(trim(coalesce(p_entity_id, '')), ''),
      nullif(trim(coalesce(p_details, '')), ''),
      nullif(trim(coalesce(p_ip_address, '')), ''),
      coalesce(p_metadata, '{}'::jsonb)
    )
    returning
      audit_logs.id,
      audit_logs.admin_user_id,
      audit_logs.admin_email,
      audit_logs.admin_name,
      audit_logs.action,
      audit_logs.action_type,
      audit_logs.entity_type,
      audit_logs.entity_id,
      audit_logs.details,
      audit_logs.ip_address,
      audit_logs.metadata,
      audit_logs.created_at;
end;
$$;

create or replace function public.servease_admin_list_audit_logs(
  p_admin_user_id uuid default null,
  p_action_type text default null,
  p_entity_type text default null,
  p_query text default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit integer default 100
)
returns table (
  id uuid,
  admin_user_id uuid,
  admin_email text,
  admin_name text,
  action text,
  action_type text,
  entity_type text,
  entity_id text,
  details text,
  ip_address text,
  metadata jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = admin, public
as $$
  select
    al.id,
    al.admin_user_id,
    al.admin_email,
    al.admin_name,
    al.action,
    al.action_type,
    al.entity_type,
    al.entity_id,
    al.details,
    al.ip_address,
    al.metadata,
    al.created_at
  from admin.audit_logs al
  where (p_admin_user_id is null or al.admin_user_id = p_admin_user_id)
    and (p_action_type is null or al.action_type = p_action_type)
    and (p_entity_type is null or al.entity_type = p_entity_type)
    and (p_from is null or al.created_at >= p_from)
    and (p_to is null or al.created_at <= p_to)
    and (
      nullif(trim(coalesce(p_query, '')), '') is null
      or al.id::text ilike '%' || trim(p_query) || '%'
      or coalesce(al.admin_email, '') ilike '%' || trim(p_query) || '%'
      or coalesce(al.admin_name, '') ilike '%' || trim(p_query) || '%'
      or al.action ilike '%' || trim(p_query) || '%'
      or al.entity_type ilike '%' || trim(p_query) || '%'
      or coalesce(al.entity_id, '') ilike '%' || trim(p_query) || '%'
      or coalesce(al.details, '') ilike '%' || trim(p_query) || '%'
      or coalesce(al.ip_address, '') ilike '%' || trim(p_query) || '%'
    )
  order by al.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
$$;

revoke all on function public.servease_admin_create_audit_log(uuid, text, text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.servease_admin_list_audit_logs(uuid, text, text, text, timestamptz, timestamptz, integer) from public, anon, authenticated;

grant execute on function public.servease_admin_create_audit_log(uuid, text, text, text, text, text, text, text, text, jsonb) to service_role;
grant execute on function public.servease_admin_list_audit_logs(uuid, text, text, text, timestamptz, timestamptz, integer) to service_role;
