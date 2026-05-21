# Documentation Status

Last verified from repository files: 2026-05-20.

This page explains which documentation files are current source-of-truth and
which files are historical records. It exists so future work can update active
docs without rewriting dated audits or implementation briefs.

## Current Source Of Truth

| Area | Current documents | Verification basis |
| --- | --- | --- |
| Repository rules | `AGENTS.md`, `docs/workflow.md` | Current root instructions and checked-in workflow docs |
| Architecture and ports | `docs/architecture.md`, `backend/README.md`, `backend/.env.example` | Backend app layout and package scripts |
| Public API contracts | `docs/api-contracts.md` | 186 API Gateway controller routes under `backend/apps/api-gateway/src` |
| Internal service contracts | `docs/internal-service-contracts.md` | 268 service controller routes under `backend/apps/*-service/src` |
| Call flows | `docs/call-flows.md`, `docs/diagrams/source/*.mmd` | Gateway/service controllers, app API clients, and regenerated Mermaid exports |
| App surface usage | `docs/app-surface-contracts.md` | Mobile, SDK, admin, landing, and provider-web API client files |
| Data ownership | `docs/data-ownership.md`, `backend/database/*.sql` | Current migration files and service-owned schemas |
| Verification commands | `docs/testing.md`, app `package.json` scripts | Current package scripts in backend, mobile, admin, provider web, landing page, and SDK |
| Feature specs | `docs/specs/*.md` | Active and historical feature-specific requirements |
| Operations | `docs/runbooks/*.md` | Current operational procedures and known external-service constraints |

## Historical Records

The following folders are records of previous audits, design briefs, and agent
work. They can contain dated statements that were true when written but are not
the primary source for current behavior:

- `docs/audits/`
- `docs/superpowers/specs/`

When a historical record conflicts with current code or active docs, keep the
record intact and add a dated follow-up or update the active source-of-truth doc.
Only edit a historical record when correcting an obvious factual error in that
record itself.

## Current Documentation Coverage

| Requirement | Evidence |
| --- | --- |
| Call flows are documented | `docs/call-flows.md` and diagram sources/exports |
| Public API contracts are documented | `docs/api-contracts.md` covers all Gateway controller paths |
| Internal API contracts are documented | `docs/internal-service-contracts.md` covers all service controller paths |
| App consumers are mapped | `docs/app-surface-contracts.md` maps mobile, SDK, admin, landing, and provider web |
| Service data ownership is documented | `docs/data-ownership.md` includes schema/table ownership detail |
| Verification commands are documented | `docs/testing.md` and `docs/implementation-plan.md` include backend, mobile, admin, provider web, landing, and SDK gates |
| Diagrams are documented | `docs/diagrams/README.md` indexes the diagram package and points to call flows |

## Update Rules

For documentation-only changes:

1. Update the active source-of-truth doc first.
2. Link historical records to a follow-up when they need current context.
3. Run markdown link checks for changed docs.
4. If contracts change, re-run Gateway and internal service route coverage checks.
5. If diagrams change, regenerate the affected exports.

