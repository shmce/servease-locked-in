# ServEase Documentation Index

This directory contains the source-of-truth documentation for the active ServEase repository.

## Start Here

- [Architecture](architecture.md): app layout, runtime topology, service boundaries, and ports.
- [Workflow](workflow.md): spec-first development lifecycle from idea to handoff.
- [API Contracts](api-contracts.md): gateway, service, mobile, and web API contract standards.
- [Testing](testing.md): verification commands by app and change type.
- [GitHub Packages](github-packages.md): setup for `@implementsprint/sdk`.
- [Data Ownership](data-ownership.md): per-service schema ownership and Supabase usage rules.
- [Implementation Plan](implementation-plan.md): current implementation status and next acceptance gates.

## Specs And Records

- [Feature Specs](specs/README.md): approved feature specs for backend, mobile, admin, and workflow slices.
- [Feature Spec Template](templates/feature-spec.md): required structure for new feature specs.
- [Audits](audits/): dated findings and verification records.
- [Runbooks](runbooks/): operational setup, smoke checks, rollback, and troubleshooting notes.
  - [APICenter Owner Handoff](runbooks/apicenter-owner-handoff.md): copy-ready webhook registration request.
- [Superpowers Specs](superpowers/specs/): agent-created design specs for scoped changes.
- [Supabase Baseline](supabase-baseline.md): observed live database state and advisor findings.
- [Media Upload Spec](media-upload-spec.md): upload ownership, validation, and storage behavior.
- [Diagrams](diagrams/README.md): diagram package notes.

## App Documentation

- [Backend](../backend/README.md): NestJS gateway, services, commands, and environment.
- [Mobile](../mobile/README.md): Expo app structure, environment, and checks.
- [Admin](../admin/README.md): admin dashboard setup and demo account.
- [Provider Web](../FE_Web(Provider)/README.md): provider dashboard setup.
- [Landing Page](../Landing%20Page/README.md): public site and account-flow setup.

## Canonical Inputs

- `AGENTS.md` defines repository rules and agent operating constraints.
- `DESIGN.md` defines product experience, visual system, and screen-level design acceptance criteria.
- Files in `docs/` define implementation workflow, contracts, and verification expectations.

When documents conflict, use this order:

1. Direct user instruction.
2. `AGENTS.md`.
3. `DESIGN.md`.
4. Files in `docs/`.
5. App-specific README files.

## Documentation Rule

Every implementation feature should start with a focused spec near the feature or in `docs/specs/`. The spec must define behavior, API contracts, data shape, acceptance criteria, and verification commands before code is written.

Historical specs and audits are records. Update them only when a new finding explicitly supersedes an old one; otherwise add a dated follow-up.
