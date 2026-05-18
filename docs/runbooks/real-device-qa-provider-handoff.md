# Real-Device QA And Provider Handoff

Last updated: 2026-05-18

## Purpose

Use this runbook before real-device QA and before handing ServEase provider
issues to APICenter, OpenRouteService, PayMongo, or Supabase owners.

This document separates verified local behavior from external provider blockers.
Do not treat an API-accepted status as proof of user delivery unless the provider
reports final delivery.

## Current Verification Snapshot

The following checks were run locally on 2026-05-18 after the OpenRouteService,
APICenter, admin, mobile, and Landing Page changes.

| Area | Evidence | Result |
| --- | --- | --- |
| Backend unit tests | `cd backend && npm run test` | 89 suites, 281 tests passed |
| Backend build | `cd backend && npm run build` | Passed |
| Backend lint | `cd backend && npx eslint "{apps,libs}/**/*.ts"` | Passed |
| Backend dependency audit | `cd backend && npm audit --omit=dev` | 0 vulnerabilities |
| Backend migrations | `cd backend && npm run check:migrations` | 73 repo migrations applied; 24 live-only migrations exist |
| Backend smoke | `cd backend && npm run smoke:all` | Passed |
| Mobile static checks | `cd mobile && npm run typecheck && npm run lint` | Passed |
| Mobile tests | `cd mobile && npm test` | 59 tests passed |
| Mobile API smoke | `cd mobile && npm run smoke:demo-api` | Passed |
| Admin env check | `cd admin && npm run env:check` | Passed |
| Admin static/tests/build | `cd admin && npm run typecheck && npm test && npm run build` | Passed |
| Admin route smoke | `cd admin && npm run smoke:routes` against `next start -p 3001` | 10 routes returned 200 |
| Admin integration smoke | `cd admin && npm run smoke:integration` against backend dev stack | Passed |
| Landing Page tests | `cd "Landing Page" && npm run test` | Passed |
| Landing Page static checks | `cd "Landing Page" && npm run typecheck && npm run lint` | Passed |
| Landing Page build/e2e | `cd "Landing Page" && npm run e2e` | Build passed; 6 Playwright tests passed, 1 skipped |

## APICenter Live Audit

Safe default command:

```sh
cd backend
npm run audit:apicenter-live
```

Default mode checks:

- Shared service discovery for `payment`, `gauth`, `otp`, `geo`, `email`, and
  `sms`.
- Google auth URL generation.
- Geo geocode.
- Geo reverse-geocode.
- Geo geofence.

Live delivery command:

```sh
cd backend
APICENTER_LIVE_AUDIT_SEND=true \
APICENTER_LIVE_AUDIT_PHONE=09399168168 \
APICENTER_LIVE_AUDIT_EMAIL=claireabas@gmail.com \
npm run audit:apicenter-live
```

Payment checkout command:

```sh
cd backend
APICENTER_LIVE_AUDIT_PAYMENT=true \
APICENTER_LIVE_AUDIT_PHONE=09399168168 \
APICENTER_LIVE_AUDIT_EMAIL=claireabas@gmail.com \
npm run audit:apicenter-live
```

OpenRouteService command:

```sh
cd backend
APICENTER_LIVE_AUDIT_OPENROUTESERVICE=true npm run audit:apicenter-live
```

Live observations from 2026-05-18:

- Email sent to the requested Gmail address through APICenter's email service.
  Provider reported `resend`, status `sent`.
- SMS accepted for the requested phone number, but APICenter reported
  `mock_sent`. The phone did not receive the text. This means the SMS route is
  not configured for real carrier delivery.
- OTP SMS generation returned a pending OTP for the requested phone number, but
  this shares the same SMS delivery risk.
- Google auth URL generation returned an `accounts.google.com` authorization
  URL using `servease://auth/google/callback`.
- Geo geocode and reverse-geocode returned Google Maps provider results for
  Manila.
- Geo geofence returned `inside: true`.
- PayMongo test-mode checkout creation and status lookup worked.
- PayMongo checkout cancellation failed during manual cleanup with timeout and
  502 responses.
- OpenRouteService returned a valid directions route for the Manila test route.

## APICenter Provider Blockers

### SMS

Status: blocked for production delivery.

Evidence:

- APICenter SMS send returned status `mock_sent`.
- The target handset did not receive the SMS.

Ask APICenter:

```text
ServEase can call the APICenter SMS shared service, but our SMS send returned
status "mock_sent" and the handset did not receive a carrier-delivered SMS.

Please confirm:
1. Is our tribe/account configured for real SMS delivery?
2. Which provider backs production SMS?
3. What sender ID, PH routing, account mode, or provider credentials are missing?
4. What final statuses should ServEase expect for queued, sent, delivered, and
   failed SMS messages?
5. Does OTP SMS use the same provider configuration as direct SMS send?
```

