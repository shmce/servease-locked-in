# Mobile MVVM Prompt

Last verified from repository files: 2026-05-23.

Use this prompt when asking an agent to move or create mobile code in the current ServEase MVVM structure.

## Prompt

You are working in `/Users/mac/ServEase`.

Follow the mobile MVVM architecture in [`../../MVVM.md`](../../MVVM.md):

- Expo route files live in `mobile/app` and `mobile/src/app`.
- Gateway and auth clients live in `mobile/services`.
- Pure domain helpers live in `mobile/src/domain`.
- Feature view models live in `mobile/src/features/<feature>/viewModels`.
- Feature views live in `mobile/src/features/<feature>/views`.
- Shared UI lives in `mobile/src/components` or `mobile/src/shared/components`.
- Shared hooks, models, and utilities live in `mobile/src/shared`.

Rules:

1. Do not add API calls directly to views when a view model exists for the feature.
2. Do not call internal backend service ports from mobile.
3. Do not use Supabase service-role keys in mobile.
4. Keep customer and provider workflows separate unless the code is truly shared.
5. Add focused tests for domain helpers, view models, and user-facing workflow states.
6. Run the relevant mobile checks before handoff:

```sh
cd mobile
npm run typecheck
npm run lint
npm test
```

Run `npm run smoke:demo-api` when the change affects gateway-backed demo flows.

## CI And Release Constraints

- Branch promotion remains `test -> uat -> main`.
- Protected branches require pull requests and passing status checks.
- TypeScript checks, lint, tests, and required E2E/performance gates must pass before promotion.
- Use synthetic test data in UAT and smoke environments.
