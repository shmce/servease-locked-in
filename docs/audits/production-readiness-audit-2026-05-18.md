# ServEase Production Readiness Audit - 2026-05-18

## Summary

Scope audited: `backend`, `mobile`, `Landing Page`, and `admin`.

Overall confidence: moderate. Core compile/type/test/build checks are mostly healthy, but production readiness is blocked by a failing admin test, an admin production dependency advisory, unsafe localhost production fallbacks, and unresolved live-smoke coverage for workflows that mutate Supabase/demo data.

No application code was changed during this audit.

## Remediation Update - 2026-05-18

The repo-controlled findings from this audit were remediated after the original audit:

| Original item | Status | Evidence |
| --- | --- | --- |
| Admin broadcast test timeout | Fixed | `npm test` in `admin` now passes 13 files / 44 tests. The broadcast test uses deterministic events instead of slow typed interactions under full-suite load. |
| Production localhost fallbacks | Fixed for production app/client paths | Mobile, landing, and admin now use fail-fast gateway URL helpers. Localhost fallback remains only for non-production/local smoke contexts. |
| Admin-service `USER_SERVICE_URL` wrong fallback | Fixed | Fallback changed to `http://localhost:8502`, with `user-service.client.spec.ts` covering the default URL. |
| Admin `next -> postcss` audit advisory | Fixed | `admin` now pins transitive `postcss` through an npm override; `npm audit --omit=dev` reports 0 vulnerabilities. |
| Random simulated admin NBI/PRC verification | Fixed in the active admin page | `ProviderApplicationReview.tsx` no longer uses `Math.random` / `simulateVerify`; a source-level test guards against reintroducing it. |
| No non-mutating smoke profile | Improved | Added backend `npm run smoke:health`, which starts built services on isolated ports and checks `/health/live` without writing data. Existing admin `smoke:routes` remains the read-only web route smoke. |
| Admin missing lint gate | Fixed | Added `admin/eslint.config.mjs` and `npm run lint`; the lint gate exits 0. Generated Figma/pasted imports are ignored because they are not imported by the app and contain invalid pasted TSX. |

Verification evidence collected after remediation:

- Backend: `npx eslint "{apps,libs}/**/*.ts"`, `npm test` (90 suites / 282 tests), `npm run build`, `npm run smoke:health`, `npm run check:migrations`, `npm audit --omit=dev`.
- Mobile: `npm run typecheck`, `npm run lint`, `npm test` (67 tests), `npm audit --omit=dev`.
- Landing Page: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npx playwright test` (7 passed), `npm audit --omit=dev`.
- Admin: `npm run env:check`, `npm run lint`, `npm run typecheck`, `npm test` (44 tests), `npm run build`, `npm run smoke:routes`, `npm audit --omit=dev`.

Still externally blocked or intentionally not run:

- Native iOS/Android production builds require EAS/native signing credentials and were not run locally.
- Mutating Supabase/demo smoke scripts remain intentionally separate from the read-only gate; run them only against an isolated/resettable project.
- Real APICenter send/payment/live audit paths were not exercised because they can send messages or create payment checkouts without explicit live-test approval.

## Environment Detected

- Backend: NestJS microservices, `@nestjs/core` `^11.1.21`, npm lockfile, Jest, TypeScript build.
- Mobile: Expo `~54.0.33`, React `19.1.0`, npm lockfile, TypeScript, Expo lint, Node test runner through `tsx --test`.
- Landing Page: Next.js `16.2.6`, React `18.3.1`, npm lockfile, TypeScript, ESLint, Playwright.
- Admin: Next.js `16.2.6`, React `18.3.1`, npm lockfile, TypeScript, Vitest.
- Local env files present: `backend/.env`, `mobile/.env`, `Landing Page/.env`, `admin/.env.local`.

## Checks Run

### Backend

| Status | Command or method | Result |
| --- | --- | --- |
| passed | `npx eslint "{apps,libs}/**/*.ts"` | Exited 0. Used read-only ESLint because `npm run lint` includes `--fix`. |
| passed | `npm test` | 89 test suites passed, 281 tests passed. |
| passed | `npm run build` | TypeScript build exited 0. |
| passed | `npm run check:migrations` | 73 repo migrations are applied; 97 applied total; 24 applied but not in repo. |
| passed | `npm audit --omit=dev` | 0 production vulnerabilities. |
| not run | `npm run smoke:all` | Not run because the smoke chain seeds, updates, and marks live/demo Supabase data. |

### Mobile

| Status | Command or method | Result |
| --- | --- | --- |
| passed | `npm run typecheck` | Exited 0. |
| passed | `npm run lint` | Exited 0. |
| passed | `npm test` | 64 tests passed, 0 failed. |
| passed | `npm audit --omit=dev` | 0 production vulnerabilities. |
| not run | Native production build / EAS build | No local production build script is defined; EAS/native signing credentials were not exercised. |
| not run | `npm run smoke:demo-api` | Not run because it starts backend services and mutates demo API state, including notification read state. |

### Landing Page

| Status | Command or method | Result |
| --- | --- | --- |
| passed | `npm run typecheck` | Exited 0. |
| passed | `npm run lint` | Exited 0. |
| passed | `npm test` | Script tests exited 0. |
| passed | `npm run build` | Next production build exited 0; 34 app routes generated/validated. |
| passed | `npx playwright test` | 7 Chromium E2E tests passed against production `next start`. |
| passed | `npm audit --omit=dev` | 0 production vulnerabilities. |

### Admin

| Status | Command or method | Result |
| --- | --- | --- |
| passed | `npm run typecheck` | Exited 0. |
| failed | `npm test` | 1 failed test: `src/app/pages/PlaceholderPages.test.tsx` timed out at line 47; 41 tests passed. |
| passed | `npm run build` | Next production build exited 0; 3 pages generated/validated. |
| passed | `npm run env:check` | Required admin env keys present; gateway configured as `http://localhost:5001` in local env. |
| passed | `npm run smoke:routes` against `next start --port 3001` | 10 configured admin routes returned HTTP 200. |
| failed | `npm audit --omit=dev` | 2 moderate production vulnerabilities through `next -> postcss <8.5.10`. |
| not run | `npm run smoke:integration` / `npm run smoke:demo-api` | Not run because they require live admin credentials and mutate backend/demo state. |

