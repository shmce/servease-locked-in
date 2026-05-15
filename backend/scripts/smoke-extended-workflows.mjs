import { createClient } from '@supabase/supabase-js';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import process from 'node:process';

config({ path: '../.env' });
config({ path: '.env', override: false });

for (const key of [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for smoke:extended`);
  }
}

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const processes = [];
const cleanupState = {
  userId: null,
  otherUserId: null,
  providerUserId: null,
  adminUserId: null,
  bookingId: null,
  conversationId: null,
  paymentId: null,
  reviewId: null,
  supportTicketId: null,
  notificationId: null,
  categoryId: null,
  serviceId: null,
  providerId: null,
};

async function main() {
  const customerEmail = `servease-extended-smoke-${randomUUID()}@example.test`;
  const otherCustomerEmail = `servease-other-smoke-${randomUUID()}@example.test`;
  const providerEmail = `servease-provider-smoke-${randomUUID()}@example.test`;
  const adminEmail = `servease-admin-smoke-${randomUUID()}@example.test`;
  const password = `Smoke-${randomUUID()}-A1!`;

  const customer = await createAuthUser(customerEmail, password);
  const otherCustomer = await createAuthUser(otherCustomerEmail, password);
  const provider = await createAuthUser(providerEmail, password);
  const admin = await createAuthUser(adminEmail, password);
  cleanupState.userId = customer.id;
  cleanupState.otherUserId = otherCustomer.id;
  cleanupState.providerUserId = provider.id;
  cleanupState.adminUserId = admin.id;

  await seedCustomer(customer.id, customerEmail);
  await seedCustomer(otherCustomer.id, otherCustomerEmail);
  await seedAdmin(admin.id, adminEmail);
  const catalogSeed = await seedCatalog();
  await bindProviderUser(catalogSeed.providerId, provider.id, providerEmail);
  const scheduledAt = nextManilaSlotIso(10);
  await seedAvailability(catalogSeed.providerId, scheduledAt);

  const customerToken = await signIn(customerEmail, password);
  const otherCustomerToken = await signIn(otherCustomerEmail, password);
  const providerToken = await signIn(providerEmail, password);
  const adminToken = await signIn(adminEmail, password);

  await startService('auth-service', 8501);
  await startService('user-service', 8502);
  await startService('catalog-service', 8503);
  await startService('booking-service', 8504);
  await startService('messaging-service', 8506);
  await startService('payment-service', 8507);
  await startService('review-service', 8508);
  await startService('notification-service', 8509);
  await startService('support-service', 8510);
  await startService('admin-service', 8511);
  await startService('api-gateway', 5001);

  const booking = await postJson('http://localhost:5001/v1/bookings', customerToken, {
    providerId: catalogSeed.providerId,
    serviceId: catalogSeed.serviceId,
    serviceTitle: 'Smoke Deep Clean Package',
    serviceName: 'Smoke Deep Clean',
    serviceDescription: 'Temporary extended smoke test booking',
    serviceAddress: '123 Smoke Test St',
    scheduledAt,
    hoursRequired: 1,
    serviceAmount: 1200,
    pricingMode: 'flat',
    paymentMethod: 'cash_on_service',
    customerNotes: 'Extended smoke test booking',
  });
  cleanupState.bookingId = booking.id;

  await expectJsonError(
    `http://localhost:5001/v1/bookings/${booking.id}`,
    'GET',
    otherCustomerToken,
    undefined,
    404,
    'booking_not_found',
  );
  await expectJsonError(
    `http://localhost:5001/v1/bookings/${booking.id}/status`,
    'PATCH',
    otherCustomerToken,
    {
      currentStatus: 'pending',
      nextStatus: 'confirmed',
    },
    404,
    'booking_not_found',
  );
  await expectJsonError(
    `http://localhost:5001/v1/bookings/${booking.id}/service-updates`,
    'POST',
    customerToken,
    {
      updateType: 'progress',
      message: 'Customer must not be able to create provider progress.',
    },
    403,
    'provider_profile_required',
  );

  const serviceUpdate = await postJson(
    `http://localhost:5001/v1/bookings/${booking.id}/service-updates`,
    providerToken,
    {
      updateType: 'progress',
      message: 'Extended smoke provider progress update.',
    },
  );
  const [customerUpdates, providerUpdates, otherCustomerUpdates] = await Promise.all([
    getJson(`http://localhost:5001/v1/bookings/${booking.id}/service-updates`, customerToken),
    getJson(`http://localhost:5001/v1/bookings/${booking.id}/service-updates`, providerToken),
    getJson(
      `http://localhost:5001/v1/bookings/${booking.id}/service-updates`,
      otherCustomerToken,
    ),
  ]);
  if (
    !customerUpdates.some((item) => item.id === serviceUpdate.id) ||
    !providerUpdates.some((item) => item.id === serviceUpdate.id) ||
    otherCustomerUpdates.length !== 0
  ) {
    throw new Error('Service update visibility smoke check failed');
  }

  const [customerTimeline, providerTimeline, otherCustomerTimeline] = await Promise.all([
    getJson(`http://localhost:5001/v1/bookings/${booking.id}/timeline`, customerToken),
    getJson(`http://localhost:5001/v1/bookings/${booking.id}/timeline`, providerToken),
    getJson(`http://localhost:5001/v1/bookings/${booking.id}/timeline`, otherCustomerToken),
  ]);
  if (
    !customerTimeline.some((item) => item.eventType === 'created') ||
    !providerTimeline.some((item) => item.eventType === 'created') ||
    otherCustomerTimeline.length !== 0
  ) {
    throw new Error('Timeline visibility smoke check failed');
  }

  const conversation = await postJson(
    'http://localhost:5001/v1/conversations',
    customerToken,
    { bookingId: booking.id },
  );
  cleanupState.conversationId = conversation.id;

  const message = await postJson(
    `http://localhost:5001/v1/conversations/${conversation.id}/messages`,
    customerToken,
    { content: 'Extended smoke message' },
  );
  if (message.content !== 'Extended smoke message') {
    throw new Error('Conversation message content was not returned');
  }

  const messages = await getJson(
    `http://localhost:5001/v1/conversations/${conversation.id}/messages`,
    customerToken,
  );
  if (!messages.some((item) => item.id === message.id)) {
    throw new Error('Created conversation message was not listed');
  }

  const payment = await postJson('http://localhost:5001/v1/payments', customerToken, {
    bookingId: booking.id,
    paymentMethod: 'cash_on_service',
  });
  cleanupState.paymentId = payment.id;
  if (payment.amount !== booking.totalAmount || payment.status !== 'pending') {
    throw new Error('Payment smoke returned unexpected amount or status');
  }

  await expectJsonError(
    `http://localhost:5001/v1/admin/payments/${payment.id}/status`,
    'PATCH',
    customerToken,
    { status: 'paid' },
    403,
    'admin_required',
  );
  await expectJsonError(
    `http://localhost:5001/v1/admin/payments/${payment.id}/status`,
    'PATCH',
    adminToken,
    { status: 'archived' },
    400,
    'invalid_admin_request',
  );

  const paid = await patchJson(
    `http://localhost:5001/v1/admin/payments/${payment.id}/status`,
    adminToken,
    { status: 'paid' },
  );
  if (paid.status !== 'paid') {
    throw new Error('Admin payment status update failed');
  }

  await patchJson(`http://localhost:5001/v1/bookings/${booking.id}/status`, providerToken, {
    currentStatus: 'pending',
    nextStatus: 'confirmed',
  });
  await patchJson(`http://localhost:5001/v1/bookings/${booking.id}/status`, providerToken, {
    currentStatus: 'confirmed',
    nextStatus: 'in_progress',
  });
  await patchJson(`http://localhost:5001/v1/bookings/${booking.id}/status`, providerToken, {
    currentStatus: 'in_progress',
    nextStatus: 'completed',
  });
  const completedTimeline = await getJson(
    `http://localhost:5001/v1/bookings/${booking.id}/timeline`,
    customerToken,
  );
  if (completedTimeline.length < 4) {
    throw new Error('Completed booking timeline did not include status events');
  }

  const review = await postJson('http://localhost:5001/v1/reviews', customerToken, {
    bookingId: booking.id,
    rating: 5,
    reviewText: 'Extended smoke review',
  });
  cleanupState.reviewId = review.id;
  if (review.rating !== 5) {
    throw new Error('Review smoke returned unexpected rating');
  }

  const reviews = await getPublicJson(
    `http://localhost:5001/v1/reviews?providerId=${catalogSeed.providerId}`,
  );
  if (!reviews.some((item) => item.id === review.id)) {
    throw new Error('Provider review list did not include smoke review');
  }

  const supportTicket = await postJson(
    'http://localhost:5001/v1/support/tickets',
    customerToken,
    {
      subject: 'Extended smoke support',
      message: 'Temporary support smoke ticket',
      category: 'booking',
    },
  );
  cleanupState.supportTicketId = supportTicket.id;

  await expectJsonError(
    `http://localhost:5001/v1/admin/support/tickets/${supportTicket.id}/status`,
    'PATCH',
    customerToken,
    { status: 'resolved' },
    403,
    'admin_required',
  );
  await expectJsonError(
    `http://localhost:5001/v1/admin/support/tickets/${supportTicket.id}/status`,
    'PATCH',
    adminToken,
    { status: 'waiting' },
    400,
    'invalid_admin_request',
  );

  const resolvedTicket = await patchJson(
    `http://localhost:5001/v1/admin/support/tickets/${supportTicket.id}/status`,
    adminToken,
    { status: 'resolved' },
  );
  if (resolvedTicket.status !== 'resolved') {
    throw new Error('Admin support ticket status update failed');
  }

  const notification = await seedNotification(customer.id, booking.id);
  cleanupState.notificationId = notification.id;

  const notifications = await getJson('http://localhost:5001/v1/notifications', customerToken);
  if (!notifications.some((item) => item.id === notification.id)) {
    throw new Error('Notification list did not include smoke notification');
  }

  const readNotification = await patchJson(
    `http://localhost:5001/v1/notifications/${notification.id}/read`,
    customerToken,
    {},
  );
  if (!readNotification.isRead) {
    throw new Error('Notification was not marked read');
  }

  console.log(
    JSON.stringify({
      ok: true,
      routes: [
        '/v1/bookings/:id/service-updates',
        '/v1/bookings/:id/timeline',
        '/v1/conversations',
        '/v1/payments',
        '/v1/reviews',
        '/v1/support/tickets',
        '/v1/notifications',
        '/v1/admin/payments',
        '/v1/admin/support/tickets',
      ],
      bookingId: booking.id,
      serviceUpdateId: serviceUpdate.id,
      timelineEvents: completedTimeline.length,
      conversationId: conversation.id,
      paymentStatus: paid.status,
      reviewId: review.id,
      supportStatus: resolvedTicket.status,
      notificationRead: readNotification.isRead,
    }),
  );
}

