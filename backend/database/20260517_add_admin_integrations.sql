-- Owner: Admin Service
-- Purpose: Store the catalog and live state of third-party integrations
-- (payment gateways, messaging, maps, push, analytics) so the admin
-- console can list, enable/disable, and test them from the gateway.

create schema if not exists admin;

create table if not exists admin.integrations (
  provider text primary key,
  display_name text not null,
  category text not null,
  is_enabled boolean not null default false,
  status text not null default 'inactive',
  webhook_url text,
  api_key_preview text,
  last_tested_at timestamptz,
  last_error text,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint integrations_status_check
    check (status in ('active', 'inactive', 'error'))
);

alter table admin.integrations enable row level security;

drop policy if exists integrations_service_role_all on admin.integrations;
create policy integrations_service_role_all
  on admin.integrations
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

insert into admin.integrations (provider, display_name, category, is_enabled, status)
values
  ('gcash', 'GCash', 'payment', true, 'active'),
  ('paymaya', 'Maya', 'payment', true, 'active'),
  ('stripe', 'Stripe', 'payment', false, 'inactive'),
  ('twilio', 'Twilio SMS', 'messaging', true, 'active'),
  ('sendgrid', 'SendGrid', 'messaging', true, 'active'),
  ('google_maps', 'Google Maps', 'maps', true, 'active'),
  ('mixpanel', 'Mixpanel', 'analytics', false, 'inactive'),
  ('firebase', 'Firebase Cloud Messaging', 'push', true, 'active')
on conflict (provider) do nothing;
