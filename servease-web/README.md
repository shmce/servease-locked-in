# ServEase Web

Next.js public site, browser account-flow surface, and provider dashboard for ServEase.

The original Figma project is available at https://www.figma.com/design/RBI64jiti3WsLeB4UHyFkO/Revise-Landing-Page-for-ServEase.

## Structure

- `src/app`: App Router pages for marketing, auth, booking, provider registration, provider listing, and account flows.
- `src/app/api`: Next.js API proxy routes that forward browser requests to the backend gateway.
- `src/app/provider/[[...slug]]`: provider dashboard mount route.
- `src/app/components`: shared page and UI components.
- `src/app/lib`: browser/server helpers for gateway-backed flows.
- `src/provider-app`: migrated provider dashboard screens, routes, and context.
- `src/services`: provider dashboard API client.
- `src/assets`: static imported assets.

## Environment

Copy `.env.local.example` to `.env.local`:

```sh
SERVEASE_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not put Supabase service-role secrets in this app. Service-role access belongs in `backend/` only.
If your Supabase dashboard still labels the browser key as an anon key, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is accepted as a fallback.

## Commands

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run e2e
```

The local dev server runs on `http://localhost:3002` so it does not conflict
with the admin app on `http://localhost:3001`. Both server-side proxy routes
and browser calls should keep pointing at the backend gateway on
`http://localhost:5001`.

## Backend Boundary

Browser pages should call local `src/app/api/*` proxy routes when server-side environment values are needed. Proxy routes should forward to the API Gateway through `SERVEASE_API_BASE_URL`, not to internal service ports.
