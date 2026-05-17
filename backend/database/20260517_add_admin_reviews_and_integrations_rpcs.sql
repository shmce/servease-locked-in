-- Owner: Review Service + Admin Service
-- Purpose: PostgREST does not expose the `admin` or `trust_and_reputation`
-- schemas, so the review-service and admin-service repositories that used
-- `.schema('admin').from('integrations')` or
-- `.schema('trust_and_reputation').from('reviews')` returned
-- "Invalid schema". These RPCs are SECURITY DEFINER wrappers that move the
-- read/write logic into a function we can call from the public schema.

create or replace function public.servease_admin_list_reviews(
  p_provider_id uuid default null,
  p_flagged_only boolean default false,
  p_limit integer default 100
)
returns table (
  id uuid,
  booking_id uuid,
  provider_id uuid,
  reviewer_id uuid,
  reviewer_full_name text,
  rating integer,
  review_text text,
  is_flagged boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, trust_and_reputation, identity_and_user
as $$
begin
  return query
  select
    r.id,
    r.booking_id,
    r.provider_id,
    r.reviewer_id,
    u.full_name as reviewer_full_name,
    r.rating,
    r.review_text,
    coalesce(r.is_flagged, false) as is_flagged,
    r.created_at
  from trust_and_reputation.reviews r
  left join identity_and_user.users u on u.id = r.reviewer_id
  where (p_provider_id is null or r.provider_id = p_provider_id)
    and (p_flagged_only is not true or coalesce(r.is_flagged, false) = true)
  order by r.created_at desc nulls last
  limit greatest(1, least(coalesce(p_limit, 100), 500));
end;
$$;

revoke all on function public.servease_admin_list_reviews(uuid, boolean, integer) from public;
grant execute on function public.servease_admin_list_reviews(uuid, boolean, integer) to service_role;

create or replace function public.servease_admin_set_review_flagged(
  p_review_id uuid,
  p_is_flagged boolean
)
returns table (
  id uuid,
  booking_id uuid,
  provider_id uuid,
  reviewer_id uuid,
  reviewer_full_name text,
  rating integer,
  review_text text,
  is_flagged boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, trust_and_reputation, identity_and_user
as $$
begin
  return query
  with updated as (
    update trust_and_reputation.reviews r
    set is_flagged = coalesce(p_is_flagged, false)
    where r.id = p_review_id
    returning r.*
  )
  select
    u_r.id,
    u_r.booking_id,
    u_r.provider_id,
    u_r.reviewer_id,
    iu.full_name,
    u_r.rating,
    u_r.review_text,
    coalesce(u_r.is_flagged, false),
    u_r.created_at
  from updated u_r
  left join identity_and_user.users iu on iu.id = u_r.reviewer_id;
end;
$$;

revoke all on function public.servease_admin_set_review_flagged(uuid, boolean) from public;
grant execute on function public.servease_admin_set_review_flagged(uuid, boolean) to service_role;

create or replace function public.servease_admin_list_integrations()
returns table (
  provider text,
  display_name text,
  category text,
  is_enabled boolean,
  status text,
  webhook_url text,
  api_key_preview text,
  last_tested_at timestamptz,
  last_error text,
  updated_by uuid,
  updated_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, admin
as $$
begin
  return query
  select
    i.provider, i.display_name, i.category, i.is_enabled, i.status,
    i.webhook_url, i.api_key_preview, i.last_tested_at, i.last_error,
    i.updated_by, i.updated_at, i.created_at
  from admin.integrations i
  order by i.category, i.display_name;
end;
$$;

revoke all on function public.servease_admin_list_integrations() from public;
grant execute on function public.servease_admin_list_integrations() to service_role;

create or replace function public.servease_admin_update_integration_credentials(
  p_provider text,
  p_admin_user_id uuid,
  p_is_enabled boolean default null,
  p_webhook_url text default null,
  p_api_key_preview text default null,
  p_apply_webhook boolean default false,
  p_apply_api_key boolean default false
)
returns table (
  provider text,
  display_name text,
  category text,
  is_enabled boolean,
  status text,
  webhook_url text,
  api_key_preview text,
  last_tested_at timestamptz,
  last_error text,
  updated_by uuid,
  updated_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, admin
as $$
begin
  update admin.integrations i
  set
    is_enabled = coalesce(p_is_enabled, i.is_enabled),
    status = case
      when p_is_enabled is true then 'active'
      when p_is_enabled is false then 'inactive'
      else i.status
    end,
    webhook_url = case when p_apply_webhook then p_webhook_url else i.webhook_url end,
    api_key_preview = case when p_apply_api_key then p_api_key_preview else i.api_key_preview end,
    updated_by = p_admin_user_id,
    updated_at = now()
  where i.provider = p_provider;

  return query
  select
    i.provider, i.display_name, i.category, i.is_enabled, i.status,
    i.webhook_url, i.api_key_preview, i.last_tested_at, i.last_error,
    i.updated_by, i.updated_at, i.created_at
  from admin.integrations i
  where i.provider = p_provider;
end;
$$;

revoke all on function public.servease_admin_update_integration_credentials(text, uuid, boolean, text, text, boolean, boolean) from public;
grant execute on function public.servease_admin_update_integration_credentials(text, uuid, boolean, text, text, boolean, boolean) to service_role;

create or replace function public.servease_admin_record_integration_test(
  p_provider text,
  p_admin_user_id uuid,
  p_success boolean,
  p_error_message text default null
)
returns table (
  provider text,
  display_name text,
  category text,
  is_enabled boolean,
  status text,
  webhook_url text,
  api_key_preview text,
  last_tested_at timestamptz,
  last_error text,
  updated_by uuid,
  updated_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, admin
as $$
begin
  update admin.integrations i
  set
    status = case when p_success then 'active' else 'error' end,
    last_tested_at = now(),
    last_error = case when p_success then null else coalesce(p_error_message, 'Test failed.') end,
    updated_by = p_admin_user_id,
    updated_at = now()
  where i.provider = p_provider;

  return query
  select
    i.provider, i.display_name, i.category, i.is_enabled, i.status,
    i.webhook_url, i.api_key_preview, i.last_tested_at, i.last_error,
    i.updated_by, i.updated_at, i.created_at
  from admin.integrations i
  where i.provider = p_provider;
end;
$$;

revoke all on function public.servease_admin_record_integration_test(text, uuid, boolean, text) from public;
grant execute on function public.servease_admin_record_integration_test(text, uuid, boolean, text) to service_role;
