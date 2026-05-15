# Testing And Verification

## Purpose

Testing should match the risk of the change. Shared contracts, booking state, payments, authorization, and user workflows require stronger verification than isolated display changes.

## Backend Checks

From `backend/` when backend exists:

```sh
npm run lint
npm run test
npm run test:cov
npm run build
```

Use focused Jest commands for narrow changes, but run broader checks before handoff when shared services, contracts, guards, or persistence change.

## Mobile Checks

From `mobile/` when mobile exists:

```sh
npm run typecheck
npm run lint
npm test
```

For UI work, verify the affected screens on the relevant target:

```sh
npm run ios
npm run android
npm run web
```

Use screenshots or screen recordings for material UI changes.

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
- Confirm status notes mention missing app scaffolds when applicable.

## Handoff Format

Every handoff should include:

- Summary of changed behavior or documentation.
- Files changed.
- Verification commands and outcomes.
- Known skipped checks with reasons.
- Migration or environment notes, if any.
