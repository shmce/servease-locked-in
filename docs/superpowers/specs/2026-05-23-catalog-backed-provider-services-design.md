# Catalog-Backed Provider Services Design

## Goal

Providers should visually choose real catalog categories and services during signup and while managing their services. The saved provider services must carry `serviceId` so they link to `provider_catalog.services.id`, which in turn links to `provider_catalog.services.category_id`.

## Current State

Provider signup collects a category and subcategory in the web flow, but it serializes them into `serviceDescription` text. Mobile signup collects only a free-text service description. Provider service setup and editing can save `serviceId`, but the visible UI usually sends free-text services without forcing a catalog-backed selection.

The backend already supports the normalized link:

- Global service: `provider_catalog.services.id`
- Global category: `provider_catalog.services.category_id`
- Provider service link: `provider_catalog.provider_services.service_id`
- Provider service API: `PUT /v1/provider/services`

## User Experience

Provider signup will load catalog categories and services from existing catalog endpoints. The provider selects a category first, then a service filtered to that category. The chosen service becomes the initial specialization.

Provider service setup and edit screens will use the same pattern for each service row:

- Category selector
- Service selector filtered by category
- Provider-specific title, description, price, pricing mode, and active state

The title can default to the selected catalog service name, but providers can still customize the displayed offering title.

## Backend Contract

Extend provider registration input to accept an optional `serviceId`.

When a provider registers with `serviceId`, the gateway will:

1. Create the auth/internal user.
2. Create the provider profile.
3. Create an initial provider-owned service linked to that `serviceId`.

If the owned-service creation fails, registration should clean up the created auth user just like provider profile failures do today.

The existing `PUT /v1/provider/services` contract remains the canonical way to manage provider services after signup.

## Data Flow

Signup:

1. UI loads `/v1/catalog/categories`.
2. UI loads `/v1/catalog/services?categoryId=<categoryId>`.
3. UI submits `/v1/auth/register` with provider profile fields plus `serviceId`.
4. Gateway creates provider profile and initial provider service.
5. Provider profile remains `pending` until admin approval.

Manage services:

1. UI loads catalog categories and services.
2. Existing provider-owned services load from `/v1/provider/services`.
3. UI maps each `serviceId` back to its catalog category.
4. Save sends `PUT /v1/provider/services` with `serviceId` preserved.

## Validation

Signup requires a selected catalog service for provider registration in both web and mobile flows. Provider service editing should require a selected catalog service for active service rows, while still preserving inactive legacy rows if they already exist without `serviceId`.

Backend registration should validate `serviceId` format when present. The provider-owned services RPC already ignores malformed service IDs by turning them into null, so the gateway/catalog layer should enforce a valid UUID before calling it.

## Testing

Add or update focused tests for:

- Web provider signup payload includes `serviceId`.
- Mobile provider signup sends `serviceId`.
- API gateway registration creates an initial provider-owned service after profile creation.
- API gateway cleanup still deletes the user if the initial provider service creation fails.
- Provider service edit/onboarding payloads preserve `serviceId`.
- Existing catalog browsing tests still pass.

## Acceptance Criteria

- A provider can select a real catalog category and service during signup.
- A newly registered provider has one `provider_catalog.provider_services` row linked by `service_id`.
- A provider can add or edit services with visible category/service selectors.
- Saving provider services sends `serviceId` for linked services.
- Customer catalog browsing and provider filtering can rely on normalized service links.
