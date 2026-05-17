# ServEase Provider Web

Next.js provider dashboard migrated from a Figma Make/Vite bundle.

The original Figma project is available at https://www.figma.com/design/NjHaqneACA1gTlpAe8leya/FE_Web-Provider-.

## Structure

- `src/app/components`: provider dashboard pages and UI components.
- `src/app/context`: provider data context and state wiring.
- `src/app/utils`: provider dashboard helpers.
- `src/assets`: static imported assets.
- `BACKEND_ADJUSTMENTS.md`: backend contracts still needed for full live provider data.

## Environment

Copy `.env.example` to `.env`:

```sh
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Use only public Supabase browser keys in this app.

## Commands

```sh
npm install
npm run dev
npm run typecheck
npm run smoke:demo-api
npm run build
```

## Backend Wiring

The provider dashboard should use gateway-backed provider routes as live wiring is completed. It must not call internal service ports or use Supabase service-role credentials.
