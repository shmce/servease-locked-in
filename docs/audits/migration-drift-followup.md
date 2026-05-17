# Migration drift follow-up

Follow-up to `messaging-fix-2026-05-17.md`. The root cause of the
messaging outage was a committed migration file that had never been
applied to Supabase. A full drift audit found **9 more unapplied
migrations**, all critical user-facing features that had silently been
shipping with no DB backing. This document captures the remediation and
the new tooling that prevents the same failure mode.

## Audit findings

Running `backend/scripts/check-migration-drift.mjs` against the live
Supabase project listed these repo files with no matching applied
migration:

| Migration file | Affected feature |
|---|---|
| `add_two_factor_auth` | 2FA enroll/verify/disable RPCs + columns on `identity_and_user.users` |
| `add_account_deletion_rpc` | `servease_anonymize_internal_user` used by `DELETE /v1/me` |
| `allow_admin_internal_registration` | `servease_register_internal_user` (admin-role support) |
| `fix_provider_profile_update_rpc` | New 5-arg signature for provider profile updates |
| `add_admin_broadcast_history` | `admin.broadcasts` table + create/list RPCs |
| `add_provider_portfolio_reorder_rpc` | Portfolio reorder RPC |
| `add_provider_portfolio_replace_rpc` | Portfolio replace-media RPC |
| `add_settlement_history` | `payment.provider_payout_events` table + history/record RPCs |
| `add_conversation_message_attachments` | Already partially fixed for messaging — see below |

All nine were applied via `mcp__supabase__apply_migration`. The
conversation-attachments migration had to be applied under the name
`_v2` because PostgreSQL refuses `CREATE OR REPLACE FUNCTION` when the
OUT-parameter shape changes; the repo file was renamed to match the
applied name and updated to include explicit `DROP FUNCTION IF EXISTS`
statements so it stays runnable from scratch.

## New tooling

### 1. `npm run check:migrations`

`backend/scripts/check-migration-drift.mjs` compares the names of files
in `backend/database/` (stripping the `YYYYMMDD_` prefix) against the
names returned by a new RPC, `servease_list_applied_migrations`. Exits
non-zero with a list of missing names when drift is detected. The
helper RPC is defined in
`backend/database/20260517_add_migration_drift_helper.sql` because
PostgREST does not expose Supabase's internal `supabase_migrations`
schema by default.

### 2. `npm run smoke:messaging`

`backend/scripts/smoke-messaging.mjs` directly hits Supabase RPCs (no
NestJS services spun up) to exercise the entire messaging contract:

- open conversation
- list empty thread
- send text-only message
- send attachment-only message (catches the missing column / parameter
  failure mode)
- list thread and verify attachment shape round-trips
- visibility guard: stranger cannot list or post
- `servease_get_visible_conversation` returns rows for both sides

Cleanup uses `servease_smoke_cleanup_conversation`
(`backend/database/20260518_add_messaging_smoke_cleanup_rpc.sql`) since
the `messages` schema is not exposed through PostgREST.

### 3. `.github/workflows/migration-drift.yml`

Runs both checks on every PR that touches `backend/database/**` or
either script, and on every push to `main`. Requires repo secrets
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### 4. `npm run verify` chain

`backend/package.json` now runs `check:migrations` between `npm audit`
and the existing `smoke:all`, so the existing release verification chain
catches drift before deploys.

## Verification

```
$ node scripts/check-migration-drift.mjs
OK — 64 repo migrations are all applied (85 applied total, 21 applied but not in repo).

$ node scripts/smoke-messaging.mjs
OK — messaging RPC contract is intact.
```

## Followups

- **Applied-but-not-in-repo (21 migrations):** the smoke history shows
  21 names applied to Supabase that have no matching `.sql` file in the
  repo. These are likely older inline fixes and one-off helpers; the
  drift check intentionally treats them as informational only (set
  `MIGRATION_DRIFT_LOG_UNKNOWN=1` to see the list). Worth a cleanup
  pass to pull each down into the repo so the migration ledger is
  reproducible, but that is independent of the production-bug class
  this work prevents.
