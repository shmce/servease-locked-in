alter table admin.report_schedules
  add column if not exists last_delivered_at timestamptz,
  add column if not exists last_delivery_error text,
  add column if not exists delivery_count integer not null default 0;

create index if not exists admin_report_schedules_due_idx
  on admin.report_schedules (next_run_at)
  where status = 'scheduled';

drop function if exists public.servease_admin_create_report_schedule(uuid, text, text, text, text, text[], timestamptz, text);
drop function if exists public.servease_admin_list_report_schedules(text, integer);
drop function if exists public.servease_admin_list_due_report_schedules(timestamptz, integer);
drop function if exists public.servease_admin_mark_report_schedule_delivered(uuid, timestamptz);
drop function if exists public.servease_admin_mark_report_schedule_delivery_failed(uuid, text);

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
  download_path text,
  last_delivered_at timestamptz,
  last_delivery_error text,
  delivery_count integer
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
    rs.download_path,
    rs.last_delivered_at,
    rs.last_delivery_error,
    rs.delivery_count
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
  download_path text,
  last_delivered_at timestamptz,
  last_delivery_error text,
  delivery_count integer
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
    rs.download_path,
    rs.last_delivered_at,
    rs.last_delivery_error,
    rs.delivery_count
  from admin.report_schedules rs
  where p_report_type is null or rs.report_type = p_report_type
  order by rs.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
$$;

create or replace function public.servease_admin_list_due_report_schedules(
  p_now timestamptz default now(),
  p_limit integer default 25
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
  download_path text,
  last_delivered_at timestamptz,
  last_delivery_error text,
  delivery_count integer
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
    rs.download_path,
    rs.last_delivered_at,
    rs.last_delivery_error,
    rs.delivery_count
  from admin.report_schedules rs
  where rs.status = 'scheduled'
    and rs.next_run_at <= coalesce(p_now, now())
  order by rs.next_run_at asc
  limit least(greatest(coalesce(p_limit, 25), 1), 100);
$$;

create or replace function public.servease_admin_mark_report_schedule_delivered(
  p_schedule_id uuid,
  p_next_run_at timestamptz
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
  download_path text,
  last_delivered_at timestamptz,
  last_delivery_error text,
  delivery_count integer
)
language plpgsql
security definer
set search_path = admin, public
as $$
begin
  if p_schedule_id is null or p_next_run_at is null then
    raise exception 'invalid_admin_report_schedule_delivery';
  end if;

  update admin.report_schedules rs
  set
    next_run_at = p_next_run_at,
    last_delivered_at = now(),
    last_delivery_error = null,
    delivery_count = rs.delivery_count + 1
  where rs.id = p_schedule_id;

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
    rs.download_path,
    rs.last_delivered_at,
    rs.last_delivery_error,
    rs.delivery_count
  from admin.report_schedules rs
  where rs.id = p_schedule_id;
end;
$$;

create or replace function public.servease_admin_mark_report_schedule_delivery_failed(
  p_schedule_id uuid,
  p_error_message text
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
  download_path text,
  last_delivered_at timestamptz,
  last_delivery_error text,
  delivery_count integer
)
language plpgsql
security definer
set search_path = admin, public
as $$
begin
  if p_schedule_id is null then
    raise exception 'invalid_admin_report_schedule_delivery';
  end if;

  update admin.report_schedules rs
  set last_delivery_error = left(coalesce(p_error_message, 'Unknown error'), 1000)
  where rs.id = p_schedule_id;

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
    rs.download_path,
    rs.last_delivered_at,
    rs.last_delivery_error,
    rs.delivery_count
  from admin.report_schedules rs
  where rs.id = p_schedule_id;
end;
$$;

revoke all on function public.servease_admin_create_report_schedule(uuid, text, text, text, text, text[], timestamptz, text) from public, anon, authenticated;
revoke all on function public.servease_admin_list_report_schedules(text, integer) from public, anon, authenticated;
revoke all on function public.servease_admin_list_due_report_schedules(timestamptz, integer) from public, anon, authenticated;
revoke all on function public.servease_admin_mark_report_schedule_delivered(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.servease_admin_mark_report_schedule_delivery_failed(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_admin_create_report_schedule(uuid, text, text, text, text, text[], timestamptz, text) to service_role;
grant execute on function public.servease_admin_list_report_schedules(text, integer) to service_role;
grant execute on function public.servease_admin_list_due_report_schedules(timestamptz, integer) to service_role;
grant execute on function public.servease_admin_mark_report_schedule_delivered(uuid, timestamptz) to service_role;
grant execute on function public.servease_admin_mark_report_schedule_delivery_failed(uuid, text) to service_role;
