# Landing Page Catalog Integration Design

## Goal

Render live Supabase-backed catalog data on the `Landing Page/` homepage without changing backend code.

## Scope

- Fetch public catalog data from the existing API Gateway.
- Show live categories, services, and featured provider listings on the homepage.
- Keep static category content as a fallback if the gateway is unavailable or catalog data is empty.
- Do not edit `backend/`.

## Data Source

The landing app reads these public gateway routes through `SERVEASE_API_BASE_URL`:

- `GET /v1/catalog/categories`
- `GET /v1/catalog/services`
- `GET /v1/catalog/providers`

These routes do not require authentication.

## Rendering Behavior

- Homepage server-renders live catalog data using `Landing Page/src/app/lib/catalog.ts`.
- `/` is dynamic because it uses `cache: 'no-store'` for fresh gateway reads.
- Live categories replace the static service category labels when available.
- Services are shown in a "Services Available Now" section.
- Provider listings are shown in a "Featured Providers" section when provider data exists.
- If the gateway fails, sample categories remain visible and a small fallback note is shown.

## Backend Notes

No backend changes are required for this integration. The existing gateway and catalog service already expose the needed public routes.

## Verification

- `cd "Landing Page" && npm run build`
- Confirm homepage output includes live values such as `Home Cleaning`, `Deep Home Cleaning`, and `GreenFix Home Services` when the local backend seed data is available.
