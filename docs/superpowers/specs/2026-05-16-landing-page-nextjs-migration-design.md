# Landing Page Next.js Migration Design

## Goal

Convert `Landing Page/` from a Vite React application into a Next.js application in place. After migration, the folder should no longer depend on Vite or React Router for app startup and routing.

## Scope

- Replace the Vite entrypoint and config with Next.js App Router files.
- Preserve the current visual design, pages, forms, copy, assets, and route URLs.
- Keep changes scoped to `Landing Page/` except for this design spec.
- Do not change backend, mobile, or admin behavior.

## Routes

The Next.js app will expose these routes:

- `/`
- `/about`
- `/faq`
- `/contact`
- `/provider-registration`
- `/provider-registration/step-1`
- `/provider-registration/step-2`
- `/provider-registration/step-3`
- `/provider-registration/step-4`
- `/provider-registration/success`
- `/application-approved`

`/provider-registration` and `/provider-registration/step-1` will render the same first registration step, matching current behavior.

## Architecture

- Use Next.js App Router under `Landing Page/src/app`.
- Add `Landing Page/src/app/layout.tsx` as the root HTML shell and global stylesheet import point.
- Add route-specific `page.tsx` files that render the existing page components.
- Replace React Router navigation APIs with Next equivalents:
  - `react-router` `Link` becomes `next/link`.
  - `useNavigate` becomes `useRouter` from `next/navigation`.
  - `useLocation` becomes `usePathname` from `next/navigation`.
  - `Outlet` is replaced by App Router `children`.
- Keep reusable UI/page components under `Landing Page/src/app/components`.
- Mark interactive components with `'use client'` where they use React state, browser APIs, or Next navigation hooks.

## Assets

Figma asset imports such as `figma:asset/example.png` will be replaced with normal relative imports from `Landing Page/src/assets`. The Vite-only Figma asset resolver will be removed with `vite.config.ts`.

## Styling

The existing Tailwind v4 CSS files remain in `Landing Page/src/styles`. `globals.css` is not required; `src/app/layout.tsx` will import `../styles/index.css`.

## Package Setup

- Replace Vite scripts with Next scripts:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `next lint` if supported by the installed Next version
- Add `next`, `react`, `react-dom`, `typescript`, and relevant type packages as direct dependencies or dev dependencies.
- Remove Vite-only packages and React Router.
- Keep UI dependencies that existing components import.

## Removed Files

The migration will remove Vite/React Router startup files:

- `Landing Page/index.html`
- `Landing Page/vite.config.ts`
- `Landing Page/src/main.tsx`
- `Landing Page/src/app/App.tsx`
- `Landing Page/src/app/routes.ts`

## Verification

Run from `Landing Page/`:

- `npm install` if lockfile/dependencies need updating.
- `npm run build` to verify the app compiles as Next.js.

If build failures expose existing TypeScript or generated-code issues unrelated to the framework migration, fix the migration-related causes and report any remaining blockers clearly.
