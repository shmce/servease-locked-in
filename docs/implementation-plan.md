# Implementation Plan

## Purpose

This plan records the current build state and the next acceptance gates. Older phase language has been collapsed into status because the repository now contains active backend, mobile, admin, provider web, and landing page code.

## Current State

| Area | Status | Notes |
| --- | --- | --- |
| Repository documentation | Active | `AGENTS.md`, `DESIGN.md`, and `docs/` are the canonical baseline. |
| Backend workspace | Active | API Gateway plus services for auth, user, catalog, booking, availability, messaging, payment, review, notification, support, and admin. |
| Database migrations | Active | Service-owned migrations live in `backend/database`. |
| Mobile app | Active | Expo app with API/auth clients, push registration, and demo smoke support. |
| Admin dashboard | Active | Next.js dashboard wired to `/v1/admin/...` gateway routes. |
| Provider web dashboard | Active | Next.js provider surface with gateway wiring in progress. |
| Landing page | Active | Next.js public/account surface with API proxy routes to the gateway. |
| GitHub Packages | Active | Backend installs `@implementsprint/sdk` from GitHub Packages. |

## Active Acceptance Gates

Every new vertical slice should pass these gates before handoff:

1. Feature spec is present or updated in `docs/specs/` or near the feature.
2. Owning service and schema are explicit.
3. Public gateway contract and internal service contract are documented.
4. Client API usage is typed and calls only approved public/proxy routes.
5. Database migrations avoid cross-service foreign keys and name the owning service.
6. Tests cover changed business logic, API clients, guards, and state transitions.
7. Verification output is recorded in the handoff.

## Backend Gate

Use this gate for gateway, service, migration, shared backend, or integration changes:

```sh
cd backend
npm run lint
npm run test
npm run build
npm run check:migrations
```

For full backend readiness:

```sh
cd backend
npm run verify
```

`npm run verify` also runs dependency audit and smoke coverage.

## Mobile Gate

Use this gate for Expo app changes:

```sh
cd mobile
npm run typecheck
npm run lint
npm test
```

Run `npm run smoke:demo-api` when gateway-backed demo flows change.

## Admin Gate

Use this gate for admin dashboard changes:

```sh
cd admin
npm run env:check
npm run typecheck
npm test
npm run build
```

Run `npm run smoke:routes` and `npm run smoke:integration` when admin gateway wiring changes.

## Provider Web Gate

Use this gate for provider dashboard changes:

```sh
cd 'FE_Web(Provider)'
npm run typecheck
npm run build
```

Run `npm run smoke:demo-api` when provider dashboard API wiring changes.

## Landing Page Gate

Use this gate for public site or browser account-flow changes:

```sh
cd 'Landing Page'
npm run build
```

Inspect affected routes locally with `npm run dev` for material UI or form changes.

## Retired Phase Notes

The original scaffold phases are complete enough that future work should not restart from them. Use the current-state gates above and keep implementation moving through feature-specific vertical slices.
