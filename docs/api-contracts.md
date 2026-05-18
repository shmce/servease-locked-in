# API Contract Standards

## Purpose

API contracts define how the mobile app, gateway, and backend services communicate. Contracts must be written before implementation for every feature that crosses a process boundary.

## Public API Rules

- Mobile calls the API Gateway only.
- Browser apps call the API Gateway directly or through their own Next.js API proxy routes.
- Public routes should be versioned under `/v1`.
- Public responses use stable field names in camelCase.
- Public errors use a consistent envelope.
- Breaking changes require a new route version or compatibility layer.

## Internal Service API Rules

- Services communicate over HTTP using environment-defined base URLs.
- Internal endpoints may differ from public routes, but their contracts must be documented.
- Services should validate inbound gateway context and resource authorization.
- Service DTOs remain local to the owning service.
- Services must not import DTOs from another service to create a shared contract dependency.

## Client Boundary Rules

- `mobile/services` owns mobile API client code.
- `admin/src/services` owns admin dashboard API client code.
- `Landing Page/src/app/api/*` may proxy browser requests to the gateway when it needs server-side environment variables.
- Client apps may use Supabase publishable keys for browser/mobile auth.
- Client apps must not use Supabase service-role keys or call internal service ports.
- The provider web app should use gateway-backed provider endpoints as live data replaces local state.

## Request Shape

Each contract must define:

- Method and path.
- Authentication requirement.
- Required headers.
- Path parameters.
- Query parameters.
- Body schema.
- Validation rules.
- Idempotency key requirement, when applicable.

## Response Shape

Successful responses should use one of these shapes:

```json
{
  "data": {}
}
```

```json
{
  "data": [],
  "page": {
    "cursor": "next_cursor",
    "hasMore": true
  }
}
```

Use `data` for the primary payload. Use `page` only for paginated lists.

## Error Shape

Errors should use this shape:

```json
{
  "error": {
    "code": "booking_unavailable",
    "message": "This provider is not available at the selected time.",
    "details": {}
  }
}
```

`message` should be safe to show to users when returned from the gateway. Internal service errors may contain diagnostic details in logs, not in public responses.

## Status Codes

| Code | Use |
| ---: | --- |
| 200 | Successful read or synchronous update |
| 201 | Resource created |
| 202 | Accepted asynchronous operation |
| 204 | Successful deletion or empty action |
| 400 | Invalid request shape |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but not allowed |
| 404 | Resource not found or not visible |
| 409 | State conflict or idempotency conflict |
| 422 | Valid shape but failed business rule |
| 429 | Rate limit exceeded |
| 500 | Unexpected server failure |
| 503 | Dependency unavailable |

## Idempotency

Idempotency is required for:

- Booking creation.
- Booking status transitions.
- Payment intent creation.
- Refunds.
- Provider payout actions.
- Message send actions if retries can duplicate content.
- Push notification device registration and delivery actions when retries can duplicate side effects.
- Report schedule delivery and other admin background actions with external effects.

Contracts must define the idempotency header, storage owner, and conflict behavior.

## Authentication Context

Public clients send user authentication to the gateway. The gateway forwards trusted user context to internal services. Internal services still validate authorization for owned resources and do not trust client-provided role fields.

Admin routes require an admin-role context. Provider routes require provider ownership checks. Customer routes must verify the requested customer resource is visible to the caller.

## External Integrations

External shared-service integrations, including APICenter probing through `@implementsprint/sdk`, must stay behind backend service boundaries. Document the gateway route, the owning internal service, required environment variables, timeout behavior, and failure envelope before wiring a new integration into a client surface.

## Pricing Engine

- Public route: `POST /v1/pricing/quotes`
- Gateway handler: `gateway -> payment-service`
- Internal route: `POST /internal/pricing/quotes`
- Auth: customer
- Response: `quoteId`, `estimatedTotal`, `fairRangeMin`, `fairRangeMax`, `fairnessStatus`, `confidence`, `lineItems`, `signals`, and `explanation`.
- Booking handoff: `POST /v1/bookings` accepts `acceptedQuoteId`; the gateway validates the quote with Payment Service and uses the quote amount instead of trusting client-entered totals.
- Provider guidance: `POST /v1/provider/pricing/guidance` lets a provider check a proposed service price against the same fair-range engine before saving.

Admin pricing routes:

- `GET /v1/admin/pricing/rules`
- `PUT /v1/admin/pricing/rules`
- `GET /v1/admin/pricing/fuel-index`
- `POST /v1/admin/pricing/fuel-index`
- `GET /v1/admin/pricing/quote-audits`

## Contract Template

````md
## <Route Name>

- Public route: `POST /v1/bookings`
- Gateway handler: `gateway -> booking-service`
- Internal route: `POST /internal/bookings`
- Auth: customer
- Idempotency: required via `Idempotency-Key`

### Request

```json
{}
```

### Response

```json
{
  "data": {}
}
```

### Errors

- `422 booking_unavailable`
- `409 booking_duplicate`
- `503 booking_dependency_unavailable`
````
