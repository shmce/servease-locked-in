# Focused Platform Audit — 2026-05-18

Scope: `mobile`, `backend`, `admin`, and `Landing Page`. `FE_Web(Provider)` was intentionally excluded because the provider frontend is now integrated under `Landing Page/src/provider-app` and mounted at `Landing Page/src/app/provider/[[...slug]]/page.tsx`.

## Summary

Overall confidence is moderate. Backend, mobile, admin, and Landing Page all compile or test cleanly through their strongest local gates. The main unresolved risks are integration coverage gaps, missing packaged quality gates in Landing Page, incomplete live smoke coverage for admin, and route/navigation parity gaps between mobile and the merged provider web app.

## Checks Run

| Area | Status | Command / method | Result |
|---|---:|---|---|
| Backend | passed | `npm run test` in `backend` | 89 suites, 278 tests passed. |
| Backend | passed | `npm run build` in `backend` | TypeScript build completed with exit 0. |
| Backend | passed | `npx eslint "{apps,libs}/**/*.ts"` in `backend` | Non-mutating ESLint check completed with exit 0. |
| Backend | passed | `npm run check:migrations` in `backend` | All 73 repo migrations are applied, but live DB has 24 additional applied migrations not in repo. |
| Mobile | passed | `npm run lint` in `mobile` | Expo lint completed with exit 0. |
| Mobile | passed | `npm run typecheck` in `mobile` | TypeScript check completed with exit 0. |
| Mobile | passed | `npm test` in `mobile` | 57 tests passed. |
| Admin | passed | `npm run env:check` in `admin` | Required public admin env keys present. |
| Admin | passed | `npm run typecheck` in `admin` | TypeScript check completed with exit 0. |
| Admin | passed | `npm test` in `admin` | 11 files, 41 tests passed. |
| Admin | passed | `npm run build` in `admin` | Next production build completed with exit 0. |
| Admin | passed | `npm run smoke:routes` in `admin` | First failed with `fetch failed` because no server was running. After `npm run start -- --port 3001`, 10/10 checked routes returned 200. |
| Admin | blocked | `npm run smoke:integration` in `admin` | Blocked by missing `ADMIN_SMOKE_EMAIL`; `admin/.env.local` only has public gateway/Supabase keys. |
| Landing Page | passed | `npm run build` in `Landing Page` | Next production build completed with 34 generated app routes, including `/provider/[[...slug]]`. |
| Landing Page | passed | `npm run e2e` in `Landing Page` | Build plus Playwright merged-site suite passed: 7 tests. |
| Landing Page | passed | `for file in scripts/*.test.ts; do npx tsx "$file"; done` | 11 API proxy scripts exited 0, but there is no `npm test` script to run them. |

## Functional Areas

| Area | Status | Reason |
|---|---|---|
| Backend core services | Verified working | Full Jest suite, build, and non-mutating lint passed. |
| Backend migration state | Verified working | Repo migrations are applied, but `check:migrations` reports 24 applied live migrations not present in repo. |
| Mobile API client and domain helpers | Verified working | Mobile tests cover auth, bookings, geo, payments, support, provider availability, portfolio, preferences, notifications, and push registration. |
| Mobile provider navigation runtime | Not tested | API client and TypeScript are verified, but real device location permission, WebView route rendering, and OpenRouteService live response were not covered by automated tests. |
| Admin static build and route availability | Verified working | Build passed and route smoke returned 200 for `/login`, `/dashboard`, `/transactions`, `/support`, `/categories`, `/services`, `/service-providers`, `/reports/revenue`, `/reports/booking-analytics`, and `/backend-support`. |
| Admin live backend integration | Blocked from verifying | Integration smoke requires `ADMIN_SMOKE_EMAIL` and `ADMIN_SMOKE_PASSWORD`; these are not configured. |
| Landing Page public site and merged provider shell | Verified working | Production build passed and Playwright verifies public routes, customer login separation, provider login, unauthenticated provider redirects, public provider listing routes, and mobile public navigation. |
| Landing Page provider booking navigation | Verified failing | Provider booking details still generate Google Maps URL navigation instead of the new backend OpenRouteService directions endpoint. |

## Findings

### High — Admin live integration smoke is not runnable from current env

Evidence: `npm run smoke:integration` failed with `Missing ADMIN_SMOKE_EMAIL`. `admin/scripts/smoke-admin-integration.mjs` requires `ADMIN_SMOKE_EMAIL` and `ADMIN_SMOKE_PASSWORD` before it can authenticate through Supabase and call `/v1/me`, catalog, payment, and support admin endpoints.

Impact: admin can build and unit-test cleanly, but the audit could not verify admin against a real gateway/auth account.

### High — Landing Page provider navigation is behind mobile after ORS integration

Evidence: mobile now calls `/v1/geo/directions`, but `Landing Page/src/provider-app/components/BookingDetailsPage.tsx` still builds a Google Maps deep link at lines 536-556 and draws only a straight provider-to-destination route preview.

Impact: provider web users still leave the app for navigation and do not get the new in-app OpenRouteService route/turn-step flow.

### Medium — Landing Page has local API proxy tests but no package test script

