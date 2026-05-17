# ServEase Landing Page

Next.js public site and browser account-flow surface for ServEase.

The original Figma project is available at https://www.figma.com/design/RBI64jiti3WsLeB4UHyFkO/Revise-Landing-Page-for-ServEase.

## Structure

- `src/app`: App Router pages for marketing, auth, booking, provider registration, provider listing, and account flows.
- `src/app/api`: Next.js API proxy routes that forward browser requests to the backend gateway.
- `src/app/components`: shared page and UI components.
- `src/app/lib`: browser/server helpers for gateway-backed flows.
- `src/assets`: static imported assets.

## Environment

Copy `.env.local.example` to `.env.local`:

```sh
SERVEASE_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not put Supabase service-role secrets in this app. Service-role access belongs in `backend/` only.

## Commands

```sh
npm install
npm run dev
npm run build
```

## Backend Boundary

Browser pages should call local `src/app/api/*` proxy routes when server-side environment values are needed. Proxy routes should forward to the API Gateway through `SERVEASE_API_BASE_URL`, not to internal service ports.
