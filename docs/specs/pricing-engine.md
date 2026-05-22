# Feature Spec: Pricing Engine

## Status

- Owner: backend
- Owning service: Payment Service
- Owning schema: `payment`
- Created: 2026-05-19
- Implementation status: proposed

## Problem

Customers currently see prices that mostly come from provider-entered catalog listings. That makes it hard to know whether a quote is fair, especially when distance, travel time, gas or fuel prices, urgency, and local service norms affect the real cost. Providers still need flexibility, but ServEase should show a platform-calculated fair range and explain why a booking total is reasonable before the customer submits a request.

## Goals

- Produce a server-owned quote before booking creation.
- Show customers a fair-price band, final estimate, and line-item explanation.
- Account for provider service price, service category rules, estimated duration, travel distance, travel time, current gas/fuel index, urgency, and platform commission context.
- Flag provider prices that are materially below or above the platform fair range.
- Give admins controls for category baselines, travel fee rules, fuel index values, outlier thresholds, and quote audit review.
- Keep the API Gateway database-free and preserve pure HTTP communication between services.
- Keep provider-set prices as an input, not the only source of truth.

## Non-Goals

- Fully automated real-time fuel-market trading data in the first release.
- Surge pricing that changes every few seconds.
- Provider bidding or auction-style quotes.
- Adding Kafka, RabbitMQ, event buses, or cross-service database reads.
- Charging cards directly. Payment capture remains owned by existing payment flows.

## Recommended Approach

Use the existing Payment Service as the pricing-engine owner because `payment` already owns quotes, platform pricing, commission rules, payments, and provider payout math. Add a `pricing-engine` feature slice inside Payment Service and expose it through the API Gateway.

Alternative options were considered:

- Catalog-owned pricing: simpler near provider listings, but weak for quote persistence, payment handoff, and commission context.
- New Pricing Service: clean separation, but adds another service beyond the current reserved topology and increases operational cost.
- Booking-owned pricing: convenient during booking creation, but quote rules are financial policy and should not live in the lifecycle service.

Payment Service is the best fit because it can persist quote snapshots and later convert the accepted quote into a payment record without coupling the gateway to database state.

## Users And Roles

- Customer: requests an estimate, sees the fair range, accepts the quote, then submits a booking.
- Provider: sets base rates, sees when their rate is outside market range, and can adjust pricing.
- Admin: manages pricing rules, fuel index values, travel rules, and outlier thresholds.
- System: calculates quotes, stores quote snapshots, and validates accepted quote IDs during booking/payment workflows.

## User Experience

### Mobile Customer App

- Service detail shows provider price plus a compact "Fair estimate" preview.
- Booking form requests a quote after provider, address, schedule, and estimated hours are present.
- Review step shows:
  - fair range, for example `Fair range: ₱1,200 - ₱1,550`
  - estimated total
  - confidence level: `high`, `medium`, or `low`
  - line items: labor, travel/fuel, urgency, discount or adjustment
  - explanation text such as `Within typical rates for Home Cleaning in this area`
- If quote calculation fails, customer can still request booking only when the backend marks fallback pricing as allowed for that category.

### ServEase Web Customer Flow

- `servease-web/src/app/components/BookingRequestForm.tsx` should stop sending raw `listing.price` as the final amount.
- The form should call quote preview first, display the same fair-range summary as mobile, and submit `acceptedQuoteId` with the booking request.
- Public provider detail pages can show "From" pricing, but booking confirmation should use the server quote.

### Provider Dashboard In ServEase Web

- Provider onboarding and edit-services screens keep base price inputs.
- Add guidance beside base price:
  - `Below fair range`
  - `Within fair range`
  - `Above fair range`
- Providers can save prices outside the range, but the customer quote UI must disclose the difference and admins can review repeated outliers.

### Admin Dashboard

- Add a Pricing Engine section near Services, Commission, and Reports.
- Admin can manage:
  - category labor baselines
  - minimum visit fee
  - fuel price index by region
  - default vehicle efficiency assumptions
  - travel fee per kilometer caps
  - outlier thresholds
  - emergency or peak-hour multipliers
