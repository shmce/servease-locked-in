# Messaging fix — 2026-05-17

## Symptom

All customer↔provider chat was broken in production. Sending or listing
messages from mobile, FE_Web(Provider), or any other client returned a
500 with messages like "could not find function
servease_create_conversation_message(uuid, uuid, text, text, uuid, uuid,
jsonb)" / "no parameter p_attachment".

## Root cause

The migration `backend/database/20260517_add_conversation_message_attachments.sql`
was committed to the repo but **never applied to Supabase**. As a
result:

1. `messages.messages` was missing `attachment_url`,
   `attachment_file_name`, `attachment_mime_type`,
   `attachment_storage_path`, `attachment_size` columns.
2. `servease_list_conversation_messages` still returned 7 columns (no
   `attachment`), so any caller using the new shape expected one more
   column.
3. `servease_create_conversation_message` still had the old 6-argument
   signature without `p_attachment jsonb`.

The runtime repo at
`backend/apps/messaging-service/src/features/conversations/supabase-conversation.repository.ts`
**always** calls the RPC with `p_attachment` (line 162). With the old
DB signature this fails immediately, so every send-message call returned
503 `messaging_dependency_unavailable`.

Test suites passed because they mock the Supabase RPC client — they
never executed against a real DB.

## Verification of the drift

```
mcp__supabase pg_proc lookup for servease_create_conversation_message
 BEFORE: args = p_conversation_id uuid, p_sender_id uuid, p_sender_role text,
                p_content text, p_customer_id uuid, p_provider_id uuid
 AFTER : args = ..., p_attachment jsonb
```

```
mcp__supabase information_schema.columns for messages.messages
 BEFORE: id, conversation_id, sender_id, sender_role, content,
         delivery_status, created_at  (7 columns)
 AFTER : ..., attachment_url, attachment_file_name, attachment_mime_type,
         attachment_storage_path, attachment_size  (12 columns)
```

## Fix

Applied the migration to Supabase via `mcp__supabase__apply_migration`
(migration name `add_conversation_message_attachments_v2`). The first
attempt failed with `cannot change return type of existing function` —
PostgreSQL refuses to alter a function's return shape — so the corrected
migration drops the function first.

## Cross-repo impact and changes

| Surface | Impact | Action taken |
|---|---|---|
| Supabase DB | RPC + columns missing | Migration applied |
| `backend/` (messaging-service + gateway) | Code already expected the new shape | None — verified passing tests |
| `mobile/` | Chat thread had **no attachment UI** at all — text-only `sendMessage`, no image rendering in the message bubbles | Added attachment button using existing `pickAndUploadImage('message_attachment', …)` helper, wired sendMessage to optional attachment, render `message.attachment.fileUrl` inline in each bubble |
| `FE_Web(Provider)/` | Already wired (paperclip in MessagesPage.tsx → upload + send) | None |
| `Landing Page/` | Has no customer↔provider chat UI (only support tickets) | None |
| `admin/` | Doesn't participate in chats (admin has its own booking-message thread) | None |

## Mobile change detail

- `mobile/App.tsx`:
  - Added `ConversationMessageAttachment` to the API imports.
  - Promoted `sendMessage(attachment?)` to accept an optional attachment.
  - New `attachAndSendMessageImage()` helper using
    `pickAndUploadImage('message_attachment', …)`.
  - Message thread now renders up to 20 messages (was 8), shows
    sender + timestamp, and renders the attachment image above the
    text bubble when present.
  - New Attach image button next to Send.

## Verification

- `npx tsc --noEmit` clean on **backend**, **mobile**, **FE_Web(Provider)**,
  and **Landing Page**.
- `cd backend && npx jest --testPathPattern="messaging|conversation"`
  — 3/3 suites, 5/5 tests pass.
- `cd mobile && npm test` — 41/41 tests pass (unchanged from baseline).
- `mcp__supabase` confirms the function signature and table columns now
  match the migration.

## Followup (recommended)

The drift was caught only by direct DB inspection. The migration file
existed but was not applied. Suggest:

1. Adding a CI check that compares `backend/database/*.sql` to
   `supabase migration list` to fail builds when a committed migration
   is missing in production.
2. Considering an integration smoke test for messaging that hits the
   real RPC (currently all messaging tests are unit-level with mocked
   Supabase).
