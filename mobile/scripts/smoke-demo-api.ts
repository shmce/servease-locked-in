import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const repoRoot = resolve(process.cwd(), '..');
const backendDir = resolve(repoRoot, 'backend');
const gatewayUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5001';
const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'ServEaseDemo#2026';
const accounts = {
  customer: process.env.DEMO_CUSTOMER_EMAIL ?? 'customer.demo@servease.test',
  provider: process.env.DEMO_PROVIDER_EMAIL ?? 'provider.demo@servease.test',
  admin: process.env.DEMO_ADMIN_EMAIL ?? 'admin.demo@servease.test',
};
const expected = {
  categoryId: '11111111-1111-4111-8111-111111111111',
  serviceId: '33333333-3333-4333-8333-333333333333',
  providerId: '55555555-5555-4555-8555-555555555555',
  bookingId: '88888888-8888-4888-8888-888888888888',
  notificationId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  payoutMethodId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
};
const processes: ChildProcess[] = [];

loadEnv(resolve(repoRoot, '.env'));
loadEnv(resolve(process.cwd(), '.env'));

async function main() {
  await startCoreServices();

  const { signInWithPassword } = await import('../services/supabaseAuth');
  const api = await import('../services/serveaseApi');
  const [customerSession, providerSession, adminSession] = await Promise.all([
    signInWithPassword({
      email: accounts.customer,
      password,
    }),
    signInWithPassword({
      email: accounts.provider,
      password,
    }),
    signInWithPassword({
      email: accounts.admin,
      password,
    }),
  ]);
  const customerOptions = {
    baseUrl: gatewayUrl,
    token: customerSession.accessToken,
  };
  const providerOptions = {
    baseUrl: gatewayUrl,
    token: providerSession.accessToken,
  };
  const adminOptions = {
    baseUrl: gatewayUrl,
    token: adminSession.accessToken,
  };

  const [customerMe, providerMe, adminMe] = await Promise.all([
    api.getCurrentUser(customerOptions),
    api.getCurrentUser(providerOptions),
    api.getCurrentUser(adminOptions),
  ]);
  assert(customerMe.user.role === 'customer', 'mobile customer profile role mismatch');
  assert(providerMe.user.role === 'provider', 'mobile provider profile role mismatch');
  assert(adminMe.user.role === 'admin', 'mobile admin profile role mismatch');

  const [categories, services, providers, filteredProviders] = await Promise.all([
    api.listCatalogCategories({ baseUrl: gatewayUrl }),
    api.listCatalogServices(expected.categoryId, { baseUrl: gatewayUrl }),
    api.listProviderListings(null, { baseUrl: gatewayUrl }),
    api.listProviderListings(expected.serviceId, { baseUrl: gatewayUrl }),
  ]);
  assert(
    categories.some((item) => item.id === expected.categoryId),
    'mobile catalog categories missing demo category',
  );
  assert(
    services.some((item) => item.id === expected.serviceId),
    'mobile catalog services missing demo service',
  );
  assert(
    providers.some((item) => item.providerId === expected.providerId),
    'mobile provider list missing demo provider',
  );
  assert(
    filteredProviders.some((item) => item.providerId === expected.providerId),
    'mobile filtered provider list missing demo provider',
  );

  const [
    portfolio,
    reviews,
    publicAvailability,
    providerAvailability,
    payoutAccount,
    payoutMethods,
    providerPayouts,
    customerBookings,
    providerBookings,
    customerPaymentMethods,
    referralSummary,
    userPreferences,
  ] = await Promise.all([
    api.listProviderPortfolioMedia(expected.providerId, { baseUrl: gatewayUrl }),
    api.listProviderReviews(expected.providerId, { baseUrl: gatewayUrl }),
    api.getPublicProviderAvailability(expected.providerId, { baseUrl: gatewayUrl }),
    api.getProviderAvailability(providerOptions),
    api.getProviderPayoutAccount(providerOptions),
    api.listProviderPayoutMethods(providerOptions),
    api.listProviderPayouts(providerOptions),
    api.listCustomerBookings(customerOptions),
    api.listProviderBookings(providerOptions),
    api.listCustomerPaymentMethods(customerOptions),
    api.getReferralSummary(customerOptions),
    api.getUserPreferences(customerOptions),
  ]);
  assert(Array.isArray(portfolio), 'mobile provider portfolio did not return an array');
  assert(Array.isArray(reviews), 'mobile provider reviews did not return an array');
  assert(publicAvailability.windows.length > 0, 'mobile public availability missing');
  assert(providerAvailability.windows.length > 0, 'mobile provider availability missing');
  assert(
    payoutAccount.availableBalance >= 0 && payoutAccount.pendingBalance >= 0,
    'mobile provider payout account returned invalid balances',
  );
  assert(
    payoutMethods.some((item) => item.id === expected.payoutMethodId),
    'mobile provider payout methods missing demo method',
  );
  assert(Array.isArray(providerPayouts), 'mobile provider payouts did not return an array');
  assert(
    customerBookings.some((item) => item.id === expected.bookingId),
    'mobile customer bookings missing demo booking',
  );
  assert(
    providerBookings.some((item) => item.id === expected.bookingId),
    'mobile provider bookings missing demo booking',
  );
  assert(
    customerPaymentMethods.some((item) => item.methodType === 'cash_on_service'),
    'mobile customer payment methods missing cash method',
  );
  assert(
    referralSummary.referralCode.startsWith('SE-'),
    'mobile referral summary missing code',
  );
  assert(
    userPreferences.language === 'en' || userPreferences.language === 'fil',
    'mobile user preferences missing language',
  );

  const [
    updates,
    timeline,
    tracking,
    conversations,
    payments,
    tickets,
    notifications,
  ] = await Promise.all([
    api.listBookingServiceUpdates(expected.bookingId, customerOptions),
    api.listBookingTimelineEvents(expected.bookingId, customerOptions),
    api.getBookingTrackingSnapshot(expected.bookingId, customerOptions),
    api.listConversations(customerOptions),
    api.listPayments(customerOptions),
    api.listSupportTickets(customerOptions),
    api.listNotifications(customerOptions),
  ]);
  assert(updates.length > 0, 'mobile booking service updates missing');
  assert(timeline.length >= 2, 'mobile booking timeline missing');
  assert(tracking.bookingId === expected.bookingId, 'mobile booking tracking mismatch');
  assert(conversations.length > 0, 'mobile conversations missing');
  assert(payments.length > 0, 'mobile payments missing');
  const promotion = await api.validatePromotion(
    expected.bookingId,
    'SERVEASE10',
    customerOptions,
  );
  assert(promotion.valid, 'mobile promotion validation did not accept demo code');
  assert(
    promotion.discountAmount > 0 && promotion.finalAmount > 0,
    'mobile promotion validation did not discount the booking amount',
  );
  assert(tickets.length > 0, 'mobile support tickets missing');
  assert(
    notifications.some((item) => item.id === expected.notificationId),
    'mobile notifications missing demo notification',
  );

  const readNotification = await api.markNotificationRead(
    expected.notificationId,
    customerOptions,
  );
  assert(readNotification.isRead, 'mobile mark notification read failed');

  console.log(
    JSON.stringify({
      ok: true,
      mobileApiDemoVerified: true,
      bookingId: expected.bookingId,
      providerId: expected.providerId,
    }),
  );
}

