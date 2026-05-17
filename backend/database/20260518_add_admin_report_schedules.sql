create schema if not exists admin;

create table if not exists admin.report_schedules (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  report_type text not null check (report_type in ('bookings', 'revenue', 'users', 'financial')),
  format text not null check (format in ('csv', 'pdf')),
  status text not null default 'scheduled' check (status in ('scheduled')),
  name text not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  recipients text[] not null,
  next_run_at timestamptz not null,
  download_path text not null,
  created_at timestamptz not null default now()
);

alter table admin.report_schedules enable row level security;

drop policy if exists report_schedules_service_role_all on admin.report_schedules;
create policy report_schedules_service_role_all
  on admin.report_schedules
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists admin_report_schedules_type_next_run_idx
  on admin.report_schedules (report_type, next_run_at);

create index if not exists admin_report_schedules_created_at_idx
  on admin.report_schedules (created_at desc);

create or replace function public.servease_admin_create_report_schedule(
  p_admin_user_id uuid,
  p_report_type text,
  p_format text,
  p_name text,
  p_frequency text,
  p_recipients text[],
  p_next_run_at timestamptz,
  p_download_path text
)
returns table (
  id uuid,
  admin_user_id uuid,
  report_type text,
  format text,
  status text,
  name text,
  frequency text,
  recipients text[],
  next_run_at timestamptz,
  created_at timestamptz,
  download_path text
)
language plpgsql
security definer
set search_path = admin, public
as $$
declare
  v_id uuid := gen_random_uuid();
  v_recipients text[] := (
    select array_agg(nullif(btrim(recipient), ''))
    from unnest(coalesce(p_recipients, array[]::text[])) recipient
    where nullif(btrim(recipient), '') is not null
      and recipient like '%@%'
  );
begin
  if p_admin_user_id is null
    or p_report_type not in ('bookings', 'revenue', 'users', 'financial')
    or p_format not in ('csv', 'pdf')
    or p_frequency not in ('daily', 'weekly', 'monthly')
    or nullif(btrim(p_name), '') is null
    or coalesce(array_length(v_recipients, 1), 0) = 0
    or p_next_run_at is null
    or nullif(btrim(p_download_path), '') is null then
    raise exception 'invalid_admin_report_schedule';
  end if;

  insert into admin.report_schedules (
    id,
    admin_user_id,
    report_type,
    format,
    status,
    name,
    frequency,
    recipients,
    next_run_at,
    download_path
  )
  values (
    v_id,
    p_admin_user_id,
    p_report_type,
    p_format,
    'scheduled',
    btrim(p_name),
    p_frequency,
    v_recipients,
    p_next_run_at,
    btrim(p_download_path)
  );

  return query
  select
    rs.id,
    rs.admin_user_id,
    rs.report_type,
    rs.format,
    rs.status,
    rs.name,
    rs.frequency,
    rs.recipients,
    rs.next_run_at,
    rs.created_at,
    rs.download_path
  from admin.report_schedules rs
  where rs.id = v_id;
end;
$$;

create or replace function public.servease_admin_list_report_schedules(
  p_report_type text default null,
  p_limit integer default 100
)
returns table (
  id uuid,
  admin_user_id uuid,
  report_type text,
  format text,
  status text,
  name text,
  frequency text,
  recipients text[],
  next_run_at timestamptz,
  created_at timestamptz,
  download_path text
)
language sql
security definer
set search_path = admin, public
as $$
  select
    rs.id,
    rs.admin_user_id,
    rs.report_type,
    rs.format,
    rs.status,
    rs.name,
    rs.frequency,
    rs.recipients,
    rs.next_run_at,
    rs.created_at,
    rs.download_path
  from admin.report_schedules rs
  where p_report_type is null or rs.report_type = p_report_type
  order by rs.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
$$;

revoke all on function public.servease_admin_create_report_schedule(uuid, text, text, text, text, text[], timestamptz, text) from public, anon, authenticated;
revoke all on function public.servease_admin_list_report_schedules(text, integer) from public, anon, authenticated;

grant execute on function public.servease_admin_create_report_schedule(uuid, text, text, text, text, text[], timestamptz, text) to service_role;
grant execute on function public.servease_admin_list_report_schedules(text, integer) to service_role;
