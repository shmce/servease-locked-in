# Customer Saved Addresses

## Status

- Owner: User Service and mobile customer booking flow
- Owning schema: `identity_and_user`
- Implementation status: implemented

## Goal

Customers can store service locations, mark one as the default home address, and choose a saved address from the booking form with one tap.

## Scope

- User Service owns `identity_and_user.user_addresses`.
- API Gateway exposes authenticated `/v1/me/addresses` routes.
- `GET /v1/me` includes `customerAddresses` so the mobile app can render saved addresses without an extra bootstrap call.
- `customer_profiles.address` remains a compatibility summary of the default saved address.
- Booking Service remains unchanged; it receives the chosen `serviceAddress` string in the existing create-booking request.

## API

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/v1/me/addresses` | - | `CustomerAddressSummary[]` |
| POST | `/v1/me/addresses` | `label`, `address`, optional locality/coordinates, `isDefault` | `CustomerAddressSummary` |
| PATCH | `/v1/me/addresses/:addressId` | Partial address fields | `CustomerAddressSummary` |
| POST | `/v1/me/addresses/:addressId/default` | - | `CustomerAddressSummary` |
| DELETE | `/v1/me/addresses/:addressId` | - | `{ ok: true }` |

## Mobile Behavior

- The booking form shows saved addresses as selectable chips above the service address field.
- Tapping a saved address fills the service address and coordinates when available.
- Customers can save the currently typed or verified address as `Home`; the backend marks it default.
- The More tab includes a Saved Addresses screen where customers can add locations, mark one as home, and delete stale locations.
- A typed one-off address remains supported and does not require saving.
