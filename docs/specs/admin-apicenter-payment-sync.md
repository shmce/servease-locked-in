# Admin APICenter Payment Sync

## Behavior

Admin transactions expose APICenter checkout metadata when a payment was created
through the APICenter checkout flow. Admins can trigger a sync from the
Transactions page. The sync calls payment-service, which fetches the latest
APICenter checkout status by stored checkout ID and reconciles the local
`payment.payments` row through the existing payment-owned RPC.

Refund approval is intentionally not wired to APICenter refunds yet. The
APICenter SDK refund helper requires a provider payment ID such as `pay_123`,
while the current checkout reconciliation path stores APICenter checkout IDs
only. Passing a local payment UUID or checkout ID to the refund endpoint would
be unsafe without APICenter confirming that identifier contract.

## Affected Folders

- `backend/apps/payment-service/src/features/payments`: owns APICenter checkout
  lookup, status sync, payment response mapping, and payment admin tests.
- `backend/apps/admin-service/src/features/payments`: forwards admin sync calls
  to payment-service over HTTP.
- `backend/apps/api-gateway/src/features/admin`: exposes the admin sync endpoint
  and writes the admin audit log.
- `backend/database`: adds service-role RPCs that return latest APICenter
  checkout metadata for admin payment rows.
- `admin/src/services`: adds the admin API client method for sync.
- `admin/src/app/pages`: surfaces APICenter checkout data and the sync action in
  the Transactions page.

## Acceptance Criteria

- Admin payment list/get responses include latest APICenter checkout ID, status,
  provider, and provider mode when present.
- `POST /v1/admin/payments/:paymentId/apicenter-sync` requires an admin, routes
  through gateway to admin-service to payment-service, and does not let the API
  gateway read payment tables directly.
- Payment-service uses the stored APICenter checkout ID and
  `SharedPaymentService.getCheckoutStatus()` for reconciliation.
- The Transactions page can sync an APICenter-backed payment and update the row
  without a full reload.
