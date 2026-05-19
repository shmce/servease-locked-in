# Architecture

## System Shape

ServEase is a marketplace platform with five active application surfaces:

- `backend/`: NestJS monorepo with an API Gateway and independent HTTP services.
- `mobile/`: Expo React Native customer and provider app.
- `admin/`: Next.js admin dashboard for internal operations.
- `FE_Web(Provider)/`: Next.js provider dashboard.
- `Landing Page/`: Next.js public site, account flows, and browser API proxy routes.
- Supabase: service-owned persistence, public auth keys for clients, backend-only service-role access, and Storage for uploads.

The backend uses true microservices with pure HTTP communication. Do not add Kafka, RabbitMQ, event buses, or direct cross-service database access.

## Runtime Topology

| Component | Port | Responsibility |
| --- | ---: | --- |
| API Gateway | 5001 | Public API, auth boundary, request routing, upload handling |
| Auth Service | 8501 | Identity profile, sessions integration, role context |
| User Service | 8502 | Customer/provider profile data |
| Catalog Service | 8503 | Service categories, offerings, provider service listings |
| Booking Service | 8504 | Booking lifecycle and scheduling requests |
| Availability Service | 8505 | Provider availability, blackout windows, calendar reads |
| Messaging Service | 8506 | Conversation and message metadata |
| Payment Service | 8507 | Payment intent, payout, refund, ledger coordination |
| Review Service | 8508 | Ratings and review summaries |
| Notification Service | 8509 | Email, SMS, push notification dispatch |
| Support Service | 8510 | Disputes, issue reports, support cases |
| Admin Service | 8511 | Internal operations and moderation |

Ports `8501` through `8511` are reserved for backend services and are reflected in `backend/.env.example`.

## Service Boundary Rules

- A service owns its schema and tables.
- A service can read or write only its own database objects.
- If a service needs another service's data, it calls that service over HTTP.
- The gateway does not query service databases.
- Shared libraries may contain utilities, guards, logging, and HTTP clients, but not shared DTO contracts that couple services.
- Every service exposes health and readiness endpoints.

## Gateway Responsibilities

The API Gateway:

- Authenticates public requests and forwards user context.
- Applies a gateway-level request rate limit through `API_GATEWAY_RATE_LIMIT_MAX` and `API_GATEWAY_RATE_LIMIT_WINDOW_MS`.
- Routes requests to backend services.
- Normalizes public error envelopes.
- Enables CORS for configured mobile/web origins through `API_GATEWAY_CORS_ORIGINS`.
- Handles upload flows that require Supabase Storage.
- Does not own business data.

Current gateway feature areas include current-user, registration, catalog, booking, availability, messaging, notifications, payments, reviews, support, uploads, referrals, preferences, provider data, and admin operations.

## Mobile Responsibilities

The mobile app:

- Talks to the gateway, not directly to backend services.
- Keeps customer and provider navigation distinct.
- Uses typed API clients under `mobile/services`.
- Handles offline and network-failure states for user-entered forms.
- Reflects server-side booking state rather than inventing local status.

## Web Responsibilities

The web apps use the gateway as their backend boundary:

- `admin/` calls `/v1/admin/...` gateway routes with an admin Supabase bearer token.
- `FE_Web(Provider)/` is the provider dashboard surface and should use gateway-backed provider APIs as live wiring is completed.
- `Landing Page/` serves public marketing/account flows and has Next.js API proxy routes under `src/app/api/*` that forward to the gateway through `SERVEASE_API_BASE_URL`.

Browser apps may use Supabase publishable keys for authentication. They must never include Supabase service-role keys.

## Cross-Cutting Concerns

### Authentication

Authentication should be validated at the gateway. Services receive trusted user context from the gateway and still validate authorization for their owned resources.

### Observability

Every service should use structured logs with request IDs. Gateway requests should propagate correlation IDs to internal service calls.

### Configuration

All service URLs must come from environment variables. Do not hardcode service hostnames or ports inside business logic.
Browser-accessed mobile builds must configure `API_GATEWAY_CORS_ORIGINS` as a comma-separated list of allowed origins. Local development defaults include Expo web localhost ports; production defaults to no browser origins unless explicitly configured.
Gateway rate limits default to 120 requests per minute per client address and can be tuned with `API_GATEWAY_RATE_LIMIT_MAX` and `API_GATEWAY_RATE_LIMIT_WINDOW_MS`.

Backend APICenter integration probing uses `@implementsprint/sdk` with optional `APICENTER_URL`, `APICENTER_TRIBE_ID`, `APICENTER_SERVICE_ID`, and `APICENTER_TRIBE_SECRET` environment variables. With SDK 1.2.x, `APICENTER_TRIBE_ID` is the owning tribe principal and `APICENTER_SERVICE_ID` can identify the registered backend service for event attribution.

### Migrations

Migrations live in `backend/database`. Each migration must identify the owning service and schema.

## Current Implementation Focus

The repository now contains service shells and feature slices for the gateway, auth/user, catalog, booking, availability, messaging, payments, reviews, notifications, support, and admin. New work should continue in vertical slices:

1. Update or create a feature spec.
2. Confirm the owning service and schema.
3. Implement gateway contract, internal service contract, persistence, client wiring, and focused tests together.
4. Verify with the app-specific commands in [Testing](testing.md).
