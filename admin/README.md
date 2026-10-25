# ServEase Admin Panel

The ServEase admin dashboard for platform operations. Sign in with an
admin-role account from your configured development environment; the gateway
validates the bearer token on every `/v1/admin/...` request.

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

Create a local environment file from `.env.example` and provide development
values for the API Gateway and Supabase:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
ADMIN_SMOKE_EMAIL=<non-production admin email>
ADMIN_SMOKE_PASSWORD=<non-production admin password>
```

Use an admin account provisioned for your own non-production environment. Demo
account credentials are intentionally omitted from the public repository
documentation.

## What you can do once signed in

After signing in you can exercise every admin page (Dashboard, Bookings,
Transactions, Payouts, Refunds, Promotions, Categories, Services, Providers,
Provider Applications, Disputes, Support, **Reviews**, Audit Trail, Backend
Matrix). The Reviews page is wired to the new
`GET /v1/admin/reviews` and `PATCH /v1/admin/reviews/:id/flag` endpoints so
you can hide or restore any review created from the mobile app.

See `src/app/config/backendSupportMatrix.ts` for the live wiring status of
every screen.
