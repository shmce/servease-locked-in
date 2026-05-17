# Canonical Documentation Refresh Design

## Purpose

Refresh the active ServEase documentation so a developer can understand the current repository shape, install private GitHub Packages, run each app, and choose the right verification path without relying on stale planning notes.

## Scope

Update canonical and app-entry documentation:

- Root `README.md`.
- `docs/README.md`, `docs/architecture.md`, `docs/api-contracts.md`, `docs/testing.md`, `docs/workflow.md`, and `docs/implementation-plan.md`.
- Backend docs under `backend/`.
- App README files for `mobile/`, `admin/`, `FE_Web(Provider)/`, and `Landing Page/`.
- A dedicated GitHub Packages note for `@implementsprint/sdk`.

Historical specs, audits, pasted design artifacts, and copied Figma source notes stay intact unless an index needs to point to them. They are records, not current source-of-truth documents.

## Source Inputs

- `AGENTS.md` repository rules.
- Current package scripts in `backend/`, `mobile/`, `admin/`, `FE_Web(Provider)/`, and `Landing Page/`.
- Current backend service layout and `backend/.env.example`.
- Current GitHub Packages state for `ImplementSprint/sdk`, verified through `gh api`.

## Documentation Rules

- Keep architecture guidance aligned with HTTP-only microservices.
- Document the API Gateway as the only public backend boundary.
- Document Supabase service-role usage as backend-only.
- Document `@implementsprint/sdk` installation without committing tokens.
- Prefer current run and verification commands over planned scaffold language.

## Acceptance Criteria

- A new developer can identify every active app and its primary commands from the docs.
- Backend service ports, environment variables, and service boundaries are documented.
- GitHub Packages setup for `@implementsprint/sdk` is documented with `read:packages`.
- Testing guidance covers backend, mobile, admin, provider web, and landing page.
- Documentation-only verification confirms links resolve and changed docs contain no placeholder text.
