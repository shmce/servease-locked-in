# Landing Page Functional Registration Design

## Goal

Make the `Landing Page/` provider registration flow submit real data through the existing backend-to-Supabase registration path without editing `backend/`.

## Scope

- Add frontend-only code under `Landing Page/`.
- Keep the existing four-step registration UI and route structure.
- Combine wizard data into the existing gateway contract for `POST /v1/auth/register`.
- Use a Next.js route handler as a same-origin proxy to avoid requiring backend CORS changes for local `localhost:3000`.
- Do not edit backend files, backend migrations, or backend environment examples.

## Existing Backend Contract

The existing gateway route is:

- `POST /v1/auth/register`

The accepted request fields are:

- `role`
- `email`
- `password`
- `fullName`
- `contactNumber`
- `address`
- `businessName`
- `serviceDescription`
- `serviceArea`

For provider registration, the gateway creates a Supabase Auth user, an internal identity user, and a provider profile with pending verification.

## Frontend Data Mapping

- Step 1 provides `fullName`, `email`, `contactNumber`, and `password`.
- Step 2 provides service category, subcategory, and experience.
- Step 3 provides street address, city, province, ZIP code, and service radius.
- Step 4 validates ID type and file locally before submission.

The submitted payload will use:

- `role`: `provider`
- `contactNumber`: `+63` plus the stored 10-digit number
- `businessName`: provider full name, because the current UI does not collect a separate business name
- `serviceDescription`: service category, subcategory, and experience summary
- `serviceArea`: address, city, province, ZIP, and radius summary

ID files are not uploaded because the backend does not currently expose a provider document upload endpoint.

## Error Handling

- Missing prior step data blocks final submission and asks the user to restart the form.
- Gateway errors are shown on Step 4 using the backend error message when available.
- On successful registration, stored wizard data is cleared and the user is routed to `/provider-registration/success`.

## Backend Notes

No backend changes are part of this implementation. Backend adjustments that may be needed later:

- A public contact endpoint if the landing contact form must persist unauthenticated messages.
- Provider document upload support if Step 4 ID files must be stored.
- Direct browser CORS origin `http://localhost:3000` if the frontend later calls the gateway directly instead of using the Next proxy.

## Verification

- `cd "Landing Page" && npm run build`
- Smoke the final registration page route.