## Functional Areas

| Area | Status | Evidence |
| --- | --- | --- |
| Backend compile and unit coverage | Verified working | ESLint, Jest, TypeScript build, migration drift, and production audit passed. |
| Backend live end-to-end workflows | Blocked from verifying | Smoke scripts write to Supabase/demo data; they were not run during a non-mutating audit. |
| Backend admin user dependency fallback | Verified failing risk | `backend/apps/admin-service/src/features/users/clients/user-service.client.ts:35` defaults `USER_SERVICE_URL` to `http://localhost:8506`, while user-service is `8502` in `.env.example` and README. |
| Mobile static quality | Verified working | Typecheck, lint, tests, and production audit passed. |
| Mobile native release artifact | Not tested | No native production build/EAS build was run. |
| Mobile API configuration safety | Verified failing risk | `mobile/services/serveaseApi.ts:828` falls back to `http://localhost:5001` when `EXPO_PUBLIC_API_BASE_URL` is missing. |
| Landing production web build | Verified working | Next build and Playwright E2E passed. |
| Landing API route configuration safety | Verified failing risk | Many API routes default to `http://localhost:5001`; example: `Landing Page/src/app/api/bookings/route.ts:4`. |
| Admin production web build and routes | Verified working | Next build passed and 10 smoke routes returned 200. |
| Admin test suite | Verified failing | Vitest timed out in `src/app/pages/PlaceholderPages.test.tsx:47`. |
| Admin production dependency security | Verified failing | `npm audit --omit=dev` reports moderate PostCSS advisory through Next. |
| Admin provider verification UX | Verified failing risk | `src/app/pages/ProviderApplicationReview.tsx:492` uses random simulated NBI/PRC verification. |

## Findings

### High - Admin test suite is not green

Evidence: `npm test` in `admin` failed. The failing test is `src/app/pages/PlaceholderPages.test.tsx:47`, `Broadcasts > submits the selected APICenter broadcast channels`, with a 5000 ms timeout.

Likely impact: CI/release gates should block admin deployment until this is fixed or deliberately quarantined. The affected workflow is admin broadcasts and APICenter channel submission.

### High - Production config can silently point clients/server routes at localhost

Evidence:

- Mobile API client fallback: `mobile/services/serveaseApi.ts:828`.
- Landing provider API fallback: `Landing Page/src/services/serveaseProviderApi.ts:553`.
- Landing API route fallback example: `Landing Page/src/app/api/bookings/route.ts:4`.
- Admin API client fallback: `admin/src/services/serveaseAdminApi.ts:588`.

Likely impact: A production build with a missing env var can compile successfully but fail at runtime by calling `localhost:5001` from a user device, browser, serverless function, or admin deployment.

### High - Admin-service user client has the wrong fallback port

Evidence: `backend/apps/admin-service/src/features/users/clients/user-service.client.ts:35` defaults `USER_SERVICE_URL` to `http://localhost:8506`. The repo documents user-service on `8502`, and `backend/.env.example:22` uses `USER_SERVICE_URL=http://localhost:8502`.

Likely impact: If `USER_SERVICE_URL` is missing in an environment, admin user summary/list/status routes will call the messaging-service port instead of user-service and return dependency errors.

### Medium - Admin production dependency audit fails

Evidence: `npm audit --omit=dev` in `admin` reports 2 moderate vulnerabilities: `next` depends on vulnerable `postcss <8.5.10` with advisory `GHSA-qx2v-qp2m-jg93`.

Likely impact: Security gate for admin production deploys is not clean. The suggested `npm audit fix --force` is unsafe because npm proposes a breaking downgrade path.

### Medium - Admin provider verification still contains simulated/random verification behavior

