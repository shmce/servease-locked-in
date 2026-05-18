-- Owner: Catalog Service
-- Purpose: Persist admin provider application review state and enforce approval readiness.

create table if not exists provider_catalog.provider_application_reviews (
  provider_id uuid primary key references provider_catalog.provider_profiles(id) on delete cascade,
  kyc_checklist jsonb not null default '[]'::jsonb,
  business_checklist jsonb not null default '[]'::jsonb,
  verification_records jsonb not null default '[]'::jsonb,
  ocr_data jsonb not null default '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

alter table provider_catalog.provider_application_reviews enable row level security;

drop policy if exists provider_application_reviews_service_role_all
  on provider_catalog.provider_application_reviews;

create policy provider_application_reviews_service_role_all
  on provider_catalog.provider_application_reviews
  for all
  to service_role
  using (true)
  with check (true);

create table if not exists provider_catalog.provider_application_review_notes (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references provider_catalog.provider_profiles(id) on delete cascade,
  admin_user_id uuid not null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table provider_catalog.provider_application_review_notes enable row level security;

drop policy if exists provider_application_review_notes_service_role_all
  on provider_catalog.provider_application_review_notes;

create policy provider_application_review_notes_service_role_all
  on provider_catalog.provider_application_review_notes
  for all
  to service_role
  using (true)
  with check (true);

create index if not exists provider_application_review_notes_provider_created_idx
  on provider_catalog.provider_application_review_notes (provider_id, created_at desc);

create or replace function public.servease_default_provider_application_kyc_checklist()
returns jsonb
language sql
stable
as $$
  select '[
    {"id":"identity","label":"Identity matches documents","checked":false},
    {"id":"nbi","label":"NBI verified","checked":false},
    {"id":"prc","label":"PRC verified","checked":false},
    {"id":"tin","label":"TIN verified","checked":false},
    {"id":"docs","label":"All required documents submitted","checked":false}
  ]'::jsonb;
$$;

create or replace function public.servease_default_provider_application_business_checklist()
returns jsonb
language sql
stable
as $$
  select '[
    {"id":"permit","label":"Business Permit","subtitle":"Uploaded and verified","checked":false},
    {"id":"contact","label":"Contact Person Details","subtitle":"Name, phone, email complete","checked":false},
    {"id":"valid-id","label":"Valid ID of Contact Person","subtitle":"Uploaded and verified","checked":false},
    {"id":"address","label":"Business Address","subtitle":"Physical location verified","checked":false}
  ]'::jsonb;
$$;

create or replace function public.servease_default_provider_application_verification_records()
returns jsonb
language sql
stable
as $$
  select '[
    {"id":"nbi","label":"NBI Clearance","status":"pending","reference":null,"checkedAt":null,"details":null},
    {"id":"prc","label":"PRC License","status":"pending","reference":null,"checkedAt":null,"details":null},
    {"id":"tin","label":"TIN/BIR Record","status":"pending","reference":null,"checkedAt":null,"details":null}
  ]'::jsonb;
$$;

create or replace function public.servease_provider_application_review_complete(
  p_kyc_checklist jsonb,
  p_business_checklist jsonb
)
returns boolean
language sql
stable
as $$
  select
    jsonb_typeof(coalesce(p_kyc_checklist, '[]'::jsonb)) = 'array'
    and jsonb_array_length(coalesce(p_kyc_checklist, '[]'::jsonb)) >= 5
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(p_kyc_checklist, '[]'::jsonb)) item
      where coalesce(item->>'checked', 'false') <> 'true'
    )
    and jsonb_typeof(coalesce(p_business_checklist, '[]'::jsonb)) = 'array'
    and jsonb_array_length(coalesce(p_business_checklist, '[]'::jsonb)) >= 4
    and not exists (
      select 1
      from jsonb_array_elements(coalesce(p_business_checklist, '[]'::jsonb)) item
      where coalesce(item->>'checked', 'false') <> 'true'
    );
$$;

create or replace function public.servease_admin_get_provider_application_review(
  p_provider_id uuid
)
returns table (
  application_id uuid,
  kyc_checklist jsonb,
  business_checklist jsonb,
  verification_records jsonb,
  ocr_data jsonb,
  notes jsonb,
  is_complete boolean,
  updated_by uuid,
  updated_at timestamptz
)
language sql
security definer
set search_path = provider_catalog, public
as $$
  select
    pp.id as application_id,
    coalesce(r.kyc_checklist, public.servease_default_provider_application_kyc_checklist()) as kyc_checklist,
    coalesce(r.business_checklist, public.servease_default_provider_application_business_checklist()) as business_checklist,
    coalesce(r.verification_records, public.servease_default_provider_application_verification_records()) as verification_records,
    coalesce(r.ocr_data, '{}'::jsonb) as ocr_data,
    coalesce(notes.items, '[]'::jsonb) as notes,
    public.servease_provider_application_review_complete(
      coalesce(r.kyc_checklist, public.servease_default_provider_application_kyc_checklist()),
      coalesce(r.business_checklist, public.servease_default_provider_application_business_checklist())
    ) as is_complete,
    r.updated_by,
    r.updated_at
  from provider_catalog.provider_profiles pp
  left join provider_catalog.provider_application_reviews r
    on r.provider_id = pp.id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', n.id,
        'adminUserId', n.admin_user_id,
        'note', n.note,
        'createdAt', n.created_at
      )
      order by n.created_at desc
    ) as items
    from provider_catalog.provider_application_review_notes n
    where n.provider_id = pp.id
  ) notes on true
  where pp.id = p_provider_id
  limit 1;
