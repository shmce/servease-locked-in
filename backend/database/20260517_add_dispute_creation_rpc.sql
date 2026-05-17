-- Customer/provider dispute initiation (audit gap M4+B4).
-- Adds category/description/resolved_at/resolved_by columns to booking.disputes
-- and exposes RPC functions to raise a dispute and to list disputes raised by
-- the calling user.

alter table booking.disputes
  add column if not exists category text,
  add column if not exists description text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid;

create or replace function public.servease_raise_booking_dispute(
  p_booking_id uuid,
  p_actor_id uuid,
  p_category text,
  p_reason text,
  p_description text default null
)
returns table (
  id uuid,
  booking_id uuid,
  raised_by uuid,
  category text,
  reason text,
  description text,
  status text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
declare
  v_customer_id uuid;
  v_provider_owner uuid;
  v_dispute_id uuid;
begin
  if p_booking_id is null
    or p_actor_id is null
    or p_reason is null or length(trim(p_reason)) = 0
    or p_category is null or length(trim(p_category)) = 0 then
    raise exception 'invalid_dispute_request';
  end if;

  select b.customer_id into v_customer_id
  from booking.bookings b
  where b.id = p_booking_id;

  if v_customer_id is null then
    raise exception 'booking_not_found';
  end if;

  select p.user_id into v_provider_owner
  from booking.bookings b
  join provider_catalog.providers p on p.id = b.provider_id
  where b.id = p_booking_id;

  if (v_customer_id is null or v_customer_id <> p_actor_id)
     and (v_provider_owner is null or v_provider_owner <> p_actor_id) then
    raise exception 'dispute_forbidden';
  end if;

  insert into booking.disputes (
    booking_id, raised_by, category, reason, description, status
  )
  values (
    p_booking_id, p_actor_id, trim(p_category), trim(p_reason),
    case when p_description is null then null else trim(p_description) end,
    'open'
  )
  returning booking.disputes.id into v_dispute_id;

  return query
    select d.id, d.booking_id, d.raised_by, d.category, d.reason,
           d.description, d.status, d.resolved_at, d.resolved_by, d.created_at
    from booking.disputes d
    where d.id = v_dispute_id;
end;
$$;

create or replace function public.servease_list_user_disputes(
  p_actor_id uuid
)
returns table (
  id uuid,
  booking_id uuid,
  raised_by uuid,
  category text,
  reason text,
  description text,
  status text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz
)
language sql
security definer
set search_path = booking, public
as $$
  select d.id, d.booking_id, d.raised_by, d.category, d.reason,
         d.description, d.status, d.resolved_at, d.resolved_by, d.created_at
  from booking.disputes d
  where d.raised_by = p_actor_id
  order by d.created_at desc nulls last
  limit 200;
$$;

revoke all on function public.servease_raise_booking_dispute(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.servease_list_user_disputes(uuid) from public, anon, authenticated;

grant execute on function public.servease_raise_booking_dispute(uuid, uuid, text, text, text) to service_role;
grant execute on function public.servease_list_user_disputes(uuid) to service_role;
