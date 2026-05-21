# Landing Page Integration Closure Design

## Goal

Make the merged landing website functional across public/customer routes and the
provider dashboard under `/provider/*`.

## Current State

The active app directory is `servease-web/`. It contains the migrated public
landing app, customer account flows, Next API proxy routes, and the provider
dashboard mounted through `src/app/provider/[[...slug]]/page.tsx`.

Baseline checks from `servease-web/`:

- `npm run typecheck` passes.
- `npm test` passes.
- `npm run build` passes.
- `npm run lint` reports no errors and two hook dependency warnings.
- `npm run e2e` passes 9 merged-site Playwright tests.

## Scope

This closure pass includes:

- Public/customer landing, auth, support, catalog, booking, payment, account,
  notification, referral, review, and provider-registration surfaces.
- Provider dashboard routes under `/provider/*`.
- Browser-to-gateway integration through existing Next proxy routes and
  provider API clients.
- Removing user-facing no-op actions, fake `alert(...)` placeholders, and
  dead-end controls.
- Adding targeted regression coverage for newly integrated interactions.

This pass does not add new backend service boundaries, direct database access,
event buses, or cross-service data access.

## Architecture

- `servease-web/src/app` remains the Next App Router public/customer surface.
- `servease-web/src/app/api` remains the browser-safe proxy layer for flows that
  need server environment configuration.
- `servease-web/src/provider-app` remains the provider dashboard surface.
- Provider dashboard client code calls public gateway `/v1/*` contracts through
  `servease-web/src/services/serveaseProviderApi.ts`.
- Public links from the provider dashboard use normal document navigation when
  leaving the React Router provider app.

## First Implementation Slice

Close the verified dead ends in provider settings and provider help:

- Replace provider settings `alert(...)` placeholders with existing routes,
  backend-backed panels, or public document/contact navigation.
- Wire provider logout to the provider auth context and redirect to
  `/provider/login`.
- Add login activity loading through `GET /v1/me/sessions`.
- Replace help-center contact card no-ops with email/ticket actions.
- Preserve existing support-ticket API integration.

## Acceptance Criteria

- No provider settings or provider help-center action is a no-op.
- Provider settings logout clears the stored provider session and returns to
  provider login.
- Login activity uses the gateway session contract and has loading/error/empty
  states.
- Legal/privacy/support actions either open real content, navigate to a real
  route, or start a real support-ticket workflow.
- Existing public/provider merge behavior remains covered by Playwright.
- `typecheck`, `lint`, script tests, build, and targeted E2E checks pass or any
  blocked verification is explicitly reported.

## Verification Plan

Run from `servease-web/`:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- Targeted Playwright tests for provider settings/help actions
- Existing `npm run e2e` before declaring the full slice complete
