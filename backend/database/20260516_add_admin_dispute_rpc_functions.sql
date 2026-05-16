drop policy if exists disputes_service_role_all
  on booking.disputes;

create policy disputes_service_role_all
  on booking.disputes
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.servease_admin_list_disputes(
  p_status text default null
)
returns table (
  id uuid,
  booking_id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  raised_by uuid,
  reason text,
  status text,
  amount numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_status is not null and p_status not in ('open', 'resolved', 'closed') then
    raise exception 'invalid_dispute_request';
  end if;

  return query
    select
      d.id,
      d.booking_id,
      b.booking_reference,
      b.customer_id,
      b.provider_id,
      d.raised_by,
      d.reason,
      coalesce(d.status, 'open'),
      coalesce(b.total_amount, 0),
      d.created_at
    from booking.disputes d
    left join booking.bookings b on b.id = d.booking_id
    where p_status is null or d.status = p_status
    order by d.created_at desc nulls last
    limit 100;
end;
$$;

create or replace function public.servease_admin_get_dispute(
  p_dispute_id uuid
)
returns table (
  id uuid,
  booking_id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  raised_by uuid,
  reason text,
  status text,
  amount numeric,
  created_at timestamptz
)
language sql
security definer
set search_path = booking, public
as $$
  select
    d.id,
    d.booking_id,
    b.booking_reference,
    b.customer_id,
    b.provider_id,
    d.raised_by,
    d.reason,
    coalesce(d.status, 'open'),
    coalesce(b.total_amount, 0),
    d.created_at
  from booking.disputes d
  left join booking.bookings b on b.id = d.booking_id
  where d.id = p_dispute_id;
$$;

create or replace function public.servease_admin_update_dispute_status(
  p_dispute_id uuid,
  p_status text
)
returns table (
  id uuid,
  booking_id uuid,
  booking_reference text,
  customer_id uuid,
  provider_id uuid,
  raised_by uuid,
  reason text,
  status text,
  amount numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = booking, public
as $$
begin
  if p_dispute_id is null
    or p_status not in ('open', 'resolved', 'closed') then
    raise exception 'invalid_dispute_request';
  end if;

  return query
    with updated as (
      update booking.disputes d
      set status = p_status
      where d.id = p_dispute_id
      returning d.id
    )
    select
      detail.id,
      detail.booking_id,
      detail.booking_reference,
      detail.customer_id,
      detail.provider_id,
      detail.raised_by,
      detail.reason,
      detail.status,
      detail.amount,
      detail.created_at
    from updated u
    join public.servease_admin_get_dispute(u.id) detail on true;
end;
$$;

revoke all on function public.servease_admin_list_disputes(text) from public, anon, authenticated;
revoke all on function public.servease_admin_get_dispute(uuid) from public, anon, authenticated;
revoke all on function public.servease_admin_update_dispute_status(uuid, text) from public, anon, authenticated;

grant execute on function public.servease_admin_list_disputes(text) to service_role;
grant execute on function public.servease_admin_get_dispute(uuid) to service_role;
grant execute on function public.servease_admin_update_dispute_status(uuid, text) to service_role;