- Admin can audit quote history and inspect why a quote was marked high, low, or fair.

## Architecture

- Owning service: Payment Service.
- Gateway responsibility:
  - authenticate customer/provider/admin routes
  - validate request shape
  - call Catalog Service, User Service geo routes, and Payment Service over HTTP
  - normalize public errors
  - never query pricing tables directly
- Payment Service responsibility:
  - own pricing rule persistence
  - calculate quotes
  - persist accepted quote snapshots
  - expose admin rule management through Admin Service
  - expose internal quote validation for Booking Service and payment creation
- Catalog Service dependency:
  - provides provider listing, category, provider profile, base price, pricing mode, and provider service area metadata.
- User Service geo dependency:
  - geocodes customer address and computes route distance/duration using existing shared geo contracts.
- Booking Service dependency:
  - accepts `acceptedQuoteId` on booking creation and stores quote-derived amount fields in `booking.bookings`.
- Admin Service dependency:
  - proxies admin pricing rule and quote audit operations to Payment Service.

## Data Ownership

- Owning schema: `payment`.
- New tables:
  - `payment.pricing_rule_sets`
  - `payment.pricing_category_rules`
  - `payment.pricing_fuel_index_snapshots`
  - `payment.pricing_quote_snapshots`
  - `payment.pricing_quote_line_items`
  - `payment.pricing_outlier_reviews`
- Existing related tables:
  - `payment.platform_pricing_config`
  - `payment.commission_rules`
  - `payment.payments`
- External references stored as opaque IDs:
  - `providerId`
  - `serviceId`
  - `categoryId`
  - `customerId`
  - `bookingId`
- Migration required: yes, Payment Service-owned migrations under `backend/database`.

## Quote Formula

The first implementation should use deterministic rules, not AI.

Inputs:

- provider base price and pricing mode
- category baseline minimum and maximum
- estimated hours
- service address and provider origin/service-area centroid
- route distance and duration
- fuel index value for the configured region
- vehicle efficiency assumption
- schedule urgency and peak-hour rule
- admin-configured caps and floors

Calculation outline:

```text
laborSubtotal =
  hourly: clamp(providerHourlyRate * estimatedHours, categoryMin, categoryMax)
  flat: clamp(providerFlatRate, categoryMin, categoryMax)

fuelCost = (distanceKm / vehicleEfficiencyKmPerLiter) * fuelPricePerLiter
travelSubtotal = clamp(fuelCost * travelMultiplier + travelTimeFee, travelMin, travelMax)
urgencyAdjustment = laborSubtotal * urgencyMultiplier
estimatedTotal = roundToPeso(laborSubtotal + travelSubtotal + urgencyAdjustment)
fairRange = estimatedTotal +/- categoryFairBandPercent
```

Commission remains an internal payout calculation unless a later product decision adds a separate customer service fee. The customer-facing estimate should not double-count provider commission.

## Fairness Rules

- A quote is `within_range` when the provider-adjusted estimate falls inside the fair band.
- A quote is `above_range` when the estimate exceeds the upper band by the configured threshold.
- A quote is `below_range` when the estimate is below the lower band, which can indicate underpricing, missing scope, or provider risk.
- Low-confidence quote reasons include missing geocode, stale fuel index, missing category baseline, missing provider base rate, or unusually long route distance.
- Admin can allow, warn, or block quote acceptance per category and outlier severity.

## API Contracts

### Customer Quote Preview

- Method: `POST`
- Public route: `/v1/pricing/quotes`
- Internal route: `POST /internal/pricing/quotes`
- Auth: required
- Idempotency: optional for preview, required when accepting quote for booking.

Request:

```json
{
  "providerId": "uuid",
  "serviceId": "uuid",
  "serviceAddress": "123 Street, Barangay, City",
  "scheduledAt": "2026-06-01T09:00:00.000Z",
  "hoursRequired": 2,
  "bookingUrgency": "standard"
}
```

Response:

