create or replace function public.servease_seed_demo_dispute(
  p_customer_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking uuid := '88888888-8888-4888-8888-888888888888'::uuid;
  v_dispute uuid := 'ffffffff-ffff-4fff-8fff-ffffffffffff'::uuid;
begin
  insert into booking.disputes (
    id,
    booking_id,
    raised_by,
    reason,
    status
  )
  values (
    v_dispute,
    v_booking,
    p_customer_id,
    'Demo dispute for admin resolution testing.',
    'open'
  )
  on conflict (id) do update
  set
    booking_id = excluded.booking_id,
    raised_by = excluded.raised_by,
    reason = excluded.reason,
    status = excluded.status;

  delete from booking.disputes
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::uuid
    and booking_id = v_booking;

  return v_dispute;
end;
$$;

revoke all on function public.servease_seed_demo_dispute(uuid) from public, anon, authenticated;

grant execute on function public.servease_seed_demo_dispute(uuid) to service_role;
