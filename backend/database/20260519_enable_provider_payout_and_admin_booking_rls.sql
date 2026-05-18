-- Lock down service-owned tables that are only accessed through backend RPCs.

alter table payment.provider_payout_methods enable row level security;

drop policy if exists provider_payout_methods_service_role_all
  on payment.provider_payout_methods;

create policy provider_payout_methods_service_role_all
  on payment.provider_payout_methods
  for all
  to service_role
  using (true)
  with check (true);

alter table booking.admin_booking_messages enable row level security;

drop policy if exists admin_booking_messages_service_role_all
  on booking.admin_booking_messages;

create policy admin_booking_messages_service_role_all
  on booking.admin_booking_messages
  for all
  to service_role
  using (true)
  with check (true);
