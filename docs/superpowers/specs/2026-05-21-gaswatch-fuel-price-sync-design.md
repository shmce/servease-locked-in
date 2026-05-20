# GasWatch PH Fuel Price Sync Design

## Status

Approved for implementation planning on 2026-05-21.

## Problem

The admin pricing engine currently depends on an admin manually entering the current fuel price through the fuel index workflow. That makes pricing less fair when prices move, creates recurring admin work, and can lower quote confidence when the fuel index becomes stale.

GasWatch PH publishes Philippine fuel prices sourced from DOE weekly advisories and community pump-price reports. The integration should use GasWatch PH as an external reference for automatic fuel index snapshots while preserving the existing manual override path.

## Goals

- Automatically refresh the pricing engine fuel index from GasWatch PH-backed fuel price data.
- Store every imported price as a payment-owned snapshot so quote calculations remain auditable.
- Keep manual admin fuel index creation as a fallback and emergency override.
- Show admins the latest source, effective time, and whether the current price was automated or manual.
- Preserve the existing microservice rule: API Gateway and Admin Service do not access databases directly, and services communicate over HTTP.

## Non-Goals

- Do not add Kafka, RabbitMQ, event buses, or cross-service database access.
- Do not scrape GasWatch PH aggressively or depend on undocumented internals without a fallback.
- Do not remove manual fuel entry.
- Do not calculate per-station routing costs in this first iteration.

## Recommended Approach

Add a payment-service fuel price sync path that imports a representative Metro Manila fuel price from GasWatch PH and creates a normal `payment.pricing_fuel_index_snapshots` row with `source = 'gaswatch-ph'`.

The first implementation should use the Metro Manila average diesel price as the default fuel index because ServEase travel cost is currently based on a generic vehicle efficiency value, not a customer/provider vehicle fuel type. Diesel is a conservative proxy for service-provider travel. The selected fuel type should be configurable through an environment variable so the product can switch to unleaded, average-of-diesel-and-unleaded, or region-specific logic later.

## Architecture

Payment Service owns the integration:

- `PricingFuelPriceProvider`: fetches and normalizes GasWatch PH fuel data.
- `GasWatchFuelPriceProvider`: concrete adapter for GasWatch PH.
- `PricingFuelSyncService`: decides whether a new snapshot should be created, validates ranges, and records the source.
- Existing `PricingEngineRepository`: continues to create and list `pricing_fuel_index_snapshots` through payment-owned RPCs.
- Existing admin routes: list the latest snapshots and can expose a "sync now" admin action through the same gateway -> admin-service -> payment-service HTTP chain.

API Gateway and Admin Service remain pass-through layers. They authenticate admin users, validate request shape, and call the owning service over HTTP.

## Data Flow

Scheduled sync:

1. A cron job or deployment scheduler calls `POST /internal/pricing/admin/fuel-index/sync`.
2. Payment Service fetches GasWatch PH fuel data.
3. Payment Service selects the configured region and fuel type.
4. Payment Service validates that the price is finite and within a realistic PHP-per-liter range.
5. Payment Service creates a fuel index snapshot with source metadata.
6. Quote calculation continues to select the newest matching fuel index by region.

Manual sync:

1. Admin taps "Sync from GasWatch PH" in the admin pricing screen.
2. API Gateway verifies the user is an admin.
3. API Gateway calls Admin Service.
4. Admin Service calls Payment Service.
5. Payment Service performs the same sync path and returns the created or latest unchanged snapshot.

Quote creation is unchanged except that the selected fuel index is expected to stay fresh automatically.

## Data Shape

Reuse `payment.pricing_fuel_index_snapshots`:

- `region`: `default` for first iteration, later `metro-manila`, `cavite`, `rizal`, or `laguna`.
- `fuel_price_per_liter`: selected numeric PHP-per-liter value.
- `source`: structured string such as `gaswatch-ph:diesel:metro-manila-average`.
- `effective_at`: GasWatch PH data date when available, otherwise sync time.
- `created_by`: admin user id for manual sync, null for scheduled sync.

No database table is required for the first iteration. If source metadata becomes richer, add a `source_details jsonb` column in a follow-up migration.

## External Source Policy

GasWatch PH does not appear to document a formal third-party API. The implementation must therefore isolate source-specific parsing behind `GasWatchFuelPriceProvider` and fail closed:

- Use documented or permissioned endpoints if GasWatch PH provides them.
- If only public site data is available, fetch at a low frequency, cache locally through snapshots, and keep manual entry available.
- Do not call GasWatch PH during quote calculation.
- If the source fails, leave the current fuel index untouched and report sync failure to admin logs/response.

## Error Handling

- Invalid or missing source data returns `pricing_fuel_sync_unavailable`.
- Out-of-range fuel prices are rejected and do not create snapshots.
- Network failures are retried by the scheduler, not inside customer quote creation.
- Stale snapshots continue to lower pricing confidence through the existing `staleFuelIndex` logic.
- Manual admin snapshots can override automated source failures immediately.

## Admin Experience

The pricing engine screen should keep the fuel index list and add:

- Latest fuel price card with value, source, effective time, and freshness state.
- "Sync from GasWatch PH" action.
- Manual "Add fuel price" action retained as fallback.
- Clear copy when automated sync fails: "Could not refresh GasWatch PH fuel price. The current fuel index is still being used."

## Testing

Backend tests:

- Provider parser maps GasWatch PH data into normalized fuel price candidates.
- Sync service creates a snapshot for valid data.
- Sync service skips duplicate unchanged source/effective snapshots where appropriate.
- Sync service rejects missing, non-finite, or unrealistic prices.
- Admin sync route preserves admin authentication and structured errors.
- Quote creation uses the latest automated snapshot exactly like manual snapshots.

Contract tests:

- API Gateway -> Admin Service -> Payment Service route shape for manual sync.
- Existing fuel index list response remains backward compatible.

## Acceptance Criteria

- Admins no longer need to manually enter fuel prices during normal operation.
- Pricing quotes use the latest synced GasWatch PH-backed fuel index.
- Manual fuel entry still works and can be used if GasWatch PH is unavailable.
- The source and effective timestamp are visible in admin fuel index history.
- No service except Payment Service owns or writes fuel index snapshot data.
