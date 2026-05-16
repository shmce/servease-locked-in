-- Owner: Catalog Service
-- Purpose: Expose provider profile applications and admin verification decisions.

create table if not exists provider_catalog.provider_application_decisions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_catalog.provider_profiles(id) on delete cascade,
  decided_by uuid not null,
  decision text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint provider_application_decisions_decision_check
    check (decision in ('approved', 'rejected'))
);

alter table provider_catalog.provider_application_decisions enable row level security;

drop policy if exists provider_application_decisions_service_role_all
  on provider_catalog.provider_application_decisions;

create policy provider_application_decisions_service_role_all
  on provider_catalog.provider_application_decisions
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists provider_application_decisions_provider_created_idx
  on provider_catalog.provider_application_decisions (provider_id, created_at desc);

create or replace function public.servease_admin_list_provider_applications(
  p_status text default null,
  p_query text default null,
  p_limit integer default 100
)
returns table (
  id uuid,
  application_reference text,
  user_id uuid,
  business_name text,
  service_area text,
  service_description text,
  years_experience integer,
  verification_status text,
  is_active boolean,
  average_rating numeric,
  review_count integer,
  service_count integer,
  document_count integer,
  pending_document_count integer,
  approved_document_count integer,
  rejected_document_count integer,
  latest_decision_reason text,
  latest_decision_at timestamptz,
  latest_decided_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pp.id,
    'PA-' || upper(left(replace(pp.id::text, '-', ''), 10)) as application_reference,
    pp.user_id,
    pp.business_name,
    pp.service_area,
    pp.service_description,
    pp.years_experience,
    coalesce(pp.verification_status, 'pending') as verification_status,
    coalesce(pp.is_active, true) as is_active,
    coalesce(pp.average_rating, 0) as average_rating,
    coalesce(pp.review_count, 0) as review_count,
    coalesce(services.service_count, 0)::integer as service_count,
    coalesce(documents.document_count, 0)::integer as document_count,
    coalesce(documents.pending_document_count, 0)::integer as pending_document_count,
    coalesce(documents.approved_document_count, 0)::integer as approved_document_count,
    coalesce(documents.rejected_document_count, 0)::integer as rejected_document_count,
    latest_decision.reason as latest_decision_reason,
    latest_decision.created_at as latest_decision_at,
    latest_decision.decided_by as latest_decided_by,
    pp.created_at,
    pp.updated_at
  from provider_catalog.provider_profiles pp
  left join lateral (
    select count(*) as service_count
    from provider_catalog.provider_services ps
    where ps.provider_id = pp.id
  ) services on true
  left join lateral (
    select
      count(*) as document_count,
      count(*) filter (where coalesce(pd.status, 'pending') = 'pending') as pending_document_count,
      count(*) filter (where pd.status = 'approved') as approved_document_count,
      count(*) filter (where pd.status = 'rejected') as rejected_document_count
    from provider_catalog.provider_documents pd
    where pd.user_id = pp.user_id
  ) documents on true
  left join lateral (
    select d.reason, d.created_at, d.decided_by
    from provider_catalog.provider_application_decisions d
    where d.provider_id = pp.id
    order by d.created_at desc
    limit 1
  ) latest_decision on true
  where (p_status is null or coalesce(pp.verification_status, 'pending') = p_status)
    and (
      nullif(trim(coalesce(p_query, '')), '') is null
      or pp.id::text ilike '%' || trim(p_query) || '%'
      or pp.user_id::text ilike '%' || trim(p_query) || '%'
      or coalesce(pp.business_name, '') ilike '%' || trim(p_query) || '%'
      or coalesce(pp.service_area, '') ilike '%' || trim(p_query) || '%'
    )
  order by
    case coalesce(pp.verification_status, 'pending')
      when 'pending' then 0
      when 'rejected' then 1
      else 2
    end,
    pp.created_at desc nulls last
  limit least(greatest(coalesce(p_limit, 100), 1), 200);
$$;

create or replace function public.servease_admin_get_provider_application(
  p_provider_id uuid
)
returns table (
  id uuid,
  application_reference text,
  user_id uuid,
  business_name text,
  service_area text,
  service_description text,
  years_experience integer,
  verification_status text,
  is_active boolean,
  average_rating numeric,
  review_count integer,
  service_count integer,
  document_count integer,
  pending_document_count integer,
  approved_document_count integer,
  rejected_document_count integer,
  latest_decision_reason text,
  latest_decision_at timestamptz,
  latest_decided_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select *
  from public.servease_admin_list_provider_applications(null, p_provider_id::text, 1) app
  where app.id = p_provider_id
  limit 1;
$$;

create or replace function public.servease_admin_decide_provider_application(
  p_provider_id uuid,
  p_admin_user_id uuid,
  p_decision text,
  p_reason text
)
returns table (
  id uuid,
  application_reference text,
  user_id uuid,
  business_name text,
  service_area text,
  service_description text,
  years_experience integer,
  verification_status text,
  is_active boolean,
  average_rating numeric,
  review_count integer,
  service_count integer,
  document_count integer,
  pending_document_count integer,
  approved_document_count integer,
  rejected_document_count integer,
  latest_decision_reason text,
  latest_decision_at timestamptz,
  latest_decided_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  if p_provider_id is null
    or p_admin_user_id is null
    or p_decision not in ('approved', 'rejected')
    or nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'invalid_provider_application_request';
  end if;

  if not exists (
    select 1
    from provider_catalog.provider_profiles pp
    where pp.id = p_provider_id
  ) then
    raise exception 'provider_application_not_found';
  end if;

  update provider_catalog.provider_profiles pp
  set verification_status = p_decision,
      is_active = p_decision = 'approved',
      updated_at = now()
  where pp.id = p_provider_id;

  insert into provider_catalog.provider_application_decisions (
    provider_id,
    decided_by,
    decision,
    reason
  )
  values (
    p_provider_id,
    p_admin_user_id,
    p_decision,
    trim(p_reason)
  );

  return query
    select * from public.servease_admin_get_provider_application(p_provider_id);
end;
$$;

revoke all on function public.servease_admin_list_provider_applications(text, text, integer) from public, anon, authenticated;
revoke all on function public.servease_admin_get_provider_application(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_decide_provider_application(uuid, uuid, text, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_provider_applications(text, text, integer) to service_role;
grant execute on function public.servease_admin_get_provider_application(uuid) to service_role;
grant execute on function public.servease_admin_decide_provider_application(uuid, uuid, text, text) to service_role;
