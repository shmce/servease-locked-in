# Admin Website Functionality Audit

Date: 2026-05-19

## Scope

Audited the admin website and its gateway-backed admin API surface, with emphasis on Admin Roles & Permissions and routes that previously returned `Admin service is unavailable`.

## Verified Working

- Admin frontend route smoke:
  - `/login`
  - `/dashboard`
  - `/transactions`
  - `/support`
  - `/categories`
  - `/services`
  - `/service-providers`
  - `/reports/revenue`
  - `/reports/booking-analytics`
  - `/backend-support`
- Authenticated admin API smoke:
  - `/v1/me`
  - catalog categories/services/providers
  - admin payments
  - admin support tickets
- Read-only admin API dependency sweep:
  - Checked 22 admin GET endpoints.
  - No endpoint returned `admin_dependency_unavailable`.
  - No endpoint returned `Admin service is unavailable`.
- Admin Roles & Permissions:
  - `GET /v1/admin/users?role=admin` returns live admin users.
  - Returned users include `accessRole`, `accessRoleLabel`, `permissions`, `requireTwoFactor`, and `invitationSent`.
  - Admin Roles page renders gateway-backed admin users instead of local mock data.
  - Admin creation can send invitation email through APICenter when requested.
  - Admin role edits call `PATCH /v1/admin/users/:userId/access`.
  - Admin activate/deactivate calls `PATCH /v1/admin/users/:userId/status`.
  - Admin deletion calls `DELETE /v1/admin/users/:userId` and removes the deleted admin from the UI list.

## Fixed

- Added persisted admin access roles in `admin.admin_user_access`.
- Added service-role RPCs:
  - `servease_admin_upsert_user_access`
  - `servease_admin_list_user_access`
- Added local migration for missing admin user management RPC contracts.
- Applied the live Supabase access-role migration.
- Fixed `SupabaseAdminUserRepository.getSummary()` to use its injected client.
- Preserved downstream 4xx admin-user errors instead of flattening them into generic service-unavailable responses.
- Added APICenter-backed admin invitation delivery and made `invitationSent` reflect actual email delivery.
- Added delete-admin support with self-delete and last active Super Admin safeguards.

## Checks Run

- `admin npm test`
- `admin npm run typecheck`
- `admin npm run lint`
- `admin npm run build`
- `admin ADMIN_SMOKE_BASE_URL=http://localhost:3000 npm run smoke:routes`
- `admin npm run smoke:integration`
- `backend npm test`
- `backend npm run build -- --pretty false`
- `backend npm run lint:check`
- `git diff --check`
- Live Supabase function/table inspection for admin access-role RPCs.
- Authenticated read-only gateway sweep across 22 admin GET endpoints.

## Remaining Unknowns

- Mutation flows beyond Admin Roles were not exercised end to end, including payment status changes, refunds, dispute resolution, booking escalation/cancel, provider application decisions, promotion writes, catalog writes, broadcast sends, report schedule creation, and integration credential updates.
- Browser-level authenticated Admin Roles interaction was not performed to avoid typing admin credentials into the browser during audit. API-level authenticated checks covered the same backend contract.
- Visual QA was limited to route availability and automated component coverage, not a full screenshot review of every admin page.

## Recommendations

- Add an admin smoke script for safe read-only admin GET endpoint sweeps.
  - Severity: medium
  - Reason: this caught the exact `Admin service is unavailable` class without mutating production-like data.
- Add targeted E2E coverage for Admin Roles after test-user fixtures exist.
  - Severity: medium
  - Reason: component and API tests pass, but browser-authenticated editing was not exercised end to end.
- Add non-mutating health/readiness checks for admin-service downstream dependencies.
  - Severity: low
  - Reason: service liveness is green, but dependency readiness is currently inferred from endpoint smoke results.
