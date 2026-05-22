# ServEase Documentation Index

This directory contains the source-of-truth documentation for the active ServEase repository.

## Start Here

- [Architecture](architecture.md): app layout, runtime topology, service boundaries, and ports.
- [Call Flows](call-flows.md): end-to-end request flows across clients, gateway, services, and service-owned schemas.
- [Workflow](workflow.md): spec-first development lifecycle from idea to handoff.
- [API Contracts](api-contracts.md): gateway, service, mobile, and web API contract standards.
- [Internal Service Contracts](internal-service-contracts.md): exact HTTP route inventory for service-to-service routes.
- [App Surface Contracts](app-surface-contracts.md): which mobile, admin, servease-web, and SDK clients consume each Gateway area.
- [Testing](testing.md): verification commands by app and change type.
- [Documentation Status](documentation-status.md): current source-of-truth docs, historical records, and coverage status.
- [GitHub Packages](github-packages.md): setup for `@implementsprint/sdk`.
- [Data Ownership](data-ownership.md): per-service schema ownership and Supabase usage rules.
- [Implementation Plan](implementation-plan.md): current implementation status and next acceptance gates.
- [Service Contract And Package Plan](specs/service-contract-package-plan.md): selected gateway boundary, service contract map, package units, rollout order, and Kafka/Databricks decision.
- [Catalog Browsing](specs/catalog.md): catalog browse contracts plus customer Popular and Top Rated ranking calculations.
- [Identity And Shared Service Contracts](specs/identity-shared-service-contracts.md): auth, current-user, preferences, referrals, and geo gateway/internal contracts.
- [Backend Deployment Systems](../backend/deploy/backend-systems.json): service deployable manifest for gateway and internal service package units.
- [API Center Tribe Manifest](../tribe-manifest.json): public gateway registration payload; internal service routes are not exposed.

## Specs And Records

- [Feature Specs](specs/README.md): approved feature specs for backend, mobile, admin, and workflow slices.
- [Feature Spec Template](templates/feature-spec.md): required structure for new feature specs.
- [Audits](audits/): dated findings and verification records.
- [Runbooks](runbooks/): operational setup, smoke checks, rollback, and troubleshooting notes.
  - [APICenter Owner Handoff](runbooks/apicenter-owner-handoff.md): copy-ready webhook registration request.
  - [Real-Device QA And Provider Handoff](runbooks/real-device-qa-provider-handoff.md): iOS/Android/Admin/servease-web QA checklist, APICenter blockers, and production provider configuration.
- [Superpowers Specs](superpowers/specs/): agent-created design specs for scoped changes.
- [Supabase Baseline](supabase-baseline.md): observed live database state and advisor findings.
- [Media Upload Spec](media-upload-spec.md): upload ownership, validation, and storage behavior.
- [Diagrams](diagrams/README.md): diagram package notes.

## App Documentation

- [Backend](../backend/README.md): NestJS gateway, services, commands, and environment.
- [Mobile](../mobile/README.md): Expo app structure, environment, and checks.
- [Admin](../admin/README.md): admin dashboard setup and demo account.
- [ServEase Web](../servease-web/README.md): public site, browser account flows, and provider dashboard setup.

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