async function createAuthUser(email, password) {
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create smoke auth user: ${error?.message ?? 'missing user'}`);
  }

  return data.user;
}

async function seedCustomer(userId, email) {
  const { error } = await serviceClient.rpc('servease_smoke_seed_customer', {
    p_user_id: userId,
    p_email: email,
  });
  if (error) {
    throw new Error(`Failed to seed smoke customer: ${error.message}`);
  }
}

async function seedAdmin(userId, email) {
  const { error } = await serviceClient.rpc('servease_smoke_seed_admin', {
    p_user_id: userId,
    p_email: email,
  });
  if (error) {
    throw new Error(`Failed to seed smoke admin: ${error.message}`);
  }
}

async function bindProviderUser(providerId, userId, email) {
  const { error } = await serviceClient.rpc('servease_smoke_bind_provider_user', {
    p_provider_id: providerId,
    p_user_id: userId,
    p_email: email,
  });
  if (error) {
    throw new Error(`Failed to bind smoke provider user: ${error.message}`);
  }
}

async function seedCatalog() {
  const { data, error } = await serviceClient.rpc('servease_smoke_seed_catalog');
  if (error || !data) {
    throw new Error(`Failed to seed catalog smoke data: ${error?.message ?? 'missing seed data'}`);
  }

  cleanupState.categoryId = data.categoryId;
  cleanupState.serviceId = data.serviceId;
  cleanupState.providerId = data.providerId;

  return data;
}

async function seedAvailability(providerId, scheduledAt) {
  const { error } = await serviceClient.rpc('servease_smoke_seed_provider_availability', {
    p_provider_id: providerId,
    p_scheduled_at: scheduledAt,
  });
  if (error) {
    throw new Error(`Failed to seed smoke availability: ${error.message}`);
  }
}

async function seedNotification(userId, bookingId) {
  const { data, error } = await serviceClient.rpc('servease_create_notification', {
    p_user_id: userId,
    p_type: 'booking_update',
    p_title: 'Extended smoke notification',
    p_body: 'Temporary notification for smoke test.',
    p_metadata: { bookingId },
  });

  if (error || !Array.isArray(data) || !data[0]) {
    throw new Error(`Failed to seed smoke notification: ${error?.message ?? 'missing row'}`);
  }

  return {
    id: data[0].id,
  };
}

async function signIn(email, password) {
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    throw new Error(`Failed to sign in smoke user: ${error?.message ?? 'missing session'}`);
  }

  return data.session.access_token;
}

async function postJson(url, token, body) {
  return sendJson(url, 'POST', token, body);
}

async function patchJson(url, token, body) {
  return sendJson(url, 'PATCH', token, body);
}

async function getJson(url, token) {
  return sendJson(url, 'GET', token);
}

async function getPublicJson(url) {
  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.data;
}

async function sendJson(url, method, token, body) {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${url} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.data;
}

async function expectJsonError(url, method, token, body, expectedStatus, expectedCode) {
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  const actualCode = payload.error?.code;

  if (response.status !== expectedStatus || actualCode !== expectedCode) {
    throw new Error(
      `${method} ${url} expected ${expectedStatus}/${expectedCode} but received ${response.status}/${actualCode}: ${JSON.stringify(payload)}`,
    );
  }
}

async function startService(appName, port) {
  const child = spawn('node', [`dist/apps/${appName}/src/main.js`], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  processes.push(child);

  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString();
  });

  await waitForHealthy(port, appName, () => logs);
}

async function waitForHealthy(port, appName, getLogs) {
  const deadline = Date.now() + 15000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${port}/health/live`);
      if (response.ok) {
        return;
      }
      lastError = new Error(`${appName} health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(250);
  }

  throw new Error(
    `${appName} did not become healthy on port ${port}: ${lastError?.message ?? 'timeout'}\n${getLogs()}`,
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function nextManilaSlotIso(hour) {
  const target = new Date(Date.now() + 2 * 86400000);
  target.setUTCHours(hour - 8, 0, 0, 0);
  return target.toISOString();
}

async function cleanup() {
  for (const child of processes.reverse()) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  await serviceClient.rpc('servease_smoke_cleanup_extended', {
    p_user_id: cleanupState.userId,
    p_admin_user_id: cleanupState.adminUserId,
    p_booking_id: cleanupState.bookingId,
    p_conversation_id: cleanupState.conversationId,
    p_payment_id: cleanupState.paymentId,
    p_review_id: cleanupState.reviewId,
    p_support_ticket_id: cleanupState.supportTicketId,
    p_notification_id: cleanupState.notificationId,
  });

  if (cleanupState.categoryId && cleanupState.serviceId && cleanupState.providerId) {
    await serviceClient.rpc('servease_smoke_cleanup_provider_availability', {
      p_provider_id: cleanupState.providerId,
    });

    await serviceClient.rpc('servease_smoke_cleanup_catalog', {
      p_category_id: cleanupState.categoryId,
      p_service_id: cleanupState.serviceId,
      p_provider_id: cleanupState.providerId,
    });
  }

  if (cleanupState.otherUserId) {
    await serviceClient.rpc('servease_smoke_cleanup_extended', {
      p_user_id: cleanupState.otherUserId,
    });
  }

  if (cleanupState.providerUserId) {
    await serviceClient.rpc('servease_smoke_cleanup_extended', {
      p_user_id: cleanupState.providerUserId,
    });
  }

  if (cleanupState.userId) {
    await serviceClient.auth.admin.deleteUser(cleanupState.userId);
  }

  if (cleanupState.otherUserId) {
    await serviceClient.auth.admin.deleteUser(cleanupState.otherUserId);
  }

  if (cleanupState.providerUserId) {
    await serviceClient.auth.admin.deleteUser(cleanupState.providerUserId);
  }

  if (cleanupState.adminUserId) {
    await serviceClient.auth.admin.deleteUser(cleanupState.adminUserId);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
  });