Required production configuration:

- APICenter tribe enabled for real SMS provider mode, not mock mode.
- Production SMS sender ID or approved sender route for Philippine numbers.
- Delivery status contract from APICenter.
- Retry/failure behavior documented for OTP and direct SMS.

### Google OAuth

Status: blocked for end-user sign-in until APICenter's Google OAuth app is
policy-compliant.

Evidence:

- APICenter returns a Google authorization URL.
- Google displays: `Error 400: invalid_request`.
- The Google error names the developer/app as `cicd-workflow-external`, which
  points to APICenter's Google Cloud OAuth project rather than ServEase-owned
  Google credentials.

Local ServEase fix already applied:

- `mobile/app.json` registers the `servease` URI scheme so mobile callbacks can
  return to the app.

Ask APICenter:

```text
ServEase receives a Google OAuth policy error for the APICenter gauth flow.
The Google error page names the app/developer as "cicd-workflow-external".

Please confirm:
1. Does the APICenter Google OAuth client allow
   servease://auth/google/callback?
2. Is the OAuth client type correct for mobile/native callback flows?
3. Is the Google OAuth consent screen verified or production-ready?
4. If APICenter requires HTTPS callbacks only, what exact HTTPS callback URL
   should ServEase send?
5. Are openid, email, and profile approved scopes for this APICenter client?
```

Required production configuration:

- Google OAuth app verified or otherwise compliant.
- Redirect URI strategy agreed with APICenter:
  - native custom scheme: `servease://auth/google/callback`, or
  - HTTPS callback controlled by ServEase and then deep-linked to the app.
- Approved scopes: `openid`, `email`, `profile`.
- Clear test-user policy if the OAuth app remains in testing mode.

### Payments

Status: checkout create/status works in test mode; cancellation endpoint needs
provider follow-up.

Evidence:

- APICenter created a PayMongo test checkout and status lookup returned a
  PayMongo test-mode session.
- Manual cancellation attempts returned timeout and 502.

Ask APICenter:

```text
ServEase PayMongo test checkout creation and status lookup work through
APICenter. Manual cancellation of the test checkout returned timeout and 502.

Please confirm:
1. Is /checkout/sessions/:id/cancelled expected to work for PayMongo test
   checkout sessions?
2. What response shape and statuses should ServEase expect after cancellation?
3. Are cancellation failures transient, unsupported, or a provider-side bug?
4. Are webhook events emitted for created, paid, failed, cancelled, and expired
   checkout sessions?
```

Required production configuration:

- `APICENTER_WEBHOOK_SECRET` shared between ServEase and APICenter.
- APICenter webhook URL configured:
  `https://<servease-api-domain>/v1/payments/webhooks/apicenter`.
- PayMongo production credentials configured in APICenter.
- Checkout success/cancel URLs updated to production ServEase URLs.
- Cancellation behavior clarified or removed from operational assumptions.

### Geo

Status: working through APICenter for geocode, reverse-geocode, and geofence.

Required production configuration:

- APICenter Google Maps/geo quota sized for expected ServEase traffic.
- Error and quota-exceeded response shapes documented.
- Service area geofence contract confirmed for production provider coverage.

### Email

Status: working through APICenter email service.

Evidence:

- APICenter email send returned provider `resend`, status `sent`.

Required production configuration:

- Production sender domain verified with the email provider.
- From-name/from-address agreed with APICenter.
- Bounce/complaint handling documented.
- Email templates and template IDs agreed if ServEase moves beyond raw text
  messages.

## OpenRouteService Handoff

Status: working for directions during live audit.

ServEase uses APICenter for geocoding and OpenRouteService for turn-by-turn
route geometry and directions.

Required production configuration:

- `OPENROUTESERVICE_API_KEY` set only in backend environments.
- No OpenRouteService key in mobile, Landing Page, or Admin public env files.
- Quota, rate limit, and paid-plan threshold reviewed for expected provider
  navigation usage.
- Fallback UX retained for missing route data.

## Mobile Real-Device QA Checklist

Before testing physical devices:

- Start backend locally with `cd backend && npm run dev`.
- For iOS simulator, set `EXPO_PUBLIC_API_BASE_URL=http://localhost:5001`.
- For Android emulator, set `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5001`.
- For physical devices, set
  `EXPO_PUBLIC_API_BASE_URL=http://<mac-lan-ip>:5001`.
