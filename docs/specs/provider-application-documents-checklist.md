# Provider Application Documents Checklist

## Goal

Pending or rejected providers need one place to upload the documents required
for admin approval. The checklist should reuse the existing provider document
upload path so files continue to appear in the admin provider approval queue.

## Scope

- Add a provider-facing API to read the current provider application and its
  submitted documents.
- Add a mobile checklist screen with fixed document slots:
  `government_id`, `selfie_photo`, `proof_of_address`,
  `business_permit_or_certificate`, and `supporting_records`.
- Let providers upload or replace each slot from the same screen.
- Link pending/rejected providers to the checklist from Provider Home, the
  locked Services screen, and Provider More.

## API Contract

`GET /v1/auth/provider-application/me/documents`

Returns:

```json
{
  "application": {
    "id": "uuid",
    "verificationStatus": "pending"
  },
  "documents": [
    {
      "id": "uuid",
      "applicationId": "uuid",
      "documentType": "government_id",
      "status": "pending",
      "previewUrl": "https://..."
    }
  ]
}
```

Uploads continue through `POST /v1/uploads` with `kind=provider_document` and
`documentType=<slot id>`.

## Acceptance Criteria

- A pending provider can open one screen and see every required document slot.
- Uploading a slot immediately records a provider document row for admin review.
- The latest document per slot is shown with its review status.
- Approved providers do not need this screen for service management, but can
  still view previously submitted documents through More.
- Existing admin approval queue document reads keep working.
