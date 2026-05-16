# Customer Payment Methods Spec

## Scope

Customer payment methods let the mobile app render and select saved payment options from the backend instead of hardcoded local rows. This slice does not process real card or wallet charges. It stores only non-sensitive display metadata and keeps actual payment capture on the existing payment reservation flow.

## Ownership

- Payment Service owns the `payment.customer_payment_methods` table and all RPCs.
- API Gateway exposes authenticated customer endpoints and forwards requests over HTTP to Payment Service.
- Mobile consumes only Gateway endpoints.
- No service reads another service schema directly.

## Data Shape

`CustomerPaymentMethodSummary`:

- `id`
- `customerId`
- `methodType`: `cash_on_service`, `card`, `gcash`, or `paymaya`
- `label`
- `brand`
- `last4`
- `isDefault`
- `createdAt`

Sensitive values are out of scope: no full card numbers, CVV, wallet access tokens, or processor tokens are accepted or stored.

## API Contract

Gateway:

- `GET /v1/payments/methods`
- `PUT /v1/payments/methods`
- `DELETE /v1/payments/methods/:methodId`

Payment Service internal:

- `GET /internal/payments/customer-methods?customerId=...`
- `PUT /internal/payments/customer-methods`
- `DELETE /internal/payments/customer-methods/:methodId?customerId=...`

`GET` always ensures a `cash_on_service` method exists for the authenticated customer. New non-cash methods may be saved as display placeholders until a real processor is chosen.

## Failure Cases

- Missing auth or customer ID returns an auth or invalid payment request error.
- Invalid method type, blank label, or `last4` longer than 4 digits is rejected.
- Deleting a method that does not belong to the customer returns payment not found.
- Cash on service cannot be deleted.
- When a default method is deleted, cash on service becomes the default fallback.

## Acceptance Criteria

- Mobile payment screen lists backend methods and lets the customer select one.
- Booking and payment creation use the selected payment method type.
- Route manifest marks customer payment methods as connected, while noting processor tokenization remains external.
- Backend build/tests and mobile type/tests pass.