Evidence: `admin/src/app/pages/ProviderApplicationReview.tsx:492` sets verification to loading, then line 495 randomly returns `"verified"` or `"no-match"`.

Likely impact: Admin KYC decisions can be influenced by non-deterministic UI state rather than a real verification result. This is not production-grade for provider onboarding.

### Medium - Live workflow smoke coverage remains unverified

Evidence: Backend `smoke:all`, mobile `smoke:demo-api`, and admin `smoke:demo-api` / `smoke:integration` were not run because they seed or mutate Supabase/demo state.

Likely impact: Unit/build checks can pass while real auth, service-to-service HTTP, Supabase RPCs, APICenter integration, and demo data workflows are broken.

### Low - Admin has no lint script or ESLint config detected

Evidence: `admin/package.json` has no `lint` script, and no `eslint.config.*` / `.eslintrc*` was found under `admin`.

Likely impact: Admin style and static analysis issues can reach production despite typecheck/build passing.

## Recommendations

### 1. Fix admin broadcast test timeout before release

Severity: high.

Reason: The admin test suite is currently red.

Evidence trigger: `npm test` in `admin` timed out at `src/app/pages/PlaceholderPages.test.tsx:47`.

Concrete action: Inspect the Broadcasts component async path and the checkbox/button interaction in the test. Either make the component emit the mocked `sendAdminBroadcast` call reliably or update the test to wait for the loaded broadcast state before interacting.

### 2. Replace localhost production fallbacks with fail-fast env validation

Severity: high.

Reason: Missing production env currently becomes a runtime localhost call instead of an obvious startup/build failure.

Evidence trigger: Localhost fallbacks in mobile, landing, and admin API clients/routes.

Concrete action: Add shared env readers per app that throw clear errors when production env vars are absent. Keep localhost defaults only behind explicit development mode checks.

### 3. Correct the admin-service `USER_SERVICE_URL` fallback

Severity: high.

Reason: The fallback currently points to port `8506`, which belongs to messaging-service, not user-service.

Evidence trigger: `backend/apps/admin-service/src/features/users/clients/user-service.client.ts:35` conflicts with `backend/.env.example:22` and README service map.

Concrete action: Change the fallback to `http://localhost:8502` and add a focused unit test for the admin user client default.

### 4. Resolve the admin production audit advisory without `--force`

Severity: medium.

Reason: Admin production dependencies currently fail `npm audit --omit=dev`.

Evidence trigger: `next -> postcss <8.5.10` advisory in admin.

Concrete action: Upgrade to a patched Next/PostCSS dependency path when available, or use an npm override only after validating Next compatibility. Do not accept npm's forced downgrade suggestion blindly.

### 5. Replace simulated admin KYC checks with real integration state

Severity: medium.

Reason: Random verification is not acceptable for production provider approvals.

Evidence trigger: `ProviderApplicationReview.tsx:492-500`.

Concrete action: Wire NBI/PRC/TIN checks to a real backend/APICenter verification endpoint, or remove the simulated status from approval gating until the backend contract exists.

### 6. Create a non-mutating smoke profile for production gates

Severity: medium.

Reason: Existing smoke scripts are useful but too stateful for routine audit runs.

Evidence trigger: Backend/mobile/admin smoke scripts create users, seed data, update statuses, cancel bookings, resolve disputes, or mark notifications read.

Concrete action: Add read-only smoke commands for `/health/live`, `/v1/me`, catalog reads, route availability, and dependency probes. Keep mutating smoke tests behind explicit environment flags and isolated test projects.

### 7. Add admin linting to CI

Severity: low.

Reason: Admin currently lacks a lint quality gate.

Evidence trigger: No admin lint script/config detected.

Concrete action: Add an ESLint config matching the Next/React stack and a `npm run lint` script, then include it in the admin verification checklist.

## Unknowns

- Native iOS/Android production builds were not verified. No EAS/native release build was run.
- Backend full smoke chain was not verified because it mutates Supabase/demo data.
- Mobile/admin demo API smoke scripts were not verified because they mutate backend/demo state.
- Real APICenter send/payment/live audit paths were not exercised.
- Real production hosting configuration was not inspected beyond local env files and code fallbacks.
- Database RLS, grants, Supabase Storage policies, and live schema details were not audited beyond the migration drift check.

## Suggested Production Build Gate

Use this as the minimum pre-release gate after the findings above are fixed:

```bash
cd backend
npm ci
npx eslint "{apps,libs}/**/*.ts"
npm test
npm run build
npm run check:migrations
npm audit --omit=dev

cd ../mobile
npm ci
npm run typecheck
npm run lint
npm test
npm audit --omit=dev
# Then run EAS/native builds with production env:
# eas build --platform ios --profile production
# eas build --platform android --profile production

cd "../Landing Page"
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright test
npm audit --omit=dev

cd ../admin
npm ci
npm run env:check
npm run typecheck
npm test
npm run build
npm run smoke:routes
npm audit --omit=dev
```

Add a separate isolated smoke stage for mutating backend/mobile/admin demo workflows once a disposable Supabase project or guaranteed reset script is available.