- Keep `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set to the public Supabase values.
- Restart Expo with `npx expo start -c` after env changes.

Customer checks:

- Launch on iOS and Android.
- Sign in with the demo customer.
- Browse categories, services, and provider listings.
- Create a booking with a verified address.
- Confirm address verification uses APICenter geo.
- Open booking detail.
- View booking tracking and timeline.
- Start checkout and verify PayMongo test checkout opens.
- Return to app after checkout.
- Create a support ticket.
- View notifications.
- Update profile preferences.
- Request password reset.

Provider checks:

- Sign in with the demo provider.
- View provider dashboard.
- Open assigned booking detail.
- Move a booking through allowed status transitions.
- Open in-app navigation.
- Confirm the route polyline, distance, ETA, and turn steps render on iOS and
  Android.
- Add a service update.
- Open messages.
- Check availability and day-off management.
- Check payout views.

Auth/provider checks:

- Try Google sign-in and capture the exact Google error if APICenter still
  fails.
- Try phone OTP only after APICenter confirms SMS is no longer `mock_sent`.
- Confirm `servease://auth/google/callback` returns to the app on installed
  builds.

Evidence to capture:

- iOS screen recording for customer booking and provider navigation.
- Android screen recording for the same flows.
- Screenshot of any provider/API error.
- Device model, OS version, Expo Go or installed build version, and API base URL.

## Admin QA Checklist

Setup:

- Start backend with `cd backend && npm run dev`.
- Start admin with `cd admin && npm run dev`.
- Confirm `admin/.env.local` points to the backend gateway and public Supabase
  values.

Checks:

- Sign in as demo admin.
- Dashboard summary loads.
- Transactions list and detail load.
- Support tickets list and detail load.
- Categories and services load.
- Provider list and provider drawer load.
- Reports pages load.
- Backend support page loads.
- Admin integration status loads.
- Payment/dispute/refund actions are visible and role-guarded.

Automated checks:

```sh
cd admin
npm run env:check
npm run typecheck
npm test
npm run build
```

With servers running:

```sh
cd admin
npm run smoke:routes
npm run smoke:integration
```

## Landing Page And Provider Web QA Checklist

Setup:

- Start Landing Page with `cd "Landing Page" && npm run dev`.
- Start backend if testing authenticated or proxied API routes.

Public checks:

- Home page renders.
- About, FAQ, contact, login, register, and provider-registration routes render.
- Provider listing detail stays in the public shell.
- Customer login and registration forms call the expected API routes.
- Forgot-password flow submits without setup errors.

Provider web checks:

- `/provider/login` renders without the public shell.
- Unauthenticated provider dashboard redirects to provider login.
- Provider dashboard loads after auth.
- Provider booking detail loads.
- Directions stay inside the app/web route view and do not open Google Maps.
- Help center tickets and replies load.

Automated checks:

```sh
cd "Landing Page"
npm run test
npm run typecheck
npm run lint
npm run build
npm run e2e
```

## Backend QA Checklist

Automated checks:

```sh
cd backend
npm run test
npm run build
npx eslint "{apps,libs}/**/*.ts"
npm audit --omit=dev
npm run check:migrations
npm run smoke:all
```

Manual checks:

- Confirm no service crosses another service's database boundary.
- Confirm API Gateway only talks to services over HTTP except Supabase Storage
  uploads.
- Confirm service URLs and ports match `.env.example`.
- Confirm secrets are backend-only.

## Production Env Matrix

Backend only:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `APICENTER_URL`
- `APICENTER_TRIBE_ID`
- `APICENTER_TRIBE_SECRET`
- `APICENTER_WEBHOOK_SECRET`
- `OPENROUTESERVICE_API_KEY`
- `PASSWORD_RESET_REDIRECT_URL`
- `ADMIN_REPORT_DOWNLOAD_BASE_URL`
- Internal service URLs for ports `8501` through `8511`.

Mobile public:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Admin public/server runtime:

- Admin API base URL for the gateway.
- Public Supabase URL and publishable key.
- Admin smoke credentials only in local or CI secret stores.

Landing Page runtime:

- Gateway/API base URL.
- Public Supabase URL and publishable key.
- Any Next.js public env values must not include service-role, APICenter secret,
  webhook secret, or OpenRouteService key.

Never put these in mobile, Admin public env, or Landing Page public env:

- `SUPABASE_SERVICE_ROLE_KEY`
- `APICENTER_TRIBE_SECRET`
- `APICENTER_WEBHOOK_SECRET`
- `OPENROUTESERVICE_API_KEY`

## Release Gates

Do not call the external-provider stack production-ready until:

- APICenter SMS returns a real provider status beyond `mock_sent` and the phone
  receives a message.
- APICenter Google OAuth works through the chosen production redirect strategy.
- APICenter payment webhook is registered and verified in a non-local
  environment.
- PayMongo checkout cancellation behavior is clarified.
- OpenRouteService quota and rate limits are accepted.
- iOS and Android real-device QA recordings are captured.
- Migration drift is reconciled or explicitly accepted for the release.
