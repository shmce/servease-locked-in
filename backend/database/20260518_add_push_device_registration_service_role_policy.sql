alter table notification_and_support.push_devices enable row level security;

drop policy if exists push_devices_service_role_all
  on notification_and_support.push_devices;

create policy push_devices_service_role_all
  on notification_and_support.push_devices
  for all
  to service_role
  using (true)
  with check (true);
