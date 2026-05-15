# Media Upload Spec

## Scope

ServEase stores customer booking reference photos, support evidence, and provider media through the API Gateway. The gateway is the only backend process allowed to touch Supabase Storage, so microservices continue to communicate through HTTP and do not gain direct storage access.

## API Contract

- `POST /v1/uploads`
- Auth: Bearer token required.
- Body: `multipart/form-data`
- Fields:
  - `kind`: `booking_reference`, `support_evidence`, `provider_portfolio`, or `provider_progress`
  - `file`: image or video file
- Limits: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, and `video/quicktime`; max 10 MB.
- Response:

```json
{
  "data": {
    "bucket": "servease-uploads",
    "path": "booking_reference/user-id/2026-05-16/file.jpg",
    "publicUrl": "https://example.supabase.co/storage/v1/object/public/servease-uploads/...",
    "kind": "booking_reference",
    "contentType": "image/jpeg",
    "size": 12345
  }
}
```

## Mobile Usage

The Expo app selects media through the native image picker, uploads it to the gateway, and stores the returned URL in the current workflow state. Existing booking and support payloads include the uploaded URL inside their notes/messages until dedicated media tables are added.

## Acceptance Criteria

- Upload attempts require an authenticated session.
- Unsupported kinds, missing files, unsupported MIME types, and files over 10 MB fail with `invalid_upload_request`.
- Supabase Storage failures return `upload_dependency_unavailable`.
- The mobile booking and report screens let users attach evidence without changing booking or support service ownership.
