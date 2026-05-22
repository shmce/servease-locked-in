# Mobile MVVM Architecture

Last verified from repository files: 2026-05-23.

## Purpose

The Expo mobile app uses an MVVM-style feature structure so screens stay thin, stateful workflow logic lives in hooks, and API/domain helpers stay outside view components.

## Current Mobile Structure

```text
mobile/
  app/                         Expo Router entrypoints
  services/                    Gateway and auth clients
  constants/                   Shared app copy, route constants, and content
  assets/                      Static images and app assets
  src/
    app/                       Expo Router route files mirrored for source imports
    components/                Cross-feature UI components
    domain/                    Pure domain helpers and tests
    features/
      <feature-name>/
        viewModels/            use<Feature>ViewModel hooks
        views/                 React Native screen/view components
    navigation/                Route manifest, notification routing, helpers
    shared/
      components/              Shared composed UI sections
      hooks/                   Cross-feature hooks
      models/                  Shared model types and app-facing API wrappers
      utils/                   Pure utility functions
    theme/                     ServEase design tokens
    tracking/                  Live location and tracking helpers
```

## Layer Rules

1. **Model/API layer:** `mobile/services` and `mobile/src/shared/models` own gateway calls and shared data shapes. They must not import React components.
2. **Domain layer:** `mobile/src/domain` owns pure business helpers such as booking filtering, provider availability, registration validation, and operational locks.
3. **ViewModel layer:** `mobile/src/features/<feature>/viewModels` owns async orchestration, state derivation, error mapping, and callbacks exposed to views.
4. **View layer:** `mobile/src/features/<feature>/views` owns rendering and UI-local state only.
5. **Shared UI:** reusable components used by multiple features belong in `mobile/src/components` or `mobile/src/shared/components`.
6. **Routing:** route files live in `mobile/app` and `mobile/src/app`; feature views should not hardcode backend URLs or internal service routes.
7. **Testing:** place focused tests next to the layer they verify, using `*.test.ts` or `*.test.tsx`.

## Implementation Rules

- Views do not call gateway functions directly when a view model exists for that feature.
- View models should map backend errors into user-facing state before views render them.
- Pure domain helpers should be deterministic and unit tested without React Native.
- Keep customer and provider workflow logic separate unless a shared domain helper genuinely applies to both.
- Keep API calls on public gateway routes or approved local proxy routes; mobile must not call internal service ports or Supabase service-role APIs.
- Prefer extending an existing feature folder over adding screen logic to `mobile/src/App.tsx`.

## Verification

For mobile architecture changes:

```sh
cd mobile
npm run typecheck
npm run lint
npm test
```

Run `npm run smoke:demo-api` when gateway-backed demo flows change.
