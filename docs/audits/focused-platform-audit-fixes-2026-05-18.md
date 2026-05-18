# Focused Platform Audit Fix Notes - 2026-05-18

Follow-up to `docs/audits/focused-platform-audit-2026-05-18.md`.

## Fixed in this pass

- Landing Page provider booking details now uses the gateway `/v1/geo/directions` contract and renders OpenRouteService route geometry and turn steps inside the existing MapLibre route preview.
- Landing Page now has package-level `test`, `typecheck`, and `lint` scripts. The test script runs the existing `scripts/*.test.ts` checks through `tsx`.
- Mobile route inventory now describes provider navigation as in-app OpenRouteService directions through the gateway.
- Mobile source coverage now checks that provider navigation calls the geo gateway path instead of opening an external map URL.
- Admin service-area and provider-location map placeholders were replaced with deterministic map previews based on the current admin service-area/location data.
- Admin smoke credential requirements are documented in `admin/README.md`, and the integration smoke script now reports the exact `.env.local` action required when credentials are missing.

## Still externally blocked

- Admin live integration smoke still requires valid `ADMIN_SMOKE_EMAIL` and `ADMIN_SMOKE_PASSWORD` for an active admin user in the target Supabase project.
- The 24 live-only Supabase migrations cannot be reconstructed safely from local code alone. They need either exported SQL from the live migration history or an explicit decision that they are historical environment drift.
- Production-grade admin coverage maps still need backend-owned service-area geometry or coordinates. The current UI no longer displays placeholder copy, but it is a preview built from the admin's current local service-area data.
- Landing Page public catalog fallback remains intentional graceful degradation. The UI already labels sample categories when live catalog is unavailable; production alerting for that fallback should be handled by deployment/runtime monitoring.
