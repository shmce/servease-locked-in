create or replace function public.servease_smoke_seed_admin(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = identity_and_user, public
as $$
begin
  insert into identity_and_user.users (
    id,
    email,
    password_hash,
    full_name,
    contact_number,
    role,
    status
  )
  values (
    p_user_id,
    p_email,
    'managed_by_supabase_auth',
    'ServEase Smoke Admin',
    null,
    'admin',
    'active'
  )
  on conflict (id) do update set
    email = excluded.email,
    password_hash = excluded.password_hash,
    full_name = excluded.full_name,
    contact_number = excluded.contact_number,
    role = excluded.role,
    status = excluded.status,
    updated_at = now();
end;
$$;

create or replace function public.servease_smoke_cleanup_extended(
  p_user_id uuid,
  p_admin_user_id uuid default null,
  p_booking_id uuid default null,
  p_conversation_id uuid default null,
  p_payment_id uuid default null,
  p_review_id uuid default null,
  p_support_ticket_id uuid default null,
  p_notification_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_conversation_id is not null then
    delete from messages.messages
    where conversation_id = p_conversation_id;

    delete from messages.conversations
    where id = p_conversation_id;
  end if;

  if p_payment_id is not null then
    delete from payment.payments
    where id = p_payment_id;
  end if;

  if p_review_id is not null then
    delete from trust_and_reputation.reviews
    where id = p_review_id;
  end if;

  if p_support_ticket_id is not null then
    delete from notification_and_support.support_tickets
    where id = p_support_ticket_id;
  end if;

  if p_notification_id is not null then
    delete from notification_and_support.notifications
    where id = p_notification_id;
  end if;

  if p_booking_id is not null then
    delete from booking.booking_timeline_events
    where booking_id = p_booking_id;

    delete from booking.bookings
    where id = p_booking_id;
  end if;

  if p_user_id is not null then
    delete from identity_and_user.customer_profiles
    where user_id = p_user_id;

    delete from identity_and_user.users
    where id = p_user_id;
  end if;

  if p_admin_user_id is not null then
    delete from identity_and_user.users
    where id = p_admin_user_id;
  end if;
end;
$$;

revoke all on function public.servease_smoke_seed_admin(uuid, text) from public, anon, authenticated;
revoke all on function public.servease_smoke_cleanup_extended(uuid, uuid, uuid, uuid, uuid, uuid, uuid, uuid) from public, anon, authenticated;

grant execute on function public.servease_smoke_seed_admin(uuid, text) to service_role;
grant execute on function public.servease_smoke_cleanup_extended(uuid, uuid, uuid, uuid, uuid, uuid, uuid, uuid) to service_role;
