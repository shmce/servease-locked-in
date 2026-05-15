# Development Workflow

## Purpose

This workflow operationalizes `AGENTS.md` for ServEase. It applies to backend services, the API Gateway, the Expo mobile app, Supabase changes, and documentation-only changes.

## Standard Feature Lifecycle

1. **Define the spec**
   - Create a spec in `docs/specs/` or near the feature.
   - Use `docs/templates/feature-spec.md`.
   - Include behavior, API contracts, data ownership, UI states, acceptance criteria, and verification commands.

2. **Confirm architecture fit**
   - Identify the owning service.
   - Confirm whether the gateway is only routing/orchestrating or handling Supabase Storage uploads.
   - Confirm no service needs cross-service database access.
   - Confirm all cross-service communication is HTTP through environment-defined URLs.

3. **Define data shape**
   - Name the owning schema/table for each persisted object.
   - Define DTOs within the owning service.
   - Avoid shared DTO packages across services.
   - Define migrations in `backend/database` when backend implementation begins.

4. **Define API contracts**
   - Write request, response, error, and status-code contracts before implementation.
   - Document gateway route shape separately from internal service route shape.
   - Include idempotency expectations for payment, booking, and status transition actions.

5. **Implement in vertical slices**
   - Backend: route/controller, DTO, service logic, persistence, tests.
   - Mobile: route/screen, API client, state handling, components, tests.
   - Keep each slice independently verifiable.

6. **Verify locally**
   - Run relevant backend or mobile checks from `AGENTS.md`.
   - Use narrower commands when a full suite is not yet possible, but document what was skipped and why.
   - For Supabase changes, inspect tables before DDL and run security/performance advisors afterward.

7. **Prepare handoff**
   - Summarize changed behavior.
   - List verification commands and outcomes.
   - Note migrations, environment variables, screenshots, or follow-up risks.

## Backend Workflow

- Keep `backend/` as a NestJS monorepo.
- Put runtime services in `backend/apps/*-service`.
- Put shared internal helpers in `backend/libs`, but keep DTOs service-local.
- Use `import 'dotenv/config'` and `ConfigModule.forRoot({ isGlobal: true })` in backend services.
- Start the gateway on port `5001`.
- Start services on ports `8501` through `8511`.
- Use only HTTP between services.

## Mobile Workflow

- Keep the Expo app under `mobile/`.
- Put routes in `mobile/app`.
- Put reusable UI in `mobile/src/components`.
- Put API clients in `mobile/services`.
- Put constants in `mobile/constants`.
- Put assets in `mobile/assets`.
- Match `DESIGN.md` tokens and interaction rules.

## Supabase Workflow

- Use Supabase MCP or CLI to inspect state before schema changes.
- Call `list_tables` before DDL.
- Call security and performance advisors after DDL.
- Do not let the gateway access service databases.
- Allow gateway Supabase access only for Storage uploads.
- Keep service database ownership explicit in the feature spec.

## Documentation Workflow

- Documentation changes should keep `AGENTS.md`, `DESIGN.md`, and `docs/` aligned.
- Add new docs only when they clarify workflow, contracts, architecture, or implementation acceptance criteria.
- Avoid stale planning docs by linking each spec to an implementation status.

## Definition Of Done

A feature is done when:

- The spec is complete and matches the implementation.
- API contracts are documented and tested.
- Data ownership is explicit.
- Relevant backend/mobile checks pass or skipped checks are explained.
- User-facing states cover loading, empty, error, and success paths.
- Handoff includes files changed, verification, and known risks.
