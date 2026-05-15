# Supabase Baseline

## Audit Date

2026-05-15

## Project

- Project URL: `https://bwubdvjyjssywfjyhrxj.supabase.co`
- Edge Functions: none reported.
- Migrations: none reported by MCP.
- Branch listing: unavailable through MCP because the branch tool returned `Project reference is missing when validating permissions`.

## Observed Schemas

The live database already contains service-oriented schemas. These are the observed schemas relevant to the planned ServEase architecture:

| Schema | Current Role | Rows Observed |
| --- | --- | ---: |
| `identity_and_user` | Users, customer profiles, addresses | 0 |
| `provider_catalog` | Provider profiles, services, categories, documents, provider status | 0 |
| `booking` | Bookings, cancellations, timeline, attachments, provider availability, disputes | 0 |
| `payment` | Payments, quotes, platform pricing, provider payouts | 0 |
| `messages` | Conversations and messages | 0 |
| `notification_and_support` | Notifications and support tickets | 0 |
| `trust_and_reputation` | Reviews, responses, provider reports | 0 |

## Installed Extensions

Installed extensions reported by MCP:

- `pgcrypto`
- `plpgsql`
- `pg_stat_statements`
- `supabase_vault`
- `uuid-ossp`

Many other extensions are available but not installed.

## Auth And Profile Tables

The initial auth/profile slice should use the existing live tables instead of creating new `auth_service` or `user_service` schemas.

### `identity_and_user.users`

Observed columns:

- `id uuid`
- `email text unique`
- `password_hash text`
- `full_name text`
- `contact_number text`
- `role text`, constrained to `customer`, `provider`, or `admin`
- `status text`, constrained to `active`, `suspended`, or `inactive`
- `created_at timestamptz`
- `updated_at timestamptz`

### `identity_and_user.customer_profiles`

Observed columns:

- `id uuid`
- `user_id uuid`
- `address text`
- `created_at timestamptz`

Foreign key:

- `customer_profiles.user_id -> identity_and_user.users.id`

### `identity_and_user.user_addresses`

Observed columns include `user_id`, label/address fields, city/province/region/barangay, default flag, latitude, longitude, and `created_at`.

Foreign key:

- `user_addresses.user_id -> identity_and_user.users.id`

### `provider_catalog.provider_profiles`

Observed columns include:

- `id uuid`
- `user_id uuid unique`
- `business_name`
- `bio`
- `service_description`
- `years_experience`
- `service_area`
- `languages text[]`
- `tags text[]`
- `service_radius_km`
- `home_latitude`
- `home_longitude`
- `verification_status`, constrained to `pending`, `approved`, or `rejected`
- `average_rating`
- `review_count`
- social links
- `is_active`
- timestamps

## Advisor Findings

### Security

Supabase security advisors reported many `RLS Enabled No Policy` findings. This means RLS is enabled, but policies are missing for tables in:

- `identity_and_user`
- `provider_catalog`
- `booking`
- `payment`
- `messages`
- `notification_and_support`
- `trust_and_reputation`

Remediation reference: <https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy>

For the current backend architecture, services are expected to connect with server credentials and enforce authorization in service code. If direct mobile/client access is introduced later, RLS policies must be written before release.

### Performance

Performance advisors reported:

- Unindexed foreign keys on booking, identity, provider catalog, and review response tables.
- Unused indexes on users, provider profiles, bookings, messages, and notifications.

Remediation references:

- <https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys>
- <https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index>

The unindexed foreign key findings should be fixed before high-volume booking, catalog, or review traffic. Unused index findings should not be acted on yet because the database currently has no production usage signal.

## Service RPC Functions

The custom service schemas are not exposed through Supabase REST. Backend services use service-role-only RPC functions in the exposed `public` API to read owned service data without exposing full schemas.

Applied local migration record:

- `backend/database/20260515_add_service_role_profile_rpc_functions.sql`

Functions:

- `public.servease_get_internal_user(uuid)`
- `public.servease_get_customer_profile(uuid)`
- `public.servease_get_provider_profile(uuid)`
- `public.servease_smoke_seed_customer(uuid, text)`
- `public.servease_smoke_cleanup_customer(uuid)`

Execution is revoked from `public`, `anon`, and `authenticated`, then granted to `service_role`.

## Baseline Decision

Do not create new auth/profile schemas at this point. The next implementation slice should align backend ownership with the existing live schemas:

- Auth/User services own `identity_and_user`.
- Catalog service owns `provider_catalog`.
- Booking service owns `booking`.
- Payment service owns `payment`.
- Messaging service owns `messages`.
- Notification and Support services share or split `notification_and_support` in a later spec.
- Review service owns `trust_and_reputation`.

## Immediate Risks

- `password_hash` exists in `identity_and_user.users`; service responses must never return it.
- RLS policies are missing across all observed tables.
- Current live schema names differ from the earlier proposed schema names in `docs/data-ownership.md`; implementation should prefer the live schema names unless a migration plan explicitly renames them.
- Branch listing could not be verified through MCP.
