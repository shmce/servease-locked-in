# Implementation Plan

## Purpose

This plan turns the approved ServEase documentation into an implementation sequence. It does not scaffold code by itself; it defines the order, acceptance gates, and verification required before each build phase is considered complete.

## Phase 0: Repository Foundation

### Goals

- Initialize source control if the project owner wants git tracking in this directory.
- Preserve the approved documentation as the project baseline.
- Add package workspaces only when backend or mobile scaffolding begins.

### Tasks

- Confirm whether `/Users/mac/ServEase` should become the git repository root.
- Keep `AGENTS.md`, `DESIGN.md`, and `docs/` at the root.
- Add a root `README.md` that links to the docs index once implementation starts.
- Add environment documentation for local service URLs and Supabase keys.

### Acceptance Criteria

- The repository root is explicit.
- Documentation links resolve.
- The implementation baseline can be reviewed before code scaffolding.

### Verification

```sh
find docs -type f | sort
rg -n "T[B]D|TO[D]O|coming[ ]soon" AGENTS.md DESIGN.md docs
git rev-parse --is-inside-work-tree
```

## Phase 1: Backend Workspace Scaffold

### Goals

- Create the NestJS monorepo under `backend/`.
- Establish the API Gateway and service app layout.
- Configure shared tooling without adding shared DTO coupling.

### Tasks

- Scaffold `backend/` as a NestJS workspace.
- Add `backend/apps/api-gateway`.
- Add initial service shells for auth, user, catalog, booking, and availability.
- Reserve ports `5001` and `8501` through `8511`.
- Add `ConfigModule.forRoot({ isGlobal: true })` and `import 'dotenv/config'`.
- Add health endpoints for gateway and services.
- Add `backend/database` for future migrations.

### Acceptance Criteria

- Gateway starts on port `5001`.
- Service shells start on their assigned ports.
- Services communicate only through configured HTTP URLs.
- No database access exists in the gateway except future Supabase Storage uploads.

### Verification

```sh
cd backend
npm run build
npm run lint
npm run test
```

## Phase 2: Supabase Baseline

### Goals

- Establish schema ownership before business data exists.
- Confirm Supabase MCP access and project configuration.
- Prepare migration conventions.

### Tasks

- List current Supabase tables.
- Define schema names for initial services.
- Create only the schemas needed by the first implemented vertical slice.
- Document required environment variables.
- Run Supabase security and performance advisors after DDL.

### Acceptance Criteria

- Each created schema has one owning service.
- No cross-service foreign keys exist.
- Advisor findings are recorded in the handoff.

### Verification

Use Supabase MCP:

- `list_tables`
- `apply_migration`, only for approved DDL
- `get_advisors` for security
- `get_advisors` for performance

## Phase 3: Auth And Profile Slice

### Goals

- Establish user identity, role context, and basic profiles.
- Give mobile flows a real authenticated user shape.

### Tasks

- Define auth/profile feature spec in `docs/specs/`.
- Implement gateway routes for current user and profile reads.
- Implement auth/user service routes.
- Add service-local DTOs.
- Add profile persistence in the owning schema.
- Add contract tests for gateway-to-service calls.

### Acceptance Criteria

- Customer and provider roles are represented consistently.
- Mobile can fetch current user context through the gateway.
- Unauthorized and forbidden responses use the standard error envelope.

### Verification

```sh
cd backend
npm run test
npm run build
```

## Phase 4: Catalog And Search Slice

### Goals

- Support marketplace browsing before booking.
- Define service categories and provider offerings.

### Tasks

- Write catalog feature spec.
- Implement category and offering read APIs.
- Add provider listing persistence.
- Add gateway routes under `/v1`.
- Add pagination and filtering contracts.

### Acceptance Criteria

- Customer can request categories and provider offerings through the gateway.
- Response shapes match `docs/api-contracts.md`.
- Catalog owns its schema and does not query booking or user tables directly.

### Verification

```sh
cd backend
npm run test
npm run build
```

## Phase 5: Booking Lifecycle Slice

### Goals

- Implement the first core marketplace workflow: booking request creation and status transitions.

### Tasks

- Write booking feature spec.
- Define booking states and allowed transitions.
- Add idempotent booking creation.
- Add provider accept, decline, reschedule, cancel, start, and complete actions as needed for the first release.
- Add workflow tests for state transitions.

### Acceptance Criteria

- Booking state is server-owned.
- Invalid transitions return `409` or `422` with standard error envelopes.
- Idempotent retries do not create duplicate bookings.

### Verification

```sh
cd backend
npm run test
npm run test:cov
npm run build
```

## Phase 6: Mobile Workspace Scaffold

### Goals

- Create the Expo app under `mobile/`.
- Implement role-aware navigation and API client structure.
- Apply `DESIGN.md` tokens.

### Tasks

- Scaffold Expo under `mobile/`.
- Create `mobile/app`, `mobile/src/components`, `mobile/services`, `mobile/constants`, and `mobile/assets`.
- Add design tokens from `DESIGN.md`.
- Add API clients for auth/profile, catalog, and booking.
- Add customer and provider navigation shells.

### Acceptance Criteria

- Mobile calls the gateway only.
- Customer and provider flows have distinct navigation.
- Design tokens are centralized and reusable.

### Verification

```sh
cd mobile
npm run typecheck
npm run lint
npm test
```

## Phase 7: Customer Booking Experience

### Goals

- Build the mobile customer path from browsing to booking confirmation.

### Tasks

- Implement marketplace home, category/search results, offering detail, booking form, and booking confirmation.
- Preserve booking form state across validation and network failures.
- Add loading, empty, success, and error states.
- Add tests for API clients and key user flows.

### Acceptance Criteria

- Customer can browse service offerings and submit a booking request.
- Booking failures are retryable without losing form data.
- UI follows `DESIGN.md` component and accessibility rules.

### Verification

```sh
cd mobile
npm run typecheck
npm run lint
npm test
npm run web
```

## Phase 8: Provider Job Experience

### Goals

- Build the provider path for handling booking requests and active jobs.

### Tasks

- Implement provider job list, request detail, accept/decline, reschedule, start, and complete flows.
- Add status history display.
- Add provider availability entry points.
- Add tests for state-dependent actions.

### Acceptance Criteria

- Provider actions map to documented booking transitions.
- Unavailable actions are disabled or hidden based on server state.
- Status changes remain consistent after refresh.

### Verification

```sh
cd mobile
npm run typecheck
npm run lint
npm test
```

## Phase 9: Marketplace Extensions

### Candidate Slices

- Messaging.
- Payments and payouts.
- Reviews.
- Notifications.
- Support and disputes.
- Admin operations.

Each extension requires its own feature spec before implementation.

## Global Rules

- Keep implementation vertical and testable.
- Do not add brokers, event buses, or cross-service database reads.
- Do not add shared DTO packages.
- Keep gateway database access limited to Supabase Storage upload workflows.
- Run Supabase advisors after DDL.
- Keep docs updated when architecture, contracts, or workflow change.
