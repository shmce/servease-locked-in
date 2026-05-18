# ServEase Admin Panel

The ServEase admin dashboard. Sign in with an admin-role account against the
shared Supabase project; the gateway validates the bearer token on every
`/v1/admin/...` request.

## Running the app

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3001` by default.

## Commands

```bash
npm run env:check
npm run typecheck
npm test
npm run smoke:routes
npm run smoke:integration
npm run build
```

## Required environment

Create `.env.local` in this folder with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=https://bwubdvjyjssywfjyhrxj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key from Supabase project>
ADMIN_SMOKE_EMAIL=admin.demo@servease.test
ADMIN_SMOKE_PASSWORD=<demo admin password>
```

## Demo admin account

Use this account to sign in for local testing. It is seeded by
`backend/scripts/seed-demo-data.mjs` and lives in the shared dev Supabase
project.

| Field    | Value                          |
| -------- | ------------------------------ |
| Email    | `admin.demo@servease.test`     |
| Password | `ServEaseDemo#2026`            |
| Role     | `admin`                        |
| Status   | `active`                       |

If sign-in ever fails with `invalid_grant`, the password has drifted — re-run
the seed script or reset it from Supabase. The seed script also creates a
matching `customer.demo@servease.test` and `provider.demo@servease.test` (same
password) you can use to exercise the mobile app against the same data.

> Treat this account as **non-production**. Never reuse `ServEaseDemo#2026`
> in any deployed environment.

## What you can do once signed in

After signing in you can exercise every admin page (Dashboard, Bookings,
Transactions, Payouts, Refunds, Promotions, Categories, Services, Providers,
Provider Applications, Disputes, Support, **Reviews**, Audit Trail, Backend
Matrix). The Reviews page is wired to the new
`GET /v1/admin/reviews` and `PATCH /v1/admin/reviews/:id/flag` endpoints so
you can hide or restore any review created from the mobile app.

See `src/app/config/backendSupportMatrix.ts` for the live wiring status of
every screen.
