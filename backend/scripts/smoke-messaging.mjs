#!/usr/bin/env node
/**
 * Smoke test for messaging RPCs against the real Supabase database.
 *
 * Catches the drift class that broke production messaging on 2026-05-17:
 * the gateway expected `servease_create_conversation_message(...,
 * p_attachment jsonb)` but the live DB still had the old 6-arg signature
 * because the committed migration was never applied. Unit tests didn't
 * notice because they mock the RPC client.
 *
 * The conversations and messages tables have no FK constraints, so this
 * script seeds a conversation with synthetic UUIDs (skipping the booking
 * + auth user setup entirely) and exercises every messaging RPC end-to-
 * end: open, send text, send attachment, list, and visibility guards.
 *
 * Usage:
 *   SUPABASE_URL=...            \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *     node backend/scripts/smoke-messaging.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:messaging`);
  }
}

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const bookingId = randomUUID();
let conversationId = null;
const customerId = randomUUID();
const providerId = randomUUID();
const strangerId = randomUUID();

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed (${label}): expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertOk(label, value) {
  if (value === undefined || value === null) {
    throw new Error(`Assertion failed (${label}): expected a value, got ${value}`);
  }
}

async function rpc(name, args) {
  const { data, error } = await serviceClient.rpc(name, args);
  if (error) {
    throw new Error(`${name} failed: ${error.message}`);
  }
  return data;
}

async function rpcExpectError(name, args, expectedFragment) {
  const { data, error } = await serviceClient.rpc(name, args);
  if (!error) {
    throw new Error(
      `${name} expected to fail with "${expectedFragment}" but returned ${JSON.stringify(data)}`,
    );
  }
  if (!error.message.includes(expectedFragment)) {
    throw new Error(
      `${name} expected error containing "${expectedFragment}", got "${error.message}"`,
    );
  }
}

async function seedConversation() {
  // Use the existing get-or-create RPC. booking_id has no FK on conversations,
  // so a synthetic UUID is accepted.
  const conv = await rpc('servease_get_or_create_conversation', {
    p_booking_id: bookingId,
    p_customer_id: customerId,
    p_provider_id: providerId,
  });
  const row = Array.isArray(conv) ? conv[0] : conv;
  assertOk('seeded conversation id', row?.id);
  conversationId = row.id;
}

async function exerciseMessaging() {
  // 1. Listing is empty
  const empty = await rpc('servease_list_conversation_messages', {
    p_conversation_id: conversationId,
    p_customer_id: customerId,
    p_provider_id: null,
  });
  assertEq((empty ?? []).length, 0, 'empty thread before sends');

  // 2. Customer sends a text-only message — catches the missing p_attachment arg
  const textMsg = await rpc('servease_create_conversation_message', {
    p_conversation_id: conversationId,
    p_sender_id: customerId,
    p_sender_role: 'customer',
    p_content: 'Hello from smoke',
    p_customer_id: customerId,
    p_provider_id: null,
    p_attachment: null,
  });
  const textRow = Array.isArray(textMsg) ? textMsg[0] : textMsg;
  assertEq(textRow.content, 'Hello from smoke', 'text content');
  assertEq(textRow.sender_role, 'customer', 'text sender role');
  assertEq(textRow.attachment, null, 'text has no attachment');

  // 3. Provider sends an attachment-only message — catches missing columns
  const attachmentMsg = await rpc('servease_create_conversation_message', {
    p_conversation_id: conversationId,
    p_sender_id: providerId,
    p_sender_role: 'provider',
    p_content: '',
    p_customer_id: null,
    p_provider_id: providerId,
    p_attachment: {
      fileUrl: 'https://smoke.example/image.png',
      fileName: 'smoke.png',
      mimeType: 'image/png',
      storagePath: 'message-attachments/smoke.png',
      fileSize: 2048,
    },
  });
  const attachmentRow = Array.isArray(attachmentMsg) ? attachmentMsg[0] : attachmentMsg;
  assertEq(attachmentRow.sender_role, 'provider', 'attachment sender role');
  assertOk('attachment payload', attachmentRow.attachment);
  assertEq(
    attachmentRow.attachment.fileUrl,
    'https://smoke.example/image.png',
    'attachment URL round-trip',
  );
  assertEq(attachmentRow.attachment.fileSize, 2048, 'attachment size round-trip');
  assertEq(
    attachmentRow.content,
    'Sent an attachment',
    'attachment-only content default',
  );

  // 4. Listing returns both messages with attachment shape preserved
  const both = await rpc('servease_list_conversation_messages', {
    p_conversation_id: conversationId,
    p_customer_id: customerId,
    p_provider_id: null,
  });
  assertEq((both ?? []).length, 2, 'two messages after sends');
  const withAttachment = both.find((m) => m.attachment !== null);
  assertOk('attachment present in list', withAttachment);

  // 5. Stranger cannot list or post
  await rpcExpectError(
    'servease_list_conversation_messages',
    {
      p_conversation_id: conversationId,
      p_customer_id: strangerId,
      p_provider_id: null,
    },
    'conversation_forbidden',
  );
  await rpcExpectError(
    'servease_create_conversation_message',
    {
      p_conversation_id: conversationId,
      p_sender_id: strangerId,
      p_sender_role: 'customer',
      p_content: 'I should not be able to post',
      p_customer_id: strangerId,
      p_provider_id: null,
      p_attachment: null,
    },
    'conversation_forbidden',
  );

  // 6. Empty content + no attachment fails
  await rpcExpectError(
    'servease_create_conversation_message',
    {
      p_conversation_id: conversationId,
      p_sender_id: customerId,
      p_sender_role: 'customer',
      p_content: '   ',
      p_customer_id: customerId,
      p_provider_id: null,
      p_attachment: null,
    },
    'invalid_messaging_request',
  );

  // 7. Visibility-aware getter returns the conversation for either side
  const fromCustomer = await rpc('servease_get_visible_conversation', {
    p_conversation_id: conversationId,
    p_customer_id: customerId,
    p_provider_id: null,
  });
  assertOk('customer can see conversation', Array.isArray(fromCustomer) ? fromCustomer[0]?.id : fromCustomer?.id);
  const fromProvider = await rpc('servease_get_visible_conversation', {
    p_conversation_id: conversationId,
    p_customer_id: null,
    p_provider_id: providerId,
  });
  assertOk('provider can see conversation', Array.isArray(fromProvider) ? fromProvider[0]?.id : fromProvider?.id);
}

async function teardown() {
  // Best-effort cleanup via an RPC because the `messages` schema is not exposed
  // through PostgREST. Failing to clean up is non-fatal — the script uses
  // synthetic UUIDs that won't collide.
  if (!conversationId) {
    return;
  }
  try {
    await rpc('servease_smoke_cleanup_conversation', {
      p_conversation_id: conversationId,
    });
  } catch (error) {
    console.warn(`Cleanup warning: ${error.message}`);
  }
}

async function main() {
  try {
    await seedConversation();
    await exerciseMessaging();
    console.log('OK — messaging RPC contract is intact.');
  } finally {
    await teardown();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
