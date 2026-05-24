-- catalog-service / availability-service:
-- Approved, active providers need explicit booking.provider_availability_windows rows
-- because both the customer calendar and booking guard treat missing windows as unavailable.

create or replace function public.servease_ensure_default_provider_availability_windows(
  p_provider_id uuid
)
returns void
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_provider_id is null then
    raise exception 'invalid_provider_availability_request';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_provider_id::text));

  if exists (
    select 1
    from booking.provider_availability_windows w
    where w.user_id = p_provider_id
  ) then
    return;
  end if;

  insert into booking.provider_availability_windows (
    user_id,
    day_of_week,
    start_time,
    end_time,
    is_active,
    sort_order
  )
  values
    (p_provider_id, 'monday', '09:00'::time, '17:00'::time, true, 1),
    (p_provider_id, 'tuesday', '09:00'::time, '17:00'::time, true, 2),
    (p_provider_id, 'wednesday', '09:00'::time, '17:00'::time, true, 3),
    (p_provider_id, 'thursday', '09:00'::time, '17:00'::time, true, 4),
    (p_provider_id, 'friday', '09:00'::time, '17:00'::time, true, 5),
    (p_provider_id, 'saturday', '09:00'::time, '13:00'::time, true, 6);
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

  if p_decision = 'approved' then
    perform public.servease_ensure_default_provider_availability_windows(p_provider_id);
  end if;

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

create or replace function public.servease_admin_update_provider_status(
  p_provider_id uuid,
  p_status text,
  p_reason text default null
)
returns table (
  id uuid,
  user_id uuid,
  business_name text,
  bio text,
  service_description text,
  service_area text,
  years_experience integer,
  verification_status text,
  average_rating numeric,
  review_count integer,
  total_bookings integer,
  completion_rate numeric,
  is_active boolean,
  created_at timestamptz,
  approved_by_user_id uuid,
  approved_by_name text,
  user_email text,
  user_full_name text,
  user_contact_number text,
  user_status text
)
language plpgsql
security definer
set search_path = provider_catalog, booking, public
as $$
begin
  if p_provider_id is null
    or p_status not in ('pending', 'approved', 'rejected', 'suspended') then
    raise exception 'invalid_provider_request';
  end if;

  update provider_catalog.provider_profiles pp
  set verification_status = case
        when p_status in ('pending', 'approved', 'rejected') then p_status
        else pp.verification_status
      end,
      is_active = p_status = 'approved',
      updated_at = now()
  where pp.id = p_provider_id;

  if not found then
    raise exception 'provider_not_found';
  end if;

  if p_status = 'approved' then
    perform public.servease_ensure_default_provider_availability_windows(p_provider_id);
  end if;

  return query
    select * from public.servease_admin_get_provider(p_provider_id);
end;
$$;

do $$
declare
  v_provider record;
begin
  for v_provider in
    select pp.id
    from provider_catalog.provider_profiles pp
    where coalesce(pp.verification_status, 'pending') = 'approved'
      and coalesce(pp.is_active, true) = true
  loop
    perform public.servease_ensure_default_provider_availability_windows(v_provider.id);
  end loop;
end;
$$;

revoke all on function public.servease_ensure_default_provider_availability_windows(uuid)
  from public, anon, authenticated;
revoke all on function public.servease_admin_decide_provider_application(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.servease_admin_update_provider_status(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.servease_ensure_default_provider_availability_windows(uuid)
  to service_role;
grant execute on function public.servease_admin_decide_provider_application(uuid, uuid, text, text)
  to service_role;
grant execute on function public.servease_admin_update_provider_status(uuid, text, text)
  to service_role;
