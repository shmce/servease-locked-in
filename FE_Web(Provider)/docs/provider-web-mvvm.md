# Provider Web MVVM Spec

## Architecture Contract

- Model code lives in `src/shared/models` and contains TypeScript data contracts plus API functions only.
- ViewModels live in `src/features/<feature-name>/viewModels` and expose hooks named `use<Feature>ViewModel`.
- Views live in `src/features/<feature-name>/views`, call their ViewModel hook, and compose UI sections or legacy page sections.
- Routes are declared in `src/app/routes.ts` and lazy-load feature views.
- Shared components, hooks, and utilities live under `src/shared`.

## Acceptance Criteria

- Next.js with TypeScript remains the provider web baseline.
- React Router remains the client router hosted by the Next catch-all page.
- TailwindCSS styles are still imported through the app stylesheet.
- API functions are exported from `src/shared/models/apiService.ts`.
- Type contracts are exported from `src/shared/models/types.ts`.
- New feature work must not call API functions from a view; it should call the feature ViewModel.