$$;

create or replace function public.servease_admin_update_provider_application_review(
  p_provider_id uuid,
  p_admin_user_id uuid,
  p_kyc_checklist jsonb,
  p_business_checklist jsonb,
  p_verification_records jsonb,
  p_ocr_data jsonb
)
returns table (
  application_id uuid,
  kyc_checklist jsonb,
  business_checklist jsonb,
  verification_records jsonb,
  ocr_data jsonb,
  notes jsonb,
  is_complete boolean,
  updated_by uuid,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  if p_provider_id is null
    or p_admin_user_id is null
    or not exists (
      select 1 from provider_catalog.provider_profiles pp where pp.id = p_provider_id
    )
    or jsonb_typeof(coalesce(p_kyc_checklist, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_business_checklist, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_verification_records, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_ocr_data, '{}'::jsonb)) <> 'object' then
    raise exception 'invalid_provider_application_review_request';
  end if;

  insert into provider_catalog.provider_application_reviews (
    provider_id,
    kyc_checklist,
    business_checklist,
    verification_records,
    ocr_data,
    updated_by,
    updated_at
  )
  values (
    p_provider_id,
    coalesce(p_kyc_checklist, public.servease_default_provider_application_kyc_checklist()),
    coalesce(p_business_checklist, public.servease_default_provider_application_business_checklist()),
    coalesce(p_verification_records, public.servease_default_provider_application_verification_records()),
    coalesce(p_ocr_data, '{}'::jsonb),
    p_admin_user_id,
    now()
  )
  on conflict (provider_id) do update
  set kyc_checklist = excluded.kyc_checklist,
      business_checklist = excluded.business_checklist,
      verification_records = excluded.verification_records,
      ocr_data = excluded.ocr_data,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at;

  return query
    select * from public.servease_admin_get_provider_application_review(p_provider_id);
end;
$$;

create or replace function public.servease_admin_add_provider_application_review_note(
  p_provider_id uuid,
  p_admin_user_id uuid,
  p_note text
)
returns table (
  application_id uuid,
  kyc_checklist jsonb,
  business_checklist jsonb,
  verification_records jsonb,
  ocr_data jsonb,
  notes jsonb,
  is_complete boolean,
  updated_by uuid,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = provider_catalog, public
as $$
begin
  if p_provider_id is null
    or p_admin_user_id is null
    or nullif(trim(coalesce(p_note, '')), '') is null
    or not exists (
      select 1 from provider_catalog.provider_profiles pp where pp.id = p_provider_id
    ) then
    raise exception 'invalid_provider_application_review_request';
  end if;

  insert into provider_catalog.provider_application_review_notes (
    provider_id,
    admin_user_id,
    note
  )
  values (
    p_provider_id,
    p_admin_user_id,
    trim(p_note)
  );

  return query
    select * from public.servease_admin_get_provider_application_review(p_provider_id);
end;
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

  if p_decision = 'approved'
    and not exists (
      select 1
      from public.servease_admin_get_provider_application_review(p_provider_id) review
      where review.is_complete
    ) then
    raise exception 'provider_application_review_incomplete';
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

revoke all on function public.servease_default_provider_application_kyc_checklist() from public, anon, authenticated;
revoke all on function public.servease_default_provider_application_business_checklist() from public, anon, authenticated;
revoke all on function public.servease_default_provider_application_verification_records() from public, anon, authenticated;
revoke all on function public.servease_provider_application_review_complete(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.servease_admin_get_provider_application_review(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_update_provider_application_review(uuid, uuid, jsonb, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.servease_admin_add_provider_application_review_note(uuid, uuid, text) from public, anon, authenticated;

grant execute on function public.servease_default_provider_application_kyc_checklist() to service_role;
grant execute on function public.servease_default_provider_application_business_checklist() to service_role;
grant execute on function public.servease_default_provider_application_verification_records() to service_role;
grant execute on function public.servease_provider_application_review_complete(jsonb, jsonb) to service_role;
grant execute on function public.servease_admin_get_provider_application_review(uuid) to service_role;
grant execute on function public.servease_admin_update_provider_application_review(uuid, uuid, jsonb, jsonb, jsonb, jsonb) to service_role;
grant execute on function public.servease_admin_add_provider_application_review_note(uuid, uuid, text) to service_role;
