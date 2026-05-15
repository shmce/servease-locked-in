# Provider Web Next.js Migration Design

## Goal

Convert `FE_Web(Provider)/` from the Figma Make Vite bundle into a runnable Next.js app in place, while preserving the existing provider dashboard screens and routes.

## Scope

- Keep all backend files untouched.
- Preserve the Figma-generated provider UI, React Router routes, local state, styles, and assets.
- Use the same Next.js migration shape already used by `admin/`: a Pages Router catch-all page that dynamically loads the generated app client-side.
- Document backend API adjustments needed for production wiring instead of implementing backend changes.

## Architecture

- Add Next.js files under `FE_Web(Provider)/src/pages`:
  - `_app.tsx` imports global styles.
  - `[[...slug]].tsx` catches every route and dynamically imports `../app/App` with SSR disabled.
- Keep `src/app/App.tsx`, `src/app/routes.ts`, and all provider components intact so React Router remains the in-app route owner.
- Add `next.config.mjs`, `next-env.d.ts`, and `tsconfig.json`.
- Update `package.json` scripts from Vite to Next.

## Assets And Styling

- Replace Vite-only `figma:asset/...` imports with normal relative imports from `src/assets`.
- Keep Tailwind v4 CSS under `src/styles`.
- Update PostCSS to use `@tailwindcss/postcss`, matching the existing Next apps.

## Backend Integration Notes

The migrated frontend currently uses local mock state and hard-coded datasets. To make it production functional, the backend should expose or confirm authenticated provider routes through the API Gateway for:

- provider login/session and current provider profile;
- dashboard metrics and upcoming booking summary;
- booking request list, booking details, accept/reject/cancel/counter-offer actions;
- provider availability windows and days off;
- earnings, transactions, payout methods, and payout requests;
- provider reviews, review replies, and review reports;
- messages/conversations;
- notification preferences;
- profile, services/pricing, and portfolio management.

These should remain gateway HTTP APIs. The gateway should not access service databases directly.

## Verification

Run from `FE_Web(Provider)/`:

- `npm install`
- `npm run build`
- `npm run dev`

The app should compile under Next.js and serve all provider routes through the catch-all page.