```json
{
  "data": {
    "quoteId": "uuid",
    "expiresAt": "2026-06-01T08:45:00.000Z",
    "currency": "PHP",
    "estimatedTotal": 1450,
    "fairRangeMin": 1200,
    "fairRangeMax": 1550,
    "fairnessStatus": "within_range",
    "confidence": "high",
    "lineItems": [
      { "code": "labor", "label": "Labor", "amount": 1200 },
      { "code": "travel_fuel", "label": "Travel and fuel", "amount": 250 }
    ],
    "signals": {
      "distanceKm": 8.4,
      "durationMinutes": 28,
      "fuelPricePerLiter": 68.25,
      "fuelIndexUpdatedAt": "2026-05-19T00:00:00.000Z"
    },
    "explanation": "This estimate is within typical rates for the selected service and travel distance."
  }
}
```

### Quote Acceptance During Booking

- Extend `POST /v1/bookings`.
- Add optional `acceptedQuoteId`.
- Booking Service validates the quote through Payment Service over HTTP before persisting `totalAmount`.
- If `acceptedQuoteId` is present, Booking Service uses the quote amount instead of trusting client-sent `serviceAmount`.

### Admin Pricing Rules

- `GET /v1/admin/pricing/rules`
- `POST /v1/admin/pricing/rules`
- `PATCH /v1/admin/pricing/rules/:ruleId`
- `GET /v1/admin/pricing/fuel-index`
- `POST /v1/admin/pricing/fuel-index`
- `GET /v1/admin/pricing/quote-audits`

Admin routes go Gateway -> Admin Service -> Payment Service over HTTP.

### Provider Pricing Guidance

- `POST /v1/provider/pricing/guidance`
- Auth: provider required.
- Returns fair range and status for a proposed service price before save.

## Error States

- `400 invalid_pricing_quote_request`
- `400 invalid_pricing_rule_request`
- `401 auth_required`
- `401 invalid_auth_token`
- `403 provider_profile_required`
- `403 admin_required`
- `404 provider_listing_not_found`
- `404 pricing_quote_not_found`
- `409 pricing_quote_expired`
- `409 pricing_quote_out_of_range`
- `422 pricing_quote_low_confidence`
- `503 pricing_dependency_unavailable`

## Security And Authorization

- Customers can request quotes only for active provider listings.
- Providers can request guidance only for their own provider profile.
- Admin pricing rule writes require admin auth and audit logging.
- Payment Service stores quote snapshots through service-role-only RPC functions.
- Public quote responses never expose admin-only rule internals or provider private coordinates.
- Accepted quotes expire quickly, for example after 15 minutes, to prevent stale fuel or distance assumptions from becoming final.

## Observability

- Structured logs:
  - `pricing_quote_requested`
  - `pricing_quote_calculated`
  - `pricing_quote_low_confidence`
  - `pricing_rule_updated`
  - `pricing_fuel_index_updated`
- Metrics:
  - quote calculation latency
  - dependency failure rate by Catalog/User/Payment Service
  - outlier rate by category
  - average estimate-to-final-booking delta
- Audit events:
  - admin rule changes
  - fuel index updates
  - blocked outlier acceptance

## Folder Impact

### `backend/`

- Add Payment Service feature slice:
  - `backend/apps/payment-service/src/features/pricing-engine/`
- Add API Gateway feature slice:
  - `backend/apps/api-gateway/src/features/pricing/`
- Add Admin Service proxy slice:
  - `backend/apps/admin-service/src/features/pricing/`
- Extend Booking Service create-booking flow to accept and validate `acceptedQuoteId`.
- Add Payment Service migrations and RPCs in `backend/database`.
- Add env vars:
  - `PRICING_QUOTE_TTL_SECONDS`
  - `PRICING_DEFAULT_FUEL_PRICE_PER_LITER`
  - `PRICING_DEFAULT_VEHICLE_EFFICIENCY_KM_PER_LITER`
  - `PRICING_ALLOW_LOW_CONFIDENCE_FALLBACK`

### `mobile/`

- Extend `mobile/services/serveaseApi.ts` with quote preview and quote acceptance types.
- Add domain helpers in `mobile/src/domain/booking.ts` for fairness labels and quote formatting.
- Update booking flow screens to request quote before review/submit.
- Update booking cards/details to show quote snapshot where available.
- Add tests for API shape, fallback states, and fairness labels.

