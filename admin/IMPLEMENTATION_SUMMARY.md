# ServEase Admin Implementation Status

Last verified from repository files: 2026-05-23.

## Purpose

This document summarizes the current admin dashboard implementation. For exact endpoint coverage, use `admin/src/app/config/backendSupportMatrix.ts`; that file drives the in-app Backend Matrix and is the source of truth for per-screen gateway wiring.

## Current State

- `admin/` is a Next.js app served on port `3001` by `npm run dev`.
- Authentication uses Supabase password sign-in, then validates the user through `GET /v1/me`.
- Admin API calls go through the API Gateway, primarily `/v1/admin/...`.
- Shared current-user, catalog, and provider-availability reads also use public gateway routes.
- The dashboard does not call internal service ports or service-owned databases directly.

## Live Gateway Coverage

The admin app has live gateway-backed coverage for:

- Dashboard metrics, support-ticket counts, payment exceptions, catalog counts, booking summaries, user summaries, and operations alerts.
- Payments, failed-payment handling, APICenter payment sync, payouts, refunds, settlements, commission rules, and pricing-engine management.
- Support tickets, ticket replies, agent assignment, and status changes.
- Catalog categories and services, provider listings, provider details, provider application review, document preview/download, and portfolio moderation.
- Bookings, ongoing services, admin booking cancellation, escalation, provider messages, and admin booking threads.
- Reviews moderation, promotions, broadcasts, audit logs, integrations, reports, report schedules, admin users, and admin access roles.
- Account profile, password changes, sessions, preferences, and TOTP two-factor setup.

## Runtime And Environment

Required local environment values are documented in `admin/README.md` and `admin/.env.example`.

```sh
npm install
npm run dev
npm run env:check
npm run typecheck
npm test
npm run smoke:routes
npm run smoke:integration
npm run build
```

`npm run smoke:integration` requires `ADMIN_SMOKE_EMAIL` and `ADMIN_SMOKE_PASSWORD` for a seeded admin user.

## Design And UX Rules

- Keep admin screens operational and dense: tables, filters, queue state, review detail, and audit context matter more than decorative layout.
- Use live gateway errors and empty states instead of silent mock fallbacks.
- Do not show local-only mutations as successful backend changes.
- Confirm risky actions such as refunds, payouts, provider decisions, account deletion, booking cancellation, and integration credential changes.

## Related Source Files

- `admin/src/services/serveaseAdminApi.ts`: gateway client and admin API types.
- `admin/src/hooks/useAdminGatewayData.ts`: dashboard data aggregation.
- `admin/src/app/config/backendSupportMatrix.ts`: per-screen gateway coverage matrix.
- `admin/src/app/routes.tsx`: routed admin pages.
- `admin/scripts/`: environment, route, integration, and demo smoke checks.
