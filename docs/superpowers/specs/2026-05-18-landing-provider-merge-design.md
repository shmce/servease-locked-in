# Landing Provider Merge Design

## Goal

Merge the public `Landing Page/` app and `FE_Web(Provider)/` dashboard into one website, with `Landing Page/` as the host application.

## Scope

- Keep existing public/customer landing routes in `Landing Page/`.
- Mount the provider dashboard inside the landing app under `/provider/*`.
- Preserve customer `/login` and move provider authentication to `/provider/login`.
- Keep provider dashboard code namespaced so it does not mix with public landing components.
- Do not change backend service boundaries or add direct service/database calls.

## Architecture

- Provider dashboard source lives in `Landing Page/src/provider-app`.
- Provider API client code lives in `Landing Page/src/services`.
- Static provider assets are copied into `Landing Page/src/assets`.
- `Landing Page/src/app/provider/[[...slug]]/page.tsx` dynamically loads the provider app client-side.
- The landing root layout omits the public navbar/footer for `/provider/*` so the provider dashboard owns its own shell.

## Routes

- Public/customer routes remain unchanged, including `/login`, `/register`, `/account`, and `/provider-registration/*`.
- Provider routes are available under `/provider/*`, including `/provider`, `/provider/login`, `/provider/dashboard`, `/provider/bookings`, `/provider/calendar`, `/provider/profile`, and existing provider dashboard subroutes.

## Dependencies

`Landing Page/` needs the provider-only runtime packages that were not already present:

- `react-router`
- `canvas-confetti`

## Verification

Run from `Landing Page/`:

- `npm run build`

The build should confirm that the merged Next app compiles with the public App Router pages and provider dashboard mount route.
