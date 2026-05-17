# ServEase Mobile

Expo React Native app for customer and provider workflows.

## Structure

- `App.tsx`: app entry and navigation shell.
- `services/`: typed API and auth clients.
- `src/components/`: reusable UI components.
- `src/navigation/`: navigation helpers.
- `constants/`: shared design tokens and constants.
- `assets/`: static images and app assets.

The mobile app calls the API Gateway only. It should not call internal services or Supabase service-role endpoints directly.

## Environment

Copy `.env.example` to `.env` and fill in the public values:

```sh
EXPO_PUBLIC_API_BASE_URL=http://localhost:5001
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Use only public Supabase browser keys in the mobile app. Keep service-role keys in backend environment files.

## Commands

```sh
npm install
npm start
npm run ios
npm run android
npm run web
npm run typecheck
npm run lint
npm test
```

`npm run smoke:demo-api` checks the demo API flow against the configured gateway.

## Verification

Run focused checks for the area changed, then use this baseline before handoff when mobile behavior changes:

```sh
npm run typecheck
npm run lint
npm test
```
