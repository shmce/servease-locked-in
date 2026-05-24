# Admin Backend Contract Status

Last verified from repository files: 2026-05-23.

## Purpose

This document used to list admin contracts that were still needed. The admin surface has since been wired much more broadly. Keep this file as a dated status note for the May 16 admin contract pass; use `admin/src/app/config/backendSupportMatrix.ts` for the current screen-by-screen source of truth.

## Current Rule

- Admin requests route through the API Gateway on port `5001`.
- The admin app does not call internal service ports or service-owned database schemas.
- Admin mutations require admin authorization, structured errors, and audit logging when the workflow changes business state.
- Missing product features should be hidden or shown as explicit unsupported states; do not fake backend success in the UI.

## Current Live Contract Areas

The following areas now have gateway-backed admin contracts:

- Dashboard summary data, booking summaries, operations alerts, user summaries, payments, support tickets, catalog reads, and provider listing counts.
- Payment operations, failed-payment metadata, retries, APICenter sync, payouts, payout history, refunds, settlements, bank-reference reconciliation, and commission rules.
- Support ticket list/detail/status/replies/assignee.
- Catalog category and service CRUD.
- Provider listing/detail/status, provider application review, approval/rejection, request-info notifications, document preview/download, provider availability read, and portfolio moderation.
- Booking list/detail/cancel/escalate/provider messages/admin booking thread.
- Review moderation.
- Promotions and broadcasts.
- Current-user profile, password, sessions, preferences, and TOTP 2FA.
- Reports, report generation, report schedules, audit logs, integrations, admin users, and access-role management.
- Pricing engine rules, fuel index rows, GasWatch fuel sync, and quote audits.

## Remaining Product Decisions

The current matrix has no `backendNeeded` rows, but some optional product decisions remain intentionally out of scope until dedicated contracts are designed:

- Persisted service-area CRUD beyond the current read-only derived coverage view.
- Custom admin permission editing beyond fixed backend-defined admin access roles.
- Admin password-reset resend from the Admin Roles page.
- Performance/compliance report families beyond the supported bookings, revenue, users, and financial reports.
- Provider social links, profile media, licenses, certifications, and languages if those optional profile fields are reintroduced.

## Verification Pointers

- `admin/src/app/config/backendSupportMatrix.ts` lists current endpoints and notes.
- `admin/src/services/serveaseAdminApi.test.ts` verifies admin gateway client calls.
- `admin/src/app/pages/AdminGatewayPages.test.tsx` verifies support/broadcast/admin-gateway flows.
- `admin/src/app/pages/PricingEngine.test.tsx` verifies pricing-engine UI behavior.
- `admin/scripts/smoke-admin-integration.mjs` verifies live admin contract reads when credentials are configured.
