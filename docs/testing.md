# Testing And Verification

## Purpose

Testing should match the risk of the change. Shared contracts, booking state, payments, authorization, and user workflows require stronger verification than isolated display changes.

## Backend Checks

From `backend/`:

```sh
npm run lint
npm run test
npm run test:cov
npm run build
npm run check:migrations
npm run smoke:all
npm run verify
```

Use focused Jest commands for narrow changes, but run broader checks before handoff when shared services, contracts, guards, migrations, or persistence change. `npm run verify` includes lint, tests, build, production dependency audit, migration drift checks, and backend smoke coverage.

## Mobile Checks

From `mobile/`:

```sh
npm run typecheck
npm run lint
npm test
npm run smoke:demo-api
```

For UI work, verify the affected screens on the relevant target:

```sh
npm run ios
npm run android
npm run web
```

Use screenshots or screen recordings for material UI changes.

## Admin Checks

From `admin/`:

```sh
npm run env:check
npm run typecheck
npm test
npm run smoke:routes
npm run smoke:integration
npm run build
```

Use focused Vitest runs for narrow service or page changes. Run the smoke commands when gateway-backed admin behavior changes.

## Provider Web Checks

From `FE_Web(Provider)/`:

```sh
npm run typecheck
npm run smoke:demo-api
npm run build
```

Run `npm run dev` and inspect affected pages for visual or interaction changes.

## Landing Page Checks

From `Landing Page/`:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Run `npm run dev` and inspect affected public/account pages when routes, forms, or proxy handlers change.

## SDK Checks

From `packages/servease-sdk/`:

```sh
npm run typecheck
npm test
npm run build
```

Run these checks when public SDK methods, exported contract types, package metadata, or package documentation changes.

## Supabase Checks

For schema changes:

- Inspect existing tables before DDL.
- Apply migrations through the approved migration path.
- Run security advisors.
- Run performance advisors.
- Confirm no new cross-service database dependency.

## Contract Tests

Add contract tests when:

- A gateway route calls a service.
- A mobile API client depends on a response shape.
- A booking, payment, or provider workflow changes state.
- Error codes are part of user-facing behavior.

Contract tests should assert:

- Request validation.
- Response shape.
- Error envelope.
- Status codes.
- Authorization behavior.

## Workflow Tests

Add workflow tests for:

- Booking creation.
- Booking status transition.
- Provider accept or decline.
- Reschedule and cancellation.
- Payment and refund actions.
- Review submission.
- Support dispute creation.

## Documentation Checks

For documentation-only changes:

- Confirm links point to existing files.
- Confirm docs do not contradict `AGENTS.md`.
- Confirm commands match the package structure.
- Confirm package names, environment variables, and ports match the checked-in config files.
- Confirm historical specs and audits remain clearly separate from current source-of-truth docs.
- Confirm contract inventories still cover Gateway and internal service controller routes when API docs change.

## Handoff Format

Every handoff should include:

- Summary of changed behavior or documentation.
- Files changed.
- Verification commands and outcomes.
- Known skipped checks with reasons.
- Migration or environment notes, if any.