### `servease-web/`

- Extend `servease-web/src/app/components/BookingRequestForm.tsx` to request a quote before submit.
- Extend `servease-web/src/app/components/ProviderDetailPage.tsx` to show quote preview entry points.
- Extend provider app service pricing forms:
  - `servease-web/src/provider-app/components/OnboardingPage.tsx`
  - `servease-web/src/provider-app/components/EditServicesPricingPage.tsx`
- Add browser API proxy support if the web app continues forwarding through Next.js API routes.

### `admin/`

- Extend `admin/src/services/serveaseAdminApi.ts` with pricing rules, fuel index, and quote audit endpoints.
- Add a Pricing Engine page and navigation entry.
- Add dashboards for outlier quotes, stale fuel index warnings, and category rule coverage.
- Add tests for admin API clients and page-level validation.

### Docs

- Update `docs/specs/booking.md` after implementation planning to include `acceptedQuoteId`.
- Update `docs/specs/payments.md` with quote-to-payment handoff details.
- Update `docs/api-contracts.md` with public pricing routes.

## Implementation Phases

### Phase 1: Quote Preview Foundation

- Build deterministic quote calculation in Payment Service.
- Store pricing rule sets, category rules, fuel snapshots, and quote snapshots.
- Expose customer quote preview through the gateway.
- Add backend unit and contract tests.

### Phase 2: Booking Integration

- Extend booking creation to accept `acceptedQuoteId`.
- Validate quote ownership, expiry, provider, service, and amount through Payment Service.
- Stop trusting client-provided `serviceAmount` when an accepted quote exists.
- Show quote snapshot on booking detail.

### Phase 3: Customer UI

- Add quote preview/review to mobile and servease-web booking flows.
- Add fair-range labels, line-item breakdown, confidence state, and failure fallback.
- Ensure mobile and servease-web use the same DTO semantics.

### Phase 4: Admin And Provider Controls

- Add admin rule management, fuel index management, and quote audit.
- Add provider price guidance in onboarding and edit-services.
- Add alerting for stale fuel index or high outlier categories.

## Testing Plan

- Backend unit tests:
  - formula calculation for flat and hourly pricing
  - fuel/travel calculation caps and floors
  - stale fuel index lowers confidence
  - out-of-range provider prices are flagged
  - quote expiry blocks booking acceptance
  - Booking Service rejects mismatched quote/provider/service/customer
- Backend contract tests:
  - Gateway `/v1/pricing/quotes`
  - Admin pricing rules routes
  - Provider pricing guidance route
- Mobile tests:
  - quote API client calls gateway
  - fairness label helper
  - booking submit includes `acceptedQuoteId`
- ServEase web tests:
  - quote preview before booking submit
  - fallback error state
- Admin tests:
  - rule validation before save
  - fuel index validation
  - quote audit table empty/error/success states

## Acceptance Criteria

- Customers see a server-calculated fair range before creating a booking.
- Quote totals account for provider price, category baseline, estimated hours, travel distance/time, and fuel index.
- Booking creation can persist an accepted quote and does not trust client-entered amount when quote exists.
- Providers receive guidance when their configured service price is outside the fair range.
- Admins can manage pricing rules and fuel index snapshots.
- Admins can audit quote calculations and outlier decisions.
- Gateway does not access pricing tables directly.
- No service reads another service's schema directly.
- All new backend communication remains HTTP-only.

## Verification Commands

```sh
# Backend
cd backend
npm run build
npm run lint
npm run test

# Mobile
cd mobile
npm run typecheck
npm test

# Admin
cd admin
npm run lint
npm test

# ServEase web
cd servease-web
npm run lint
npm test
```

## Product Decisions

- The first release uses admin-entered regional fuel index snapshots with stale-data warnings. A third-party fuel data provider can be added after the deterministic engine is stable.
- Above-range prices warn customers and feed admin review in the first release. Blocking should be reserved for regulated or high-dispute categories after there is quote history.
- Provider commission remains internal. The customer quote should explain the service, travel, fuel, and urgency costs without adding a separate customer service fee.
