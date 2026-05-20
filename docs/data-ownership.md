# Data Ownership

Last verified from repository migrations: 2026-05-20.

## Purpose

Each service owns its data. This prevents hidden coupling and keeps service behavior testable through explicit HTTP contracts.

## Ownership Rules

- Each table belongs to exactly one service.
- Only the owning service reads or writes its tables.
- Other services request data through the owning service's HTTP API.
- The gateway does not access service tables.
- The gateway may access Supabase Storage for upload workflows.
- Migrations must name the owning service.

## Live Schema Alignment

The current Supabase project already has service-oriented schemas. Implementation should prefer these live schema names unless a later migration plan explicitly renames them.

See [Supabase Baseline](supabase-baseline.md) for the latest observed live state.

## Service Schemas

| Schema | Owner | Example Data |
| --- | --- | --- |
| `identity_and_user` | Auth Service and User Service | users, customer profiles, addresses |
| `provider_catalog` | Catalog Service | categories, service offerings, provider profiles, provider documents |
| `booking` | Booking Service and Availability Service | bookings, status transitions, provider availability, cancellation records |
| `payment` | Payment Service | payments, quotes, platform pricing, provider payouts |
| `messages` | Messaging Service | conversations, messages |
| `notification_and_support` | Notification Service and Support Service | notifications, support tickets |
| `trust_and_reputation` | Review Service | reviews, review responses, provider reports |

The schema set may be reduced during implementation if early slices do not need every service.

## Current Table Ownership Detail

Use this table when deciding where a feature belongs. It reflects the active
schema names and migration files under `backend/database`.

| Schema | Owning service | Representative owned data |
| --- | --- | --- |
| `identity_and_user` | Auth Service | users, account status, internal user context, sessions, two-factor state |
| `identity_and_user` | User Service | customer profiles, user addresses, notification preferences, referral summary source data |
| `provider_catalog` | Catalog Service | service categories, services, provider profiles, provider services, portfolio media, provider applications, provider application documents, review workflow metadata |
| `booking` | Booking Service | bookings, booking timeline events, cancellations, attachments, disputes, service updates, live locations |
| `booking` | Availability Service | provider availability windows, provider full-day blocks, provider partial-day time-off windows |
| `messages` | Messaging Service | conversations, conversation messages, message attachment metadata |
| `payment` | Payment Service | payments, APICenter checkout sessions, customer payment methods, provider payout methods, payout events, refunds, promotions, commission rules, pricing rules, fuel index snapshots, quote audits |
| `trust_and_reputation` | Review Service | reviews, review responses, review flags |
| `notification_and_support` | Notification Service | notifications, push devices, email/SMS delivery metadata |
| `notification_and_support` | Support Service | support tickets, support replies, support assignment/status data |

Provider availability is intentionally split at the service layer but remains in
the `booking` schema because booking creation and availability validation both
need schedule conflict checks. Cross-service access still goes through the
Availability Service HTTP contract.

## Data Shape Standard

Tables should include:

- `id` as the primary identifier.
- `created_at` and `updated_at` timestamps.
- `deleted_at` only when soft deletion is a product requirement.
- Service-local foreign keys only.
- External service references as opaque IDs, not database foreign keys across schemas.

## Cross-Service References

When one service stores another service's ID:

- Name the field after the external concept, such as `providerId` or `bookingId`.
- Treat the value as opaque.
- Do not enforce cross-schema database constraints.
- Validate existence through the owning service when the workflow requires it.

## Supabase MCP Checklist

Before schema changes:

1. List tables for the affected schemas.
2. Confirm the owning service.
3. Confirm no gateway database dependency is introduced.
4. Write migration SQL with service ownership noted.

After schema changes:

1. List tables again.
2. Run security advisors.
3. Run performance advisors.
4. Record findings in the handoff.

## Row Level Security

If services connect with privileged server credentials, authorization still belongs in service code. If direct client access is introduced later, every exposed table must have Row Level Security and policies documented before release.

## Storage

Supabase Storage may be used for:

- Provider portfolio images.
- Service proof-of-work images.
- Support attachments.
- Profile avatars.

Upload policy, bucket ownership, file size limits, allowed MIME types, and lifecycle rules must be defined in the feature spec before implementation.