async function startCoreServices(): Promise<void> {
  await Promise.all([
    startService('auth-service', 8501),
    startService('user-service', 8502),
    startService('catalog-service', 8503),
    startService('booking-service', 8504),
    startService('availability-service', 8505),
    startService('messaging-service', 8506),
    startService('payment-service', 8507),
    startService('review-service', 8508),
    startService('notification-service', 8509),
    startService('support-service', 8510),
    startService('admin-service', 8511),
  ]);
  await startService('api-gateway', 5001);
}

async function startService(appName: string, port: number): Promise<void> {
  const child = spawn('node', [`dist/apps/${appName}/src/main.js`], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: appName === 'api-gateway' ? String(port) : process.env.PORT,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  processes.push(child);

  let logs = '';
  child.stdout?.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr?.on('data', (chunk) => {
    logs += chunk.toString();
  });

  await waitForHealthy(port, appName, () => logs);
}

async function waitForHealthy(
  port: number,
  appName: string,
  getLogs: () => string,
): Promise<void> {
  const deadline = Date.now() + 15000;
  let lastError: Error | null = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${port}/health/live`);
      if (response.ok) {
        return;
      }
      lastError = new Error(`${appName} health returned ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    await sleep(250);
  }

  throw new Error(
    `${appName} did not become healthy on port ${port}: ${lastError?.message ?? 'timeout'}\n${getLogs()}`,
  );
}

function loadEnv(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    process.env[key] ??= value;
  }
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function stopProcesses(): Promise<void> {
  await Promise.all(processes.reverse().map((child) => stopProcess(child)));
}

function stopProcess(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 3000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill('SIGKILL');
  });
}

void (async () => {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await stopProcesses();
  }
})();
