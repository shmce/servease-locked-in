# ServEase Documentation Index

This directory turns `AGENTS.md` into working project documentation for future implementation.

## Documents

- [Workflow](workflow.md): feature lifecycle from idea to handoff.
- [Implementation Plan](implementation-plan.md): phased build order and acceptance gates.
- [Architecture](architecture.md): backend and mobile structure, service boundaries, and runtime ports.
- [API Contracts](api-contracts.md): gateway and service contract conventions.
- [Data Ownership](data-ownership.md): per-service schema ownership and Supabase usage rules.
- [Supabase Baseline](supabase-baseline.md): observed live database state and advisor findings.
- [Testing](testing.md): verification expectations for backend, mobile, and documentation changes.
- [Feature Spec Template](templates/feature-spec.md): required structure for new feature specs.
- [Mobile App Design Spec](specs/mobile-app-design.md): screen-level customer and provider mobile design requirements.

## Canonical Inputs

- `AGENTS.md` defines repository rules and agent operating constraints.
- `DESIGN.md` defines product experience, visual system, and screen-level design acceptance criteria.

When documents conflict, use this order:

1. Direct user instruction.
2. `AGENTS.md`.
3. `DESIGN.md`.
4. Files in `docs/`.

## Documentation Rule

Every implementation feature should start with a focused spec near the feature or in `docs/specs/`. The spec must define behavior, API contracts, data shape, acceptance criteria, and verification commands before code is written.
