# Reviews Slice

## Status

- Owner: backend
- Owning service: Review Service
- Owning schema: `trust_and_reputation`
- Implementation status: implemented

## Problem

Customers need to submit ratings and review text after completed bookings. The backend must enforce booking ownership and completion before persisting trust data.

## Goals

- Expose authenticated review creation through the API Gateway.
- Allow public/provider review listing by provider ID.
- Persist reviews in the Review Service-owned `trust_and_reputation` schema.
- Prevent duplicate customer reviews for the same booking.
- Validate rating bounds and text shape.

## Non-Goals

- Moderation workflows.
- Provider aggregate rating sync into Catalog Service.
- Customer-to-customer reviews.

## Gateway Routes

### `POST /v1/reviews`

- Public route: `POST /v1/reviews`
- Internal route: `POST /internal/reviews`
- Auth: customer required
- Idempotency: duplicate review for the same booking/reviewer returns the existing review.

Body:

```json
{
  "bookingId": "uuid",
  "rating": 5,
  "reviewText": "Great service"
}
```

The gateway verifies the booking is visible to the authenticated customer and has `completed` status.

### `GET /v1/reviews?providerId=<uuid>`

- Public route: `GET /v1/reviews?providerId=<uuid>`
- Internal route: `GET /internal/reviews?providerId=<uuid>`
- Auth: none

Lists recent reviews for a provider.

### `POST /v1/reviews/:reviewId/reply`

- Public route: `POST /v1/reviews/:reviewId/reply`
- Internal route: `POST /internal/reviews/:reviewId/reply`
- Auth: provider required

Creates a provider response to a review.

### `POST /v1/reviews/:reviewId/flag`

- Public route: `POST /v1/reviews/:reviewId/flag`
- Internal route: `POST /internal/reviews/:reviewId/flag`
- Auth: required

Flags a review for moderation.

## Error States

- `401 auth_required`
- `401 invalid_auth_token`
- `400 invalid_review_request`
- `404 booking_not_found`
- `503 review_dependency_unavailable`

## Acceptance Criteria

- Only the customer who owns a completed booking can create the review.
- Ratings outside `1..5` are rejected.
- Duplicate review creation for the same booking/reviewer returns the existing review.
- Gateway never writes directly to review tables.

## Verification Commands

```sh
cd backend
npm run test
npm run build
```
