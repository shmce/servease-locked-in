# Production Release Readiness

Use this runbook when cutting a production release for `backend`, `mobile`, `servease-web`, and `admin`.

## Required GitHub Production Secrets

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `APICENTER_URL`
- `APICENTER_TRIBE_ID`
- `APICENTER_SERVICE_ID`
- `APICENTER_TRIBE_SECRET`
- `OPENROUTESERVICE_API_KEY`
- `ADMIN_SMOKE_EMAIL`
- `ADMIN_SMOKE_PASSWORD`
- `EAS_TOKEN`

Optional when APICenter webhook delivery is registered:

- `APICENTER_WEBHOOK_SECRET`

## Required GitHub Production Variables

- `NEXT_PUBLIC_API_BASE_URL`
- `API_GATEWAY_CORS_ORIGINS`
- `AUTH_SERVICE_URL`
- `USER_SERVICE_URL`
- `CATALOG_SERVICE_URL`
- `BOOKING_SERVICE_URL`
- `AVAILABILITY_SERVICE_URL`
- `MESSAGING_SERVICE_URL`
- `PAYMENT_SERVICE_URL`
- `REVIEW_SERVICE_URL`
- `NOTIFICATION_SERVICE_URL`
- `SUPPORT_SERVICE_URL`
- `ADMIN_SERVICE_URL`
- `SUPABASE_STORAGE_BUCKET`
- `EAS_PROJECT_ID`

## Required Branch Flow And Protection

Use the promotion flow `test -> uat -> main`.

Protect all three branches in GitHub:

- `test`
- `uat`
- `main`

Require pull requests for promotion, block direct pushes, require at least one non-author approval, and require the `Production readiness` status checks before merging. Do not bypass failed E2E, k6, lint, typecheck, test, coverage, audit, or secret-scan checks.

## Required Mobile Promotion Variables

Configure one of these repository variables so the mobile promotion gate can identify the mobile system metadata:

- `MOBILE_SINGLE_SYSTEMS_JSON`
- `MOBILE_MULTI_SYSTEMS_JSON`

Configure the mobile promotion policy variables per environment:

- `MOBILE_K6_ENABLED=true` to enforce the k6 smoke gate.
- `MOBILE_K6_BASE_URL` to point k6 at the gateway/API Center URL for the branch environment.
- `MOBILE_DETOX_ANDROID_ENABLED=true` to enforce Android Detox E2E on runners with an Android emulator.

The repository keeps iOS Detox configuration in `mobile/.detoxrc.js`; run iOS Detox on macOS runners when the shared orchestrator provides the simulator lane.

## Required Expo Production Environment Variables

Configure these in the Expo project production environment before running EAS builds:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The `mobile/eas.json` production profile uses `"environment": "production"` so EAS builds pull these values from Expo.

## Local Preflight

Run the non-mutating gates before triggering release verification:

```bash
node scripts/verify-production-workflows.mjs
node scripts/verify-production-env-templates.mjs
node scripts/production-preflight.mjs
```

To run a single suite, pass its name:

```bash
node scripts/production-preflight.mjs backend
node scripts/production-preflight.mjs mobile
node scripts/production-preflight.mjs landing
node scripts/production-preflight.mjs admin
```

Use `--list` to print the commands without running them.

Each preflight command has a default 15 minute timeout. Override it when needed:

```bash
PREFLIGHT_COMMAND_TIMEOUT_MS=1800000 node scripts/production-preflight.mjs
```

When running with real production-shaped environment values loaded, include the production env guards:

```bash
node scripts/production-preflight.mjs --include-env
```

## Production Env Templates

Copy and fill these templates in the matching deployment environment:

- `backend/.env.production.example`
- `mobile/.env.production.example`
- `servease-web/.env.production.example`
- `admin/.env.production.example`

## Production Verification

1. Open GitHub Actions.
2. Run `Production readiness` on the target branch.
3. Run `Production release verification` against the `production` environment. This workflow repeats the non-mutating quality gates before checking production env, migration drift, APICenter contract smoke, and native builds.
   - Leave `run_live_apicenter_audit` disabled for the standard release gate.
   - Enable `run_live_apicenter_audit` only after live-send/payment approval.
   - Provide `live_audit_phone` and `live_audit_email` when enabling `live_audit_send` or `live_audit_payment`.
4. Confirm the `Native mobile production builds` job completed successfully. The workflow runs EAS iOS and Android builds with `--wait`, so this job should not pass until both native builds finish.
   - Android artifacts must be `.apk` for installable test builds or `.aab` for store release builds.
   - iOS artifacts must be `.app.zip` for simulator app bundles or `.xcarchive.zip` for release preparation.
5. Run mutating smoke scripts only against an isolated/resettable Supabase project:

```bash
cd backend
npm run smoke:all

cd ../mobile
npm run smoke:demo-api

cd ../admin
npm run smoke:integration
npm run smoke:demo-api
```

Do not run mutating smoke scripts against production user data.

## Live APICenter Send/Payment Checks

The safe APICenter contract smoke runs in every `Production release verification`. Live SMS/email/OTP/payment checks require explicit approval and test recipients. Prefer the workflow inputs above so the live-audit evidence stays attached to the production release run.

For a local emergency audit, use:

```bash
cd backend
APICENTER_LIVE_AUDIT_SEND=true \
APICENTER_LIVE_AUDIT_PAYMENT=true \
APICENTER_LIVE_AUDIT_PHONE="+639XXXXXXXXX" \
APICENTER_LIVE_AUDIT_EMAIL="qa@example.com" \
npm run audit:apicenter-live
```

Use PayMongo/test-mode credentials only unless a real payment release test has been approved.
