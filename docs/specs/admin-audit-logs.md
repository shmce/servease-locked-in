# Admin Audit Logs

## Scope

Admin audit logs are owned by Admin Service and stored in the `admin` schema. The gateway authenticates admin users and forwards audit log requests to Admin Service over HTTP.

## API Contracts

- `GET /v1/admin/audit-logs`
  - Requires an active admin bearer token.
  - Query params: `adminUserId`, `actionType`, `entityType`, `query`, `from`, `to`, `limit`.
  - Returns newest-first audit entries.
- `GET /v1/admin/audit-logs/export`
  - Requires an active admin bearer token.
  - Uses the same filters and returns CSV.

Internal Admin Service endpoints:

- `GET /internal/admin/audit-logs`
- `POST /internal/admin/audit-logs`

## Data Shape

Audit log entries include:

- `id`
- `adminUserId`
- `adminEmail`
- `adminName`
- `action`
- `actionType`
- `entityType`
- `entityId`
- `details`
- `ipAddress`
- `metadata`
- `createdAt`

## Acceptance Criteria

- Admin audit trail screen loads live audit logs from the gateway.
- CSV export uses backend-provided rows, not frontend mock data.
- Successful admin mutations for payments, payouts, promotions, support tickets, and disputes create audit records.
- Audit log failure must not roll back a successful business mutation.
- No gateway database access is introduced.
