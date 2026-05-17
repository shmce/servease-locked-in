create schema if not exists admin;

create table if not exists admin.broadcasts (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  audience text not null check (audience in ('admins', 'all', 'customers', 'providers')),
  audience_cohort text,
  title text not null,
  message text not null,
  status text not null default 'sent' check (status in ('scheduled', 'sent', 'failed', 'cancelled')),
  scheduled_at timestamptz,
  repeat_rule text check (repeat_rule is null or repeat_rule in ('none', 'daily', 'weekly', 'monthly')),
  delivered_count integer not null default 0,
  failed_count integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table admin.broadcasts enable row level security;

drop policy if exists broadcasts_service_role_all on admin.broadcasts;
create policy broadcasts_service_role_all
  on admin.broadcasts
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists admin_broadcasts_created_at_idx
  on admin.broadcasts (created_at desc);

create or replace function public.servease_admin_create_broadcast(
  p_admin_user_id uuid,
  p_audience text,
  p_audience_cohort text,
  p_title text,
  p_message text,
  p_status text,
  p_scheduled_at timestamptz,
  p_repeat_rule text,
  p_delivered_count integer,
  p_failed_count integer
)
returns table (
  id uuid,
  admin_user_id uuid,
  audience text,
  audience_cohort text,
  title text,
  message text,
  status text,
  scheduled_at timestamptz,
  repeat_rule text,
  delivered_count integer,
  failed_count integer,
  sent_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = admin, public
as $$
declare
  v_id uuid := gen_random_uuid();
  v_status text := coalesce(p_status, 'sent');
begin
  if p_admin_user_id is null
    or p_audience not in ('admins', 'all', 'customers', 'providers')
    or nullif(btrim(p_title), '') is null
    or nullif(btrim(p_message), '') is null
    or v_status not in ('scheduled', 'sent', 'failed', 'cancelled')
    or (p_repeat_rule is not null and p_repeat_rule not in ('none', 'daily', 'weekly', 'monthly')) then
    raise exception 'invalid_admin_request';
  end if;

  insert into admin.broadcasts (
    id,
    admin_user_id,
    audience,
    audience_cohort,
    title,
    message,
    status,
    scheduled_at,
    repeat_rule,
    delivered_count,
    failed_count,
    sent_at
  )
  values (
    v_id,
    p_admin_user_id,
    p_audience,
    nullif(btrim(coalesce(p_audience_cohort, '')), ''),
    btrim(p_title),
    btrim(p_message),
    v_status,
    p_scheduled_at,
    coalesce(p_repeat_rule, 'none'),
    greatest(coalesce(p_delivered_count, 0), 0),
    greatest(coalesce(p_failed_count, 0), 0),
    case when v_status = 'sent' then now() else null end
  );

  return query
  select
    b.id,
    b.admin_user_id,
    b.audience,
    b.audience_cohort,
    b.title,
    b.message,
    b.status,
    b.scheduled_at,
    b.repeat_rule,
    b.delivered_count,
    b.failed_count,
    b.sent_at,
    b.created_at
  from admin.broadcasts b
  where b.id = v_id;
end;
$$;

create or replace function public.servease_admin_list_broadcasts(
  p_limit integer default 100
)
returns table (
  id uuid,
  admin_user_id uuid,
  audience text,
  audience_cohort text,
  title text,
  message text,
  status text,
  scheduled_at timestamptz,
  repeat_rule text,
  delivered_count integer,
  failed_count integer,
  sent_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = admin, public
as $$
  select
    b.id,
    b.admin_user_id,
    b.audience,
    b.audience_cohort,
    b.title,
    b.message,
    b.status,
    b.scheduled_at,
    b.repeat_rule,
    b.delivered_count,
    b.failed_count,
    b.sent_at,
    b.created_at
  from admin.broadcasts b
  order by b.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 500);
$$;

revoke all on function public.servease_admin_create_broadcast(uuid, text, text, text, text, text, timestamptz, text, integer, integer) from public, anon, authenticated;
revoke all on function public.servease_admin_list_broadcasts(integer) from public, anon, authenticated;

grant execute on function public.servease_admin_create_broadcast(uuid, text, text, text, text, text, timestamptz, text, integer, integer) to service_role;
grant execute on function public.servease_admin_list_broadcasts(integer) to service_role;
