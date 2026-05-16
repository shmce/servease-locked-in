# Admin Provider Applications Spec

## Scope

Admin provider applications expose provider onboarding review from backend data instead of static admin mock rows. The first backend slice uses existing provider profiles as applications and lets admins approve or reject the profile verification status.

## Ownership

- Catalog Service owns provider profiles, provider documents, application decision records, and the internal application RPCs.
- Admin Service calls Catalog Service over HTTP.
- API Gateway exposes authenticated admin routes and writes audit logs best-effort.
- No database access is added to the gateway or admin service.

## Data Shape

`AdminProviderApplicationSummary`:

- `id` provider profile ID
- `applicationReference`
- `userId`
- `businessName`
- `serviceArea`
- `serviceDescription`
- `yearsExperience`
- `verificationStatus`: `pending`, `approved`, `rejected`
- `isActive`
- `averageRating`
- `reviewCount`
- `serviceCount`
- `documentCount`, `pendingDocumentCount`, `approvedDocumentCount`, `rejectedDocumentCount`
- `latestDecisionReason`, `latestDecisionAt`, `latestDecidedBy`
- `createdAt`, `updatedAt`

## API Contract

Gateway:

- `GET /v1/admin/provider-applications?status=&query=`
- `GET /v1/admin/provider-applications/:applicationId`
- `POST /v1/admin/provider-applications/:applicationId/approve`
- `POST /v1/admin/provider-applications/:applicationId/reject`

Internal Admin Service:

- `GET /internal/admin/provider-applications`
- `GET /internal/admin/provider-applications/:applicationId`
- `POST /internal/admin/provider-applications/:applicationId/approve`
- `POST /internal/admin/provider-applications/:applicationId/reject`

Internal Catalog Service:

- `GET /internal/providers/applications`
- `GET /internal/providers/applications/:applicationId`
- `POST /internal/providers/applications/:applicationId/decision`

## Failure Cases

- Non-admin callers are rejected by Gateway.
- Invalid status filters and blank rejection reasons are rejected.
- Missing provider profile returns not found/dependency error.
- Approved applications become active and approved.
- Rejected applications become inactive and rejected.
- Decisions are recorded with admin ID and reason for auditability.

## Acceptance Criteria

- Backend returns live provider application rows from provider profiles.
- Admin approve/reject updates provider verification status through HTTP service boundaries.
- Gateway writes audit log entries for approval and rejection attempts.
- Backend tests, build, and admin API tests cover the new contracts.