Evidence: 11 files exist under `Landing Page/scripts/*.test.ts` and all passed when run manually with `npx tsx`, but `Landing Page/package.json` declares only `build`, `dev`, `e2e`, and `start`.

Impact: CI or local verification can miss customer/provider API proxy regressions unless someone remembers the manual loop.

### Medium — Landing Page has no declared lint or typecheck-only gate

Evidence: `Landing Page/package.json` has no `lint` or `typecheck` script. `next build` catches TypeScript, but there is no faster non-build check and no lint signal.

Impact: style, hook dependency, accessibility, and dead-code issues can land without a lightweight local gate.

### Medium — Migration drift check reports live-only migrations

Evidence: `npm run check:migrations` reported: `OK — 73 repo migrations are all applied (97 applied total, 24 applied but not in repo).`

Impact: deployment confidence is weaker because the live database contains migration history not represented in the repo.

### Medium — Admin still has visible placeholder/map gaps

Evidence: `admin/src/app/pages/ServiceAreas.tsx` shows `Interactive Map Coming Soon`; `admin/src/app/components/ProviderDetailsDrawer.tsx` shows `Map view placeholder`. `admin/src/app/config/backendSupportMatrix.ts` also marks Provider Applications and Finance as `partial`.

Impact: admin is functional for many backend-backed surfaces, but some operational screens are still not production-complete.

### Low — Mobile route manifest is stale after ORS work

Evidence: `mobile/src/navigation/claireRouteManifest.ts` still says provider navigation "opens external map directions through Linking" even though the mobile provider navigation screen now calls in-app directions.

Impact: documentation/navigation inventory can mislead future work planning.

### Low — Landing Page public catalog intentionally falls back to sample data

Evidence: `Landing Page/src/app/components/HomePage.tsx` renders `Live catalog is temporarily unavailable, so sample categories are shown.`

Impact: acceptable as graceful degradation, but production monitoring should distinguish fallback from healthy live catalog.

## Recommendations

1. Add admin smoke credentials and run integration smoke in CI or release checks.
   - Severity: high
   - Reason: route/build checks do not prove authenticated admin workflows work against the gateway.
   - Evidence trigger: `npm run smoke:integration` blocked on `ADMIN_SMOKE_EMAIL`.

2. Port OpenRouteService directions to Landing Page provider booking details.
   - Severity: high
   - Reason: mobile now has in-app ORS routing, while provider web still opens Google Maps externally.
   - Evidence trigger: `buildDirectionsUrl` in `Landing Page/src/provider-app/components/BookingDetailsPage.tsx`.

3. Add `npm test` to `Landing Page` for the existing `scripts/*.test.ts` files.
   - Severity: medium
   - Reason: tests exist and pass manually, but are not part of a standard command.
   - Evidence trigger: manual `npx tsx` loop passed 11 scripts; no `test` script exists.

4. Add `lint` and `typecheck` scripts to `Landing Page`.
   - Severity: medium
   - Reason: `next build` is useful but too coarse as the only static gate.
   - Evidence trigger: `Landing Page/package.json` lacks both scripts.

5. Reconcile the 24 live-only Supabase migrations.
   - Severity: medium
   - Reason: the repo should explain or contain every applied migration expected in shared environments.
   - Evidence trigger: migration drift output reports 97 applied total vs 73 repo migrations.

6. Decide which admin placeholders are acceptable for MVP and which need backend/UI completion.
   - Severity: medium
   - Reason: admin builds cleanly, but Service Areas and provider map views still show placeholder copy, and the support matrix still has partial areas.
   - Evidence trigger: placeholder strings in `ServiceAreas.tsx` and `ProviderDetailsDrawer.tsx`; partial statuses in `backendSupportMatrix.ts`.

7. Add mobile coverage for provider navigation state.
   - Severity: medium
   - Reason: route API client is covered, but the permission/error/loading UI around `expo-location` and directions rendering is not.
   - Evidence trigger: tests pass, but no test directly exercises `refreshProviderDirections` or the route WebView path.

8. Update stale route documentation.
   - Severity: low
   - Reason: stale manifest notes create wrong assumptions.
   - Evidence trigger: `claireRouteManifest.ts` still references external Linking for provider navigation.

## Unknowns

- I did not verify live admin authenticated workflows because smoke credentials are not configured.
- I did not run backend `smoke:all` because it performs live smoke and seed actions and is heavier than a read-only audit pass.
- I did not verify mobile on an actual iOS/Android simulator or device, so location permission prompts, native WebView map rendering, and push-token behavior remain unverified at runtime.
- I did not verify the OpenRouteService key against the live ORS API to avoid consuming route quota during an audit.
- I did not run a Landing Page lint/typecheck command because those scripts do not exist; build and E2E passed.

## Recommended Priority

1. Configure admin smoke credentials and make `smoke:integration` runnable.
2. Bring Landing Page provider navigation onto the same `/v1/geo/directions` contract as mobile.
3. Add standard `test`, `typecheck`, and `lint` scripts to `Landing Page`.
4. Reconcile live-only migrations.
5. Convert or explicitly defer admin map/service-area placeholders.
