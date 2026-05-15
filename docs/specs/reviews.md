# Reviews Slice

## Problem

Customers need to submit ratings and review text after completed bookings. The backend must enforce booking ownership and completion before persisting trust data.

## Goals

- Expose authenticated review creation through the API Gateway.
- Allow public/provider review listing by provider ID.
- Persist reviews in the Review Service-owned `trust_and_reputation` schema.
- Prevent duplicate customer reviews for the same booking.
- Validate rating bounds and text shape.

## Non-Goals

- Provider review responses.
- Moderation workflows.
- Provider aggregate rating sync into Catalog Service.
- Customer-to-customer reviews.

## Gateway Routes

### `POST /v1/reviews`

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

Lists recent reviews for a provider.

## Acceptance Criteria

- Only the customer who owns a completed booking can create the review.
- Ratings outside `1..5` are rejected.
- Duplicate review creation for the same booking/reviewer returns the existing review.
- Gateway never writes directly to review tables.
