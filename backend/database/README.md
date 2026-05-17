# Database Migrations

Backend database migrations live here. Each migration must preserve service ownership and must not introduce cross-service database access or cross-schema foreign keys.

## Rules

- Name the owning service in the migration comments or function/table purpose.
- Keep service-owned persistence inside the owning schema.
- Store external service references as opaque IDs instead of cross-schema foreign keys.
- Do not grant gateway access to service tables.
- Use Supabase Storage only for approved upload workflows.
- Add follow-up migrations instead of editing already-applied migration history.

## Verification

From `backend/`:

```sh
npm run check:migrations
```

For DDL changes, also inspect the affected Supabase objects and run security/performance advisors before handoff.

## APICenter Payment Reconciliation

`20260518_add_apicenter_checkout_reconciliation.sql` is owned by payment-service. It stores APICenter checkout IDs as opaque external references in `payment.apicenter_checkout_sessions`, links them to the local payment row, and exposes service-role RPCs to record checkout creation and sync checkout status. The API gateway must continue to call payment-service over HTTP; it must not read this table directly.

`20260518_lock_down_apicenter_checkout_rls.sql` adds an explicit deny-all anon/authenticated RLS policy and comments on the table/RPCs. This addresses the Supabase RLS advisor for the new table while preserving the intended access model: only backend service-role RPC callers can mutate or read reconciliation data. Performance advisors may still report the new checkout indexes as unused immediately after migration because the table is new; keep them until webhook/status reconciliation has production query history.
