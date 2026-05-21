# Admin Payments Slice

## Problem

The payment slice creates payment records, but administrators need backend routes to review payment state and release completed paid work to provider payouts.

## Goals

- Expose admin-authenticated payment list and status update routes.
- Keep payment persistence inside Payment Service.
- Use Admin Service as the admin workflow boundary.
- Support manual transitions to `pending`, `paid`, `cancelled`, or `refunded`.
- Release a paid payment to the provider payout workflow.
- Apply the same provider payout method fee calculation used by provider-requested payouts.

## Non-Goals

- Direct payout execution to a bank/e-wallet.
- Refund money movement.
- Ledger accounting.

## Gateway Routes

### `GET /v1/admin/payments?status=pending`

Requires authenticated user with `admin` role.

Errors:

- `400 invalid_admin_request` for unsupported status filters or update values.
- `403 admin_required` for authenticated non-admin users.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Payment Service is unavailable.

### `PATCH /v1/admin/payments/:paymentId/status`

Body:

```json
{
  "status": "paid"
}
```

Requires authenticated user with `admin` role.

Errors:

- `400 invalid_admin_request` for missing or unsupported status values.
- `403 admin_required` for authenticated non-admin users.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Payment Service is unavailable.

### `POST /v1/admin/payments/:paymentId/release`

Body:

```json
{
  "note": "Release after completed service"
}
```

Requires authenticated user with `admin` role. The Payment Service creates one provider payout in `processing` for the paid payment's provider payout amount, using the provider default payout method. The operation is idempotent per payment.

The payout `processingFee` is calculated by the provider payout method. Current supported payout methods (`bank`, `gcash`, and `paymaya`) deduct `min(providerPayout, PHP 10)`, and `netAmount` never falls below zero.

Admin payout summaries include `paymentId` when a payout came from a payment release. The Transactions UI uses that linkage to show already-released paid payments and only offer "Release" for paid provider payments that have not been released yet.

Errors:

- `400 invalid_admin_request` or downstream payment request errors for unpaid payments or providers without payout methods.
- `403 admin_required` for authenticated non-admin users.
- `404 payment_not_found` when the payment does not exist.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Payment Service is unavailable.

## Acceptance Criteria

- Non-admin users cannot access admin payment routes.
- Invalid payment statuses are rejected by Payment Service.
- Paid payments can be released once to a provider payout.
- Admin UI can sync APICenter status and release eligible paid payments without guessing whether a payout already exists.
- Admin payment release and provider payout request use the same payout method fee rule.
- Admin Service has no database access.
- Payment Service owns payment status updates.
