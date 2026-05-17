drop policy if exists apicenter_checkout_sessions_deny_client_access
  on payment.apicenter_checkout_sessions;

create policy apicenter_checkout_sessions_deny_client_access
  on payment.apicenter_checkout_sessions
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table payment.apicenter_checkout_sessions is
  'Payment-service owned APICenter checkout reconciliation ledger. Direct anon/authenticated access is intentionally denied; backend writes through service-role RPCs only.';

comment on policy apicenter_checkout_sessions_deny_client_access
  on payment.apicenter_checkout_sessions is
  'Documents and enforces the no direct client access posture for APICenter checkout reconciliation rows.';

comment on function public.servease_record_apicenter_checkout(
  uuid,
  uuid,
  uuid,
  numeric,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  numeric,
  text,
  text,
  text[],
  jsonb
) is
  'Service-role only RPC used by payment-service to create or update local payment records from APICenter checkout creation.';

comment on function public.servease_sync_apicenter_checkout_status(
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  numeric,
  text,
  text,
  text[],
  jsonb
) is
  'Service-role only RPC used by payment-service to reconcile APICenter checkout status polling and webhooks.';
