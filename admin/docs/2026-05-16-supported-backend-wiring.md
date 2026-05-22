# Supported Admin Backend Wiring

Last verified from repository files: 2026-05-23.

## Scope

This document records the supported admin frontend wiring pattern. The current implementation is broader than the original May 16 pass; for exact coverage, use `admin/src/app/config/backendSupportMatrix.ts`.

## Supported Pattern

- The admin app runs as a Next.js app from `admin/`.
- Admin sign-in uses Supabase password auth, then validates role/status through `GET /v1/me`.
- Gateway requests use `NEXT_PUBLIC_API_BASE_URL` and send the admin Supabase access token as a bearer token.
- Backend-facing code belongs in `admin/src/services/serveaseAdminApi.ts` or focused hooks that call that client.
- Admin pages render loading, empty, error, and success states from gateway results.
- Screens that need unavailable product contracts should hide those controls or show explicit unsupported copy; they must not mutate local state and imply persistence.

## Current Verification Commands

```sh
cd admin
npm run env:check
npm run typecheck
npm test
npm run smoke:routes
npm run smoke:integration
npm run build
```

`npm run smoke:integration` requires `ADMIN_SMOKE_EMAIL` and `ADMIN_SMOKE_PASSWORD`.

## Current Smoke Coverage

The integration smoke script signs in through Supabase password auth, calls `GET /v1/me`, confirms the authenticated profile is an active admin, and reads live gateway data for catalog, providers, payments, support, dashboard, and admin workflows. It should be run only against an environment where those reads are expected to be safe and credentials are approved for smoke use.

## Current Source Files

- `admin/src/services/serveaseAdminApi.ts`: admin gateway client.
- `admin/src/services/gatewayConfig.ts`: gateway base URL resolution.
- `admin/src/hooks/useAdminGatewayData.ts`: dashboard data aggregation.
- `admin/src/app/config/backendSupportMatrix.ts`: backend coverage matrix.
- `admin/scripts/check-admin-env.mjs`: local admin env validation.
- `admin/scripts/check-production-env.mjs`: production env validation.
- `admin/scripts/smoke-admin-routes.mjs`: route smoke check.
- `admin/scripts/smoke-admin-integration.mjs`: live gateway integration smoke.
