# Landing Page Support Contact Integration Design

## Scope

Wire the Next.js landing page contact form to the existing ServEase support ticket workflow without changing the backend repository.

## Existing Contract

The API Gateway exposes `POST /v1/support/tickets`. It requires an authenticated Supabase bearer token and accepts `subject`, `message`, `category`, and optional `attachments`. The Support Service persists the ticket under the authenticated user.

The backend does not currently support anonymous contact submissions with only a name and email address.

## Design

The landing page will add a Next.js API route at `/api/support-tickets`. This route will validate a bearer token is present, validate that subject and message are non-empty, and forward the request to the API Gateway using `SERVEASE_API_BASE_URL`.

The contact page will use the existing browser Supabase client to check the current session. When the user submits the form, it will send the access token to `/api/support-tickets`. If no session exists, the form will show a sign-in-required error and link the user to `/login`.

The existing name and email fields will remain on the form for landing-page continuity. Because the backend ticket contract has no name/email fields, the frontend will include those values at the top of the ticket message so support staff still receive them without requiring backend schema or route changes.

## Error Handling

Missing Supabase public env values show a setup error in the form.
Unauthenticated users see a sign-in-required message.
Gateway validation and service errors are surfaced as readable form errors.
Successful submissions clear the form and show the created ticket ID when available.

## Verification

Run `npm run build` in `Landing Page`.
Smoke `GET /contact`.
Smoke `POST /api/support-tickets` without auth and expect `401 auth_required`.
Authenticated ticket creation is only fully verifiable with a valid user credential.
