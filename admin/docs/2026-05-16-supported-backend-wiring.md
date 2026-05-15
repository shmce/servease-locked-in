# Supported Backend Wiring

## Scope

Only files under `admin/` may be changed. The backend is read-only reference while other agents customize it.

This pass wires the admin UI to existing gateway endpoints only. It does not add a backend, proxy, route, schema, mock server, or backend-specific workaround.

The admin app now runs on Next.js. Existing React screens are mounted through a Next catch-all page while the supported pages are incrementally wired to real gateway calls.

## Existing Gateway Endpoints Used

- `GET /v1/me` validates the authenticated user and confirms `role: admin`.
- `GET /v1/admin/payments` lists all admin-visible payments.
- `PATCH /v1/admin/payments/:paymentId/status` updates payment status.
- `GET /v1/admin/support/tickets` lists all admin support tickets.
- `PATCH /v1/admin/support/tickets/:ticketId/status` updates support ticket status.
- `GET /v1/catalog/categories` lists public catalog categories.
- `GET /v1/catalog/services` lists public catalog services.
- `GET /v1/catalog/providers` lists public provider service listings.

## Admin Frontend Design

- Run with `npm run dev` or build with `npm run build` from `admin/`.
- Run `npm test` from `admin/` for regression tests around the gateway client, unsupported-action messaging, and backend support matrix.
- Run `npm run env:check` from `admin/` to verify required public admin env keys.
- Run `npm run smoke:integration` from `admin/` with `ADMIN_SMOKE_EMAIL` and `ADMIN_SMOKE_PASSWORD` set to verify the current admin gateway contract.
- Run `npm run smoke:routes` from `admin/` while the Next dev server is running to verify key admin routes return non-404/non-500 responses.
- Configure `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Add a frontend-only gateway client in `admin/src/services/`. It uses `fetch`, Next public env vars, Supabase password auth env vars, and the admin access token from local storage.
- Replace demo login with Supabase password login followed by `/v1/me`. Non-admin users are rejected.
- Keep unsupported screens visible, but do not pretend backend mutations exist.
- Wire support tickets to the admin support endpoint with loading, error, filtering, and status update controls.
- Wire payment views to admin payment endpoints with loading, error, filtering, and status update controls.
- Wire catalog read screens to public catalog endpoints where the existing page shape can map cleanly.
- Unsupported mutating controls now show a backend-required toast instead of changing mock state or reporting fake success.
- Account settings are saved locally on the admin device only, with copy that states no backend account-settings endpoint is available yet.
- Sidebar collapse state is saved locally on the admin device.
- Filters/search terms on Transactions, Support, Categories, Services, and Service Providers are saved locally on the admin device.
- Header notifications are derived from live support ticket and payment exception data instead of static demo alerts.
- `/backend-support` provides an in-app support matrix and CSV export of what is wired, partial, local-only, or blocked.

## Current Smoke Coverage

The integration smoke script signs in through Supabase password auth, calls `GET /v1/me`, and verifies the authenticated profile is an active admin. It then reads catalog categories, catalog services, provider listings, admin payments, and admin support tickets from the gateway.

The script does not create, update, or delete data. It is safe to run against the shared backend while other agents are working.

## Backend Contract Documentation

See `admin/docs/2026-05-16-backend-contracts-needed.md` for the backend endpoints needed to complete the blocked and partial admin workflows. That file is documentation only and does not change backend behavior.

## Backend Needed For Full Admin Coverage

These areas cannot be fully wired from `admin/` alone because no suitable admin endpoint is currently exposed in the gateway contract inspected during this pass:

- Customers: admin list, detail, suspend/reactivate, export.
- Provider applications: queue, review, approve, reject, request information, document verification.
- Service providers: admin provider list/detail/status management.
- Bookings: platform-wide admin list, detail, force cancel, escalation.
- Payouts and settlements: payout request list, approval, rejection, release.
- Refunds: list, approve, reject, process.
- Disputes: list, assignment, resolution, refund linkage.
- Promotions and broadcasts: create, update, publish, disable, audience targeting.
- Commission rules: create/update per category or provider.
- Admin roles and audit trail: admin CRUD, role assignment, permission changes, login/audit log endpoints.
- Reports: revenue, booking, business, financial, user, performance, and compliance aggregates.
- Platform settings: notification, security, integration, and profile/session update endpoints.
