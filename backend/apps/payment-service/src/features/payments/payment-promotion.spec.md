# Payment Promotion Validation Spec

## Contract

- Promotion rules are owned by `payment-service` and stored in `payment.promotion_codes`.
- Mobile clients may validate a code through `POST /v1/payments/promotions/validate`.
- The API Gateway must authenticate the caller, confirm the booking is visible to that caller, then validate the code against the booking total.
- Payment creation may accept `promoCode`, but the gateway must revalidate it server-side before calling `payment-service`.
- The mobile app must never send or control the discounted amount.

## Data Shape

Validation responses use:

- `code`: normalized promotion code.
- `valid`: whether the code can apply to the booking amount now.
- `discountAmount`: amount removed from the booking total.
- `finalAmount`: booking amount after discount.
- `message`: user-facing validation result.

## Acceptance Criteria

- `SERVEASE10` is seeded as an active demo code.
- Invalid, inactive, expired, or below-minimum codes return `valid: false` without writing payment rows.
- Creating a payment with a valid code stores a payment using the server-calculated final amount.
- Creating a payment with an invalid code fails with `invalid_payment_request`.
