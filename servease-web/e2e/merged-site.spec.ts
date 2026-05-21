import { readFile } from 'node:fs/promises';
import { expect, test, type Page, type Route } from '@playwright/test';

function watchRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console.error: ${message.text()}`);
    }
  });

  return errors;
}

async function fulfillJson(route: Route, data: unknown) {
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'authorization, apikey, content-type',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
      },
    });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': '*',
    },
    body: JSON.stringify(data),
  });
}

const providerProfileFixture = {
  user: {
    id: 'provider-user-1',
    email: 'provider@example.test',
    fullName: 'Alex Provider',
    contactNumber: '+639171234567',
    role: 'provider',
    status: 'active',
  },
  customerProfile: null,
  providerProfile: {
    id: 'provider-profile-1',
    businessName: 'Acme Home Services',
    bio: 'Trusted home service provider.',
    serviceDescription: 'Cleaning, repairs, and home maintenance.',
    serviceArea: 'Metro Manila',
    yearsExperience: 6,
    verificationStatus: 'approved',
    averageRating: 4.9,
    reviewCount: 38,
  },
};

const bookingFixture = {
  id: 'booking-smoke',
  bookingReference: 'BK-SMOKE-001',
  customerId: 'customer-smoke',
  customerFullName: 'Maria Santos',
  customerContactNumber: '+639181234567',
  providerId: 'provider-profile-1',
  serviceId: 'service-cleaning',
  serviceTitle: 'Deep Cleaning',
  serviceDescription: 'Whole-home deep cleaning',
  serviceAddress: 'Quezon City, Metro Manila',
  scheduledAt: '2026-05-22T09:00:00.000Z',
  hoursRequired: 3,
  serviceAmount: 1500,
  pricingMode: 'flat',
  customerNotes: 'Please bring cleaning supplies.',
  status: 'pending',
  totalAmount: 1500,
  attachments: [],
};

const dashboardFixture = {
  summary: {
    newRequests: 1,
    todayBookings: 1,
    todayCompleted: 0,
    todayEarnings: 500,
    totalEarnings: 12000,
    overallRating: 4.9,
    reviewCount: 38,
  },
  upcomingBookings: [
    {
      id: bookingFixture.id,
      scheduledAt: bookingFixture.scheduledAt,
      time: '9:00 AM',
      customerName: bookingFixture.customerFullName,
      serviceTitle: bookingFixture.serviceTitle,
      location: bookingFixture.serviceAddress,
      status: 'confirmed',
    },
  ],
  performance: {
    acceptanceRate: 95,
    completionRate: 98,
    responseTimeMinutes: 10,
  },
};

const providerServiceFixture = {
  id: 'owned-service-1',
  providerId: 'provider-profile-1',
  providerBusinessName: 'Acme Home Services',
  serviceId: 'service-cleaning',
  title: 'Deep Cleaning',
  description: 'Whole-home deep cleaning',
  price: 1500,
  pricingMode: 'flat',
  averageRating: 4.9,
  reviewCount: 38,
  verificationStatus: 'approved',
  isActive: true,
};

const providerPortfolioFixture = {
  id: 'portfolio-1',
  providerId: 'provider-profile-1',
  uploadedBy: 'provider-user-1',
  fileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  fileName: 'portfolio.jpg',
  mimeType: 'image/jpeg',
  storagePath: 'portfolio/portfolio.jpg',
  fileSize: 1024,
  caption: 'Completed home cleaning project',
  sortOrder: 1,
  createdAt: '2026-05-20T08:00:00.000Z',
};

const customerProfileFixture = {
  user: {
    id: 'customer-user-1',
    email: 'customer@example.test',
    fullName: 'Customer Example',
    contactNumber: '+639171234567',
    role: 'customer',
    status: 'active',
  },
  customerProfile: {
    id: 'customer-profile-1',
    address: 'Makati City',
  },
  providerProfile: null,
};

const customerBookingFixture = {
  id: 'customer-booking-1',
  bookingReference: 'CB-1001',
  customerId: 'customer-user-1',
  customerFullName: 'Customer Example',
  customerContactNumber: '+639171234567',
  providerId: 'provider-profile-1',
  serviceId: 'service-cleaning',
  serviceTitle: 'Deep Cleaning',
  serviceDescription: 'Whole-home deep cleaning',
  serviceAddress: 'Makati City',
  scheduledAt: '2026-05-24T08:00:00.000Z',
  hoursRequired: 3,
  serviceAmount: 1500,
  pricingMode: 'flat',
  customerNotes: 'Please bring cleaning supplies.',
  status: 'confirmed',
  totalAmount: 1500,
  attachments: [],
};

async function seedProviderSession(page: Page) {
  await page.addInitScript((profile) => {
    localStorage.setItem('servease_provider_access_token', 'provider-session-token');
    localStorage.setItem('servease_provider', JSON.stringify(profile));
  }, providerProfileFixture);
}

interface ProviderGatewayCaptures {
  booking?: Record<string, unknown>;
  availabilityDayOffBodies?: unknown[];
  statusBodies?: unknown[];
  serviceUpdateBodies?: unknown[];
  disputeBodies?: unknown[];
  messageBodies?: unknown[];
}

async function mockProviderGateway(page: Page, captures: ProviderGatewayCaptures = {}) {
  const gatewayBooking = captures.booking ?? bookingFixture;
  const dayOffs: Array<{ offDate: string; reason: string | null }> = [];

  await page.route('**/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();

    if (path === '/v1/me') {
      await fulfillJson(route, { data: providerProfileFixture });
      return;
    }

    if (path === '/v1/me/preferences') {
      await fulfillJson(route, {
        data: {
          userId: 'provider-user-1',
          pushNotificationsEnabled: true,
          darkModeEnabled: false,
          language: 'en',
          notificationPreferences: {},
          updatedAt: '2026-05-20T10:00:00.000Z',
        },
      });
      return;
    }

    if (path === '/v1/me/sessions') {
      await fulfillJson(route, {
        data: [
          {
            id: 'session-1',
            email: 'provider@example.test',
            createdAt: '2026-05-18T08:00:00.000Z',
            lastSignInAt: '2026-05-20T10:00:00.000Z',
            isCurrent: true,
          },
        ],
      });
      return;
    }

    if (path === '/v1/provider/dashboard') {
      await fulfillJson(route, { data: dashboardFixture });
      return;
    }

    if (path === '/v1/provider/profile') {
      await fulfillJson(route, {
        data: {
          account: providerProfileFixture.user,
          provider: providerProfileFixture.providerProfile,
          services: [providerServiceFixture],
          portfolio: [providerPortfolioFixture],
        },
      });
      return;
    }

    if (path === '/v1/provider/services') {
      await fulfillJson(route, { data: [providerServiceFixture] });
      return;
    }

    if (path === '/v1/provider/availability') {
      await fulfillJson(route, {
        data: {
          providerId: 'provider-profile-1',
          windows: [],
          daysOff: dayOffs,
        },
      });
      return;
    }

    if (path === '/v1/provider/availability/days-off') {
      const body = route.request().postDataJSON();
      captures.availabilityDayOffBodies?.push(body);
      dayOffs.push({
        offDate: body.offDate,
        reason: body.reason ?? null,
      });
      await fulfillJson(route, {
        data: {
          providerId: 'provider-profile-1',
          windows: [],
          daysOff: dayOffs,
        },
      });
      return;
    }

    if (path === '/v1/bookings') {
      await fulfillJson(route, { data: [gatewayBooking] });
      return;
    }

    if (path === `/v1/bookings/${bookingFixture.id}`) {
      await fulfillJson(route, { data: gatewayBooking });
      return;
    }

    if (path === `/v1/bookings/${bookingFixture.id}/status`) {
      const body = route.request().postDataJSON();
      captures.statusBodies?.push(body);
      await fulfillJson(route, {
        data: {
          ...gatewayBooking,
          status: body.nextStatus,
        },
      });
      return;
    }

    if (path === `/v1/bookings/${bookingFixture.id}/tracking`) {
      await fulfillJson(route, { data: null });
      return;
    }

    if (path === `/v1/bookings/${bookingFixture.id}/service-updates`) {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        captures.serviceUpdateBodies?.push(body);
        await fulfillJson(route, {
          data: {
            id: 'service-update-e2e',
            bookingId: bookingFixture.id,
            actorId: 'provider-user-1',
            updateType: body.updateType,
            message: body.message,
            checklist: body.checklist ?? null,
            attachmentId: body.attachmentId ?? null,
            createdAt: '2026-05-20T10:30:00.000Z',
          },
        });
        return;
      }

      await fulfillJson(route, { data: [] });
      return;
    }

    if (path === `/v1/bookings/${bookingFixture.id}/disputes`) {
      const body = route.request().postDataJSON();
      captures.disputeBodies?.push(body);
      await fulfillJson(route, {
        data: {
          id: 'dispute-e2e',
          bookingId: bookingFixture.id,
          providerId: bookingFixture.providerId,
          category: body.category,
          reason: body.reason,
          description: body.description ?? null,
          status: 'open',
          createdAt: '2026-05-20T10:45:00.000Z',
        },
      });
      return;
    }

    if (path === '/v1/payments') {
      await fulfillJson(route, {
        data: [
          {
            id: 'payment-smoke',
            bookingId: bookingFixture.id,
            customerId: bookingFixture.customerId,
            providerId: bookingFixture.providerId,
            amount: 1500,
            platformFee: 150,
            providerPayout: 1350,
            status: 'paid',
            paymentMethod: 'cash',
            paidAt: '2026-05-20T09:00:00.000Z',
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
      return;
    }

    if (path === '/v1/payments/payout-account') {
      await fulfillJson(route, {
        data: {
          availableBalance: 1350,
          pendingBalance: 500,
          totalPaidOut: 12000,
          nextPayoutDate: '2026-05-25T00:00:00.000Z',
        },
      });
      return;
    }

    if (path === '/v1/payments/payout-methods') {
      await fulfillJson(route, {
        data: [
          {
            id: 'payout-method-1',
            providerId: 'provider-profile-1',
            methodType: 'gcash',
            accountLabel: 'GCash ending 1234',
            accountName: 'Alex Provider',
            accountNumberLast4: '1234',
            isDefault: true,
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
      return;
    }

    if (path === '/v1/payments/payouts') {
      await fulfillJson(route, { data: [] });
      return;
    }

    if (path === '/v1/conversations') {
      if (method === 'POST') {
        await fulfillJson(route, {
          data: {
            id: 'conversation-1',
            bookingId: bookingFixture.id,
            customerId: bookingFixture.customerId,
            providerId: bookingFixture.providerId,
            lastMessageAt: '2026-05-20T10:00:00.000Z',
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        });
        return;
      }

      await fulfillJson(route, {
        data: [
          {
            id: 'conversation-1',
            bookingId: bookingFixture.id,
            customerId: bookingFixture.customerId,
            providerId: bookingFixture.providerId,
            lastMessageAt: '2026-05-20T10:00:00.000Z',
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
      return;
    }

    if (path === '/v1/conversations/conversation-1/messages') {
      if (method === 'POST') {
        const body = route.request().postDataJSON();
        captures.messageBodies?.push(body);
        await fulfillJson(route, {
          data: {
            id: 'message-e2e',
            conversationId: 'conversation-1',
            senderId: 'provider-user-1',
            senderRole: 'provider',
            content: body.content,
            deliveryStatus: 'sent',
            createdAt: '2026-05-20T10:35:00.000Z',
            attachment: body.attachment ?? null,
          },
        });
        return;
      }

      await fulfillJson(route, {
        data: [
          {
            id: 'message-customer-e2e',
            conversationId: 'conversation-1',
            senderId: bookingFixture.customerId,
            senderRole: 'customer',
            content: 'Hi, please message me when you are on the way.',
            deliveryStatus: 'sent',
            createdAt: '2026-05-20T09:30:00.000Z',
            attachment: null,
          },
        ],
      });
      return;
    }

    if (path === '/v1/notifications') {
      await fulfillJson(route, { data: [] });
      return;
    }

    if (path === '/v1/reviews') {
      await fulfillJson(route, {
        data: [
          {
            id: 'review-1',
            bookingId: bookingFixture.id,
            providerId: 'provider-profile-1',
            reviewerId: 'customer-smoke',
            reviewerFullName: 'Maria Santos',
            rating: 5,
            reviewText: 'Excellent service.',
            isFlagged: false,
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
      return;
    }

    if (path === '/v1/support/tickets') {
      await fulfillJson(route, { data: [] });
      return;
    }

    if (path === '/v1/referrals') {
      await fulfillJson(route, {
        data: {
          referralCode: 'SERVEASE-ALEX',
          referralLinkPath: '/register?ref=SERVEASE-ALEX',
          completedReferrals: 0,
          pendingReferrals: 0,
          totalRewards: 0,
        },
      });
      return;
    }

    await fulfillJson(route, { data: null });
  });
}

test.describe('merged landing and provider website', () => {
  test('keeps the public landing routes and customer login separate', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /book trusted services/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    await expect(page.getByRole('link', { name: 'Join as a Worker' })).toHaveAttribute(
      'href',
      '/provider-registration',
    );

    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Access your account profile and provider status.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('store badges route to the contact flow when store URLs are not configured', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/');
    await page.getByRole('link', { name: /google play/i }).click();
    await expect(page).toHaveURL(/\/contact\?subject=Mobile%20app%20download%20access$/);
    await expect(page.getByLabel('Subject')).toHaveValue('Mobile app download access');

    expect(errors).toEqual([]);
  });

  test('customer login is wired to Supabase instead of failing setup checks', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByText('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.'),
    ).toHaveCount(0);

    await page.getByLabel('Email').fill('not-a-real-customer@example.invalid');
    await page.getByLabel('Password', { exact: true }).fill('DefinitelyNotThePassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(
      page.getByText('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.'),
    ).toHaveCount(0);
  });

  test('provider account using public sign in is routed to the provider dashboard', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await fulfillJson(route, {
        access_token: 'provider-session-token',
        refresh_token: 'provider-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'provider-user-1',
          email: 'provider@example.test',
        },
      });
    });
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': '*',
        },
        body: JSON.stringify({
          id: 'provider-user-1',
          email: 'provider@example.test',
        }),
      });
    });

    const fulfillProviderProfile = async (route: Route) => {
      await fulfillJson(route, {
        data: {
          user: {
            id: 'provider-user-1',
            email: 'provider@example.test',
            fullName: 'Alex Provider',
            contactNumber: '+639171234567',
            role: 'provider',
            status: 'active',
          },
          customerProfile: null,
          providerProfile: {
            id: 'provider-profile-1',
            businessName: 'Acme Home Services',
            verificationStatus: 'approved',
            averageRating: 4.9,
            reviewCount: 38,
          },
        },
      });
    };

    await page.route('**/api/me', fulfillProviderProfile);
    await page.route('**/v1/me', fulfillProviderProfile);

    await page.route('**/v1/notifications', async (route) => {
      await fulfillJson(route, { data: [] });
    });

    await page.route('**/v1/provider/profile', async (route) => {
      await fulfillJson(route, {
        data: {
          account: providerProfileFixture.user,
          provider: providerProfileFixture.providerProfile,
          services: [providerServiceFixture],
          portfolio: [providerPortfolioFixture],
        },
      });
    });

    await page.route('**/v1/provider/availability', async (route) => {
      await fulfillJson(route, {
        data: {
          providerId: 'provider-profile-1',
          windows: [],
          daysOff: [],
        },
      });
    });

    await page.route('**/v1/provider/dashboard', async (route) => {
      await fulfillJson(route, {
        data: {
          summary: {
            newRequests: 1,
            todayBookings: 1,
            todayCompleted: 0,
            todayEarnings: 500,
            totalEarnings: 12000,
            overallRating: 4.9,
            reviewCount: 38,
          },
          upcomingBookings: [],
          performance: {
            acceptanceRate: 95,
            completionRate: 98,
            responseTimeMinutes: 10,
          },
        },
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('provider@example.test');
    await page.getByLabel('Password', { exact: true }).fill('CorrectProviderPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/provider\/dashboard$/);
    await expect(page.getByText('Welcome back, Acme Home Services')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sign in to ServEase' })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('renders provider login under /provider/login without the public shell', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/provider/login');
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();
    await expect(page.getByText('Welcome back! Please enter your details')).toBeVisible();
    await expect(page.locator('nav')).toHaveCount(0);

    await page.getByRole('button', { name: 'Apply now' }).click();
    await expect(page).toHaveURL(/\/provider-registration$/);
    await expect(page.getByRole('heading', { name: 'Join ServEase as a Service Worker' })).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('provider login is wired to Supabase instead of failing setup checks', async ({ page }) => {
    await page.goto('/provider/login');
    await expect(
      page.getByText('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for provider login.'),
    ).toHaveCount(0);

    await page.getByLabel('Email or Phone Number').fill('not-a-real-provider@example.invalid');
    await page.getByLabel('Password').fill('DefinitelyNotThePassword123!');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText(/invalid|incorrect|credentials/i)).toBeVisible();
    await expect(
      page.getByText('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for provider login.'),
    ).toHaveCount(0);
  });

  test('valid provider login lands in the merged provider dashboard', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await fulfillJson(route, {
        access_token: 'provider-session-token',
        refresh_token: 'provider-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'provider-user-1',
          email: 'provider@example.test',
        },
      });
    });

    await page.route('**/v1/me', async (route) => {
      await fulfillJson(route, {
        data: {
          user: {
            id: 'provider-user-1',
            email: 'provider@example.test',
            fullName: 'Alex Provider',
            contactNumber: '+639171234567',
            role: 'provider',
            status: 'active',
          },
          customerProfile: null,
          providerProfile: {
            id: 'provider-profile-1',
            businessName: 'Acme Home Services',
            verificationStatus: 'approved',
            averageRating: 4.9,
            reviewCount: 38,
          },
        },
      });
    });

    await page.route('**/v1/notifications', async (route) => {
      await fulfillJson(route, { data: [] });
    });

    await page.route('**/v1/provider/dashboard', async (route) => {
      await fulfillJson(route, {
        data: {
          summary: {
            newRequests: 2,
            todayBookings: 3,
            todayCompleted: 1,
            todayEarnings: 1250,
            totalEarnings: 48300,
            overallRating: 4.9,
            reviewCount: 38,
          },
          upcomingBookings: [
            {
              id: 'booking-1',
              scheduledAt: '2026-05-21T09:00:00.000Z',
              time: '9:00 AM',
              customerName: 'Maria Santos',
              serviceTitle: 'Deep Cleaning',
              location: 'Quezon City',
              status: 'confirmed',
            },
          ],
          performance: {
            acceptanceRate: 96,
            completionRate: 98,
            responseTimeMinutes: 12,
          },
        },
      });
    });

    await page.goto('/provider/login');
    await page.getByLabel('Email or Phone Number').fill('provider@example.test');
    await page.getByLabel('Password').fill('CorrectProviderPassword123!');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/provider\/dashboard$/);
    await expect(page.getByText('Welcome back, Acme Home Services')).toBeVisible();
    await expect(page.getByText('New Requests')).toBeVisible();
    await expect(page.getByText('Maria Santos')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('redirects unauthenticated provider dashboard traffic to provider login', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/provider');
    await expect(page).toHaveURL(/\/provider\/login$/);
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();

    await page.goto('/provider/dashboard');
    await expect(page).toHaveURL(/\/provider\/login$/);
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('provider settings and help actions are wired to real routes and backend-backed panels', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    const providerProfile = {
      user: {
        id: 'provider-user-1',
        email: 'provider@example.test',
        fullName: 'Alex Provider',
        contactNumber: '+639171234567',
        role: 'provider',
        status: 'active',
      },
      customerProfile: null,
      providerProfile: {
        id: 'provider-profile-1',
        businessName: 'Acme Home Services',
        verificationStatus: 'approved',
        averageRating: 4.9,
        reviewCount: 38,
      },
    };

    await page.addInitScript((profile) => {
      localStorage.setItem('servease_provider_access_token', 'provider-session-token');
      localStorage.setItem('servease_provider', JSON.stringify(profile));
    }, providerProfile);

    await page.route('**/v1/me', async (route) => {
      await fulfillJson(route, { data: providerProfile });
    });

    await page.route('**/v1/me/preferences', async (route) => {
      await fulfillJson(route, {
        data: {
          userId: 'provider-user-1',
          pushNotificationsEnabled: true,
          darkModeEnabled: false,
          language: 'en',
          notificationPreferences: {},
          updatedAt: '2026-05-20T10:00:00.000Z',
        },
      });
    });

    await page.route('**/v1/me/sessions', async (route) => {
      await fulfillJson(route, {
        data: [
          {
            id: 'session-1',
            email: 'provider@example.test',
            createdAt: '2026-05-18T08:00:00.000Z',
            lastSignInAt: '2026-05-20T10:00:00.000Z',
            isCurrent: true,
          },
        ],
      });
    });

    await page.route('**/v1/notifications', async (route) => {
      await fulfillJson(route, { data: [] });
    });

    await page.route('**/v1/provider/profile', async (route) => {
      await fulfillJson(route, {
        data: {
          account: providerProfile.user,
          provider: providerProfile.providerProfile,
          services: [],
          portfolio: [],
        },
      });
    });

    await page.route('**/v1/provider/availability', async (route) => {
      await fulfillJson(route, {
        data: {
          providerId: 'provider-profile-1',
          windows: [],
          daysOff: [],
        },
      });
    });

    await page.route('**/v1/support/tickets', async (route) => {
      await fulfillJson(route, { data: [] });
    });

    await page.goto('/provider/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.getByRole('link', { name: /service area/i }).click();
    await expect(page).toHaveURL(/\/provider\/edit-profile$/);

    await page.goto('/provider/settings');
    await page.getByRole('button', { name: /login activity/i }).click();
    await expect(page.getByText('provider@example.test (current)')).toBeVisible();

    await page.getByRole('button', { name: /privacy settings/i }).click();
    await expect(page.getByText('Your public provider profile displays business')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Notification Preferences' }).last()).toHaveAttribute(
      'href',
      '/provider/notification-preferences',
    );

    await page.getByRole('button', { name: /provider agreement/i }).click();
    await expect(page.getByText('Keep your provider profile, services, prices')).toBeVisible();

    await page.getByRole('link', { name: /provider community/i }).click();
    await expect(page).toHaveURL(/\/provider\/help-center\?category=general&subject=Provider%20Community$/);
    await expect(page.getByPlaceholder('Subject')).toHaveValue('Provider Community');

    await page.getByRole('button', { name: /message us on facebook/i }).click();
    await expect(page.getByPlaceholder('Subject')).toHaveValue('Facebook support request');

    await page.goto('/provider/settings');
    await page.getByRole('button', { name: 'Log Out', exact: true }).click();
    await expect(page).toHaveURL(/\/provider\/login$/);
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();

    const storedToken = await page.evaluate(() =>
      localStorage.getItem('servease_provider_access_token'),
    );
    expect(storedToken).toBeNull();
    expect(errors).toEqual([]);
  });

  test('provider earnings filters and CSV export use live payment data', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    const providerProfile = {
      user: {
        id: 'provider-user-1',
        email: 'provider@example.test',
        fullName: 'Alex Provider',
        contactNumber: '+639171234567',
        role: 'provider',
        status: 'active',
      },
      customerProfile: null,
      providerProfile: {
        id: 'provider-profile-1',
        businessName: 'Acme Home Services',
        verificationStatus: 'approved',
        averageRating: 4.9,
        reviewCount: 38,
      },
    };

    await page.addInitScript((profile) => {
      localStorage.setItem('servease_provider_access_token', 'provider-session-token');
      localStorage.setItem('servease_provider', JSON.stringify(profile));
    }, providerProfile);

    await page.route('**/v1/me', async (route) => {
      await fulfillJson(route, { data: providerProfile });
    });

    await page.route('**/v1/notifications', async (route) => {
      await fulfillJson(route, { data: [] });
    });

    await page.route('**/v1/provider/profile', async (route) => {
      await fulfillJson(route, {
        data: {
          account: providerProfile.user,
          provider: providerProfile.providerProfile,
          services: [],
          portfolio: [],
        },
      });
    });

    await page.route('**/v1/provider/availability', async (route) => {
      await fulfillJson(route, {
        data: {
          providerId: 'provider-profile-1',
          windows: [],
          daysOff: [],
        },
      });
    });

    await page.route('**/v1/payments', async (route) => {
      await fulfillJson(route, {
        data: [
          {
            id: 'payment-new',
            bookingId: 'booking-20',
            customerId: 'customer-new',
            providerId: 'provider-profile-1',
            amount: 1500,
            platformFee: 150,
            providerPayout: 1350,
            status: 'paid',
            paymentMethod: 'cash',
            paidAt: '2026-05-20T09:00:00.000Z',
            createdAt: '2026-05-20T08:00:00.000Z',
          },
          {
            id: 'payment-old',
            bookingId: 'booking-18',
            customerId: 'customer-old',
            providerId: 'provider-profile-1',
            amount: 900,
            platformFee: 90,
            providerPayout: 810,
            status: 'pending',
            paymentMethod: 'cash',
            paidAt: null,
            createdAt: '2026-05-18T08:00:00.000Z',
          },
        ],
      });
    });

    await page.goto('/provider/earningsdetails');
    await expect(page.getByRole('heading', { name: 'Earnings Details' })).toBeVisible();
    await expect(page.getByText('booking-20')).toBeVisible();
    await expect(page.getByText('booking-18')).toBeVisible();

    await page.locator('input[type="date"]').first().fill('2026-05-20');
    await expect(page.getByText('booking-20')).toBeVisible();
    await expect(page.getByText('booking-18')).toHaveCount(0);
    await expect(page.getByText('1 transactions')).toBeVisible();

    await page.getByRole('button', { name: /^Export$/ }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export as CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^servease-earnings-\d{4}-\d{2}-\d{2}\.csv$/);

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const csv = await readFile(downloadPath!, 'utf8');
    expect(csv).toContain('booking-20');
    expect(csv).not.toContain('booking-18');

    expect(errors).toEqual([]);
  });

  test('provider booking details actions update gateway-backed workflow', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    const statusBodies: unknown[] = [];
    const serviceUpdateBodies: unknown[] = [];
    const disputeBodies: unknown[] = [];
    const messageBodies: unknown[] = [];

    await seedProviderSession(page);
    await mockProviderGateway(page, {
      booking: {
        ...bookingFixture,
        status: 'confirmed',
        attachments: [
          {
            id: 'attachment-1',
            bookingId: bookingFixture.id,
            uploadedBy: bookingFixture.customerId,
            mediaKind: 'booking_reference',
            fileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
            fileName: 'reference.jpg',
            mimeType: 'image/jpeg',
            storagePath: 'booking/reference.jpg',
            fileSize: 1024,
            caption: 'Reference photo',
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      },
      statusBodies,
      serviceUpdateBodies,
      disputeBodies,
      messageBodies,
    });

    await page.goto(`/provider/booking-details/${bookingFixture.id}`);
    await expect(page.getByText(bookingFixture.bookingReference)).toBeVisible();
    await expect(page.getByText('Hi, please message me when you are on the way.')).toBeVisible();

    await page.getByRole('button', { name: 'Message', exact: true }).click();
    await page.getByPlaceholder('Type a message...').fill('I am on my way now.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('I am on my way now.')).toBeVisible();
    expect(messageBodies[0]).toEqual({
      content: 'I am on my way now.',
      attachment: null,
    });

    await page.getByRole('button', { name: 'Start Trip' }).click();
    await expect(page.getByPlaceholder('Share a progress update for the customer...')).toBeVisible();
    expect(statusBodies[0]).toEqual({
      currentStatus: 'confirmed',
      nextStatus: 'in_progress',
      reason: null,
      explanation: null,
    });

    await page
      .getByPlaceholder('Share a progress update for the customer...')
      .fill('Cleaning has started in the kitchen.');
    await page.getByRole('button', { name: 'Post Progress Update' }).click();
    await expect(page.getByText('Cleaning has started in the kitchen.')).toBeVisible();
    expect(serviceUpdateBodies[0]).toEqual({
      updateType: 'progress',
      message: 'Cleaning has started in the kitchen.',
      attachmentId: null,
    });

    await page.getByPlaceholder('Reason').fill('Customer unavailable');
    await page
      .getByPlaceholder('Describe what happened...')
      .fill('Customer did not answer the door after repeated calls.');
    await page.getByRole('button', { name: 'Raise Dispute' }).click();
    expect(disputeBodies[0]).toEqual({
      category: 'Customer unavailable',
      reason: 'Customer did not answer the door after repeated calls.',
    });

    await page.getByRole('button', { name: 'Complete Service' }).click();
    await expect(page.getByRole('button', { name: 'Complete Service' })).toHaveCount(0);
    expect(statusBodies[1]).toEqual({
      currentStatus: 'in_progress',
      nextStatus: 'completed',
      reason: null,
      explanation: null,
    });

    expect(errors).toEqual([]);
  });

  test('provider registration wizard submits the full application and uploads ID', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    let registrationDraft: unknown = null;
    let uploadedDocumentAuthorization: string | undefined;

    await page.route('**/api/provider-registration', async (route) => {
      registrationDraft = route.request().postDataJSON();
      await fulfillJson(route, {
        data: {
          user: {
            id: 'provider-user-2',
            email: 'new-provider@example.test',
          },
          providerApplication: {
            applicationReference: 'PA-E2E-001',
            verificationStatus: 'pending',
          },
        },
      });
    });

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await fulfillJson(route, {
        access_token: 'new-provider-token',
        refresh_token: 'new-provider-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'provider-user-2',
          email: 'new-provider@example.test',
        },
      });
    });

    await page.route('**/v1/uploads', async (route) => {
      uploadedDocumentAuthorization = route.request().headers().authorization;
      await fulfillJson(route, {
        data: {
          bucket: 'servease',
          path: 'provider-documents/provider-user-2/id.png',
          publicUrl: 'https://storage.example.test/id.png',
          kind: 'provider_document',
          contentType: 'image/png',
          size: 16,
        },
      });
    });

    await page.goto('/provider-registration/step-1');
    await page.getByPlaceholder('Enter your full name').fill('New Provider');
    await page.getByPlaceholder('your.email@example.com').fill('new-provider@example.test');
    await page.getByPlaceholder('9123456789').fill('9123456789');
    await page.getByPlaceholder('Enter your password').fill('ProviderPass123');
    await page.getByPlaceholder('Confirm your password').fill('ProviderPass123');
    await page.locator('input[name="acceptedPolicies"]').check();
    await page.getByRole('button', { name: /continue to profile/i }).click();

    await expect(page).toHaveURL(/\/provider-registration\/step-2$/);
    await page.getByPlaceholder(/maria home cleaning/i).fill('New Provider Cleaning');
    await page.getByPlaceholder('Select a service category').fill('Domestic & Cleaning Services');
    await page.locator('select[name="subCategory"]').selectOption('Deep Cleaning');
    await page.getByPlaceholder('Select years of experience').fill('3–5 years');
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await expect(page).toHaveURL(/\/provider-registration\/step-3$/);
    await page.getByPlaceholder(/123 main street/i).fill('123 Main Street');
    await page.getByPlaceholder('Search your city').fill('Quezon City');
    await page.getByPlaceholder('Search your province').fill('Metro Manila');
    await page.getByPlaceholder('1000').fill('1100');
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await expect(page).toHaveURL(/\/provider-registration\/step-4$/);
    await page.locator('select[name="idType"]').selectOption('Philippine National ID (PhilID)');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'provider-id.png',
      mimeType: 'image/png',
      buffer: Buffer.from('provider-id-image'),
    });
    await page.getByRole('button', { name: /submit application/i }).click();

    await expect(page).toHaveURL(/\/provider-registration\/success$/);
    await expect(page.getByText('Registration Submitted Successfully!')).toBeVisible();
    expect(registrationDraft).toMatchObject({
      step1: {
        fullName: 'New Provider',
        email: 'new-provider@example.test',
        contactNumber: '9123456789',
        password: 'ProviderPass123',
      },
      step2: {
        businessName: 'New Provider Cleaning',
        primaryCategory: 'Domestic & Cleaning Services',
        subCategory: 'Deep Cleaning',
        experienceYears: '3–5 years',
      },
      step3: {
        streetAddress: '123 Main Street',
        city: 'Quezon City',
        province: 'Metro Manila',
        zipCode: '1100',
        maxServiceRadius: 10,
      },
      step4: {
        idType: 'Philippine National ID (PhilID)',
        fileName: 'provider-id.png',
      },
    });
    expect(uploadedDocumentAuthorization).toBe('Bearer new-provider-token');
    expect(await page.evaluate(() => sessionStorage.getItem('providerRegStep1'))).toBeNull();
    expect(errors).toEqual([]);
  });

  test('customer account hydrates gateway data and performs account actions', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    let savedProfileBody: unknown = null;
    let savedPreferencesBody: unknown = null;
    let savedPaymentMethodBody: unknown = null;
    let sentSupportReplyBody: unknown = null;
    let passwordBody: unknown = null;
    let twoFactorVerifyBody: unknown = null;
    let twoFactorDisableBody: unknown = null;
    let deletedPaymentMethodId = '';

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await fulfillJson(route, {
        access_token: 'customer-session-token',
        refresh_token: 'customer-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'customer-user-1',
          email: 'customer@example.test',
        },
      });
    });

    await page.route('**/auth/v1/user', async (route) => {
      await fulfillJson(route, customerProfileFixture.user);
    });

    await page.route('**/api/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        savedProfileBody = route.request().postDataJSON();
        await fulfillJson(route, {
          data: {
            ...customerProfileFixture,
            user: {
              ...customerProfileFixture.user,
              fullName: 'Customer Updated',
            },
            customerProfile: {
              ...customerProfileFixture.customerProfile,
              address: 'BGC Taguig',
            },
          },
        });
        return;
      }

      await fulfillJson(route, { data: customerProfileFixture });
    });

    await page.route('**/api/me/password', async (route) => {
      passwordBody = route.request().postDataJSON();
      await fulfillJson(route, { data: { ok: true } });
    });

    await page.route('**/api/me/two-factor/enable', async (route) => {
      await fulfillJson(route, {
        data: {
          enabled: false,
          secret: 'JBSWY3DPEHPK3PXP',
          otpauthUrl: 'otpauth://totp/ServEase:customer@example.test',
          qrCodeDataUrl: 'data:image/png;base64,AA==',
        },
      });
    });

    await page.route('**/api/me/two-factor/verify', async (route) => {
      twoFactorVerifyBody = route.request().postDataJSON();
      await fulfillJson(route, {
        data: {
          enabled: true,
          verifiedAt: '2026-05-20T10:00:00.000Z',
        },
      });
    });

    await page.route('**/api/me/two-factor/disable', async (route) => {
      twoFactorDisableBody = route.request().postDataJSON();
      await fulfillJson(route, {
        data: {
          enabled: false,
          verifiedAt: null,
        },
      });
    });

    await page.route('**/api/bookings', async (route) => {
      await fulfillJson(route, { data: [customerBookingFixture] });
    });

    await page.route('**/api/notifications', async (route) => {
      await fulfillJson(route, {
        data: [
          {
            id: 'notification-1',
            userId: 'customer-user-1',
            type: 'booking_confirmed',
            title: 'Booking confirmed',
            body: 'Your deep cleaning booking was confirmed.',
            isRead: false,
            metadata: { bookingId: customerBookingFixture.id },
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
    });

    await page.route('**/api/payments/methods/payment-method-2', async (route) => {
      deletedPaymentMethodId = 'payment-method-2';
      await fulfillJson(route, {
        data: {
          id: 'payment-method-2',
          customerId: 'customer-user-1',
          methodType: 'gcash',
          label: 'Personal GCash',
          brand: 'GCash',
          last4: '7788',
          isDefault: true,
          createdAt: '2026-05-20T08:00:00.000Z',
        },
      });
    });

    await page.route('**/api/notifications/notification-1/read', async (route) => {
      await fulfillJson(route, {
        data: {
          id: 'notification-1',
          userId: 'customer-user-1',
          type: 'booking_confirmed',
          title: 'Booking confirmed',
          body: 'Your deep cleaning booking was confirmed.',
          isRead: true,
          metadata: { bookingId: customerBookingFixture.id },
          createdAt: '2026-05-20T08:00:00.000Z',
        },
      });
    });

    await page.route('**/api/referrals', async (route) => {
      await fulfillJson(route, {
        data: {
          referralCode: 'SE-CUST-001',
          referralLinkPath: '/register?ref=SE-CUST-001',
          completedReferrals: 2,
          pendingReferrals: 1,
          totalRewards: 300,
        },
      });
    });

    await page.route('**/api/payments/methods', async (route) => {
      if (route.request().method() === 'PUT') {
        savedPaymentMethodBody = route.request().postDataJSON();
        await fulfillJson(route, {
          data: {
            id: 'payment-method-2',
            customerId: 'customer-user-1',
            methodType: 'gcash',
            label: 'Personal GCash',
            brand: 'GCash',
            last4: '7788',
            isDefault: true,
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        });
        return;
      }

      await fulfillJson(route, {
        data: [
          {
            id: 'payment-method-1',
            customerId: 'customer-user-1',
            methodType: 'cash_on_service',
            label: 'Cash on service',
            brand: null,
            last4: null,
            isDefault: true,
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
    });

    await page.route('**/api/me/preferences', async (route) => {
      if (route.request().method() === 'PUT') {
        savedPreferencesBody = route.request().postDataJSON();
        await fulfillJson(route, {
          data: {
            userId: 'customer-user-1',
            pushNotificationsEnabled: true,
            darkModeEnabled: false,
            language: 'en',
            notificationPreferences: {
              bookingConfirmations: true,
              bookingReminders: true,
              bookingUpdates: true,
              providerMessages: true,
              paymentReceipts: true,
              promotionalOffers: true,
              platformUpdates: true,
            },
            updatedAt: '2026-05-20T10:00:00.000Z',
          },
        });
        return;
      }

      await fulfillJson(route, {
        data: {
          userId: 'customer-user-1',
          pushNotificationsEnabled: true,
          darkModeEnabled: false,
          language: 'en',
          notificationPreferences: {
            bookingConfirmations: true,
            bookingReminders: true,
            bookingUpdates: true,
            providerMessages: true,
            paymentReceipts: true,
            promotionalOffers: false,
            platformUpdates: true,
          },
          updatedAt: '2026-05-20T08:00:00.000Z',
        },
      });
    });

    await page.route(/\/api\/support-tickets$/, async (route) => {
      await fulfillJson(route, {
        data: [
          {
            id: 'ticket-1',
            userId: 'customer-user-1',
            subject: 'Booking question',
            message: 'Can I update arrival instructions?',
            category: 'booking_issue',
            status: 'open',
            createdAt: '2026-05-20T08:00:00.000Z',
            attachments: [],
          },
        ],
      });
    });

    await page.route(/\/api\/support-tickets\/ticket-1\/replies(?:\?.*)?$/, async (route) => {
      if (route.request().method() === 'POST') {
        sentSupportReplyBody = route.request().postDataJSON();
        await fulfillJson(route, {
          data: {
            id: 'reply-2',
            ticketId: 'ticket-1',
            repliedBy: 'customer-user-1',
            message: 'Thanks, please keep me posted.',
            createdAt: '2026-05-20T10:00:00.000Z',
          },
        });
        return;
      }

      await fulfillJson(route, {
        data: [
          {
            id: 'reply-1',
            ticketId: 'ticket-1',
            repliedBy: 'support-user-1',
            message: 'Support is reviewing your booking.',
            createdAt: '2026-05-20T09:00:00.000Z',
          },
        ],
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('customer@example.test');
    await page.getByLabel('Password', { exact: true }).fill('CustomerPass123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();
    await expect(page.getByText('Customer Example')).toBeVisible();
    await expect(page.getByText('Booking confirmed')).toBeVisible();
    await expect(page.getByText('SE-CUST-001', { exact: true })).toBeVisible();
    await expect(page.getByText('Deep Cleaning', { exact: true })).toBeVisible();
    await expect(page.getByText('Booking question')).toBeVisible();

    await page.getByRole('button', { name: 'Mark Read' }).click();
    await expect(page.getByText('0 unread')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Full Name').fill('Customer Updated');
    await page.getByLabel('Address').fill('BGC Taguig');
    await page.getByRole('button', { name: /^Save$/ }).first().click();
    await expect(page.getByText('Profile updated.')).toBeVisible();
    expect(savedProfileBody).toMatchObject({
      fullName: 'Customer Updated',
      address: 'BGC Taguig',
    });

    await page.getByRole('switch', { name: 'Promotional offers' }).click();
    await page.getByRole('button', { name: 'Save Preferences' }).click();
    await expect(page.getByText('Notification preferences saved.')).toBeVisible();
    expect(savedPreferencesBody).toMatchObject({
      pushNotificationsEnabled: true,
      notificationPreferences: {
        promotionalOffers: true,
      },
    });

    const securitySection = page.locator('section').filter({ hasText: 'Security' });
    await securitySection.getByLabel('Current Password').fill('OldPassword#2026');
    await securitySection.getByLabel('New Password', { exact: true }).fill('NewPassword#2026');
    await securitySection.getByLabel('Confirm New Password').fill('NewPassword#2026');
    await securitySection.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByText('Password updated.')).toBeVisible();
    expect(passwordBody).toEqual({
      currentPassword: 'OldPassword#2026',
      newPassword: 'NewPassword#2026',
    });

    await securitySection.getByRole('button', { name: 'Start 2FA Setup' }).click();
    await expect(page.getByText('JBSWY3DPEHPK3PXP')).toBeVisible();
    await securitySection.getByPlaceholder('Enter 6-digit code').fill('123456');
    await securitySection.getByRole('button', { name: 'Verify Code' }).click();
    await expect(page.getByText('Two-factor authentication enabled.')).toBeVisible();
    expect(twoFactorVerifyBody).toEqual({ code: '123456' });

    await securitySection.getByPlaceholder('Code required to disable').fill('654321');
    await securitySection.getByRole('button', { name: 'Disable 2FA' }).click();
    await expect(page.getByText('Two-factor authentication disabled.')).toBeVisible();
    expect(twoFactorDisableBody).toEqual({ code: '654321' });

    const paymentSection = page.locator('section').filter({ hasText: 'Payment Methods' });
    await paymentSection.locator('select').selectOption('gcash');
    await paymentSection.getByLabel('Label').fill('Personal GCash');
    await paymentSection.getByLabel('Brand').fill('GCash');
    await paymentSection.getByLabel('Last 4').fill('7788');
    await paymentSection.getByRole('button', { name: /^Save$/ }).click();
    await expect(page.getByText('Payment method saved.')).toBeVisible();
    await expect(page.getByText('Personal GCash')).toBeVisible();
    expect(savedPaymentMethodBody).toMatchObject({
      methodType: 'gcash',
      label: 'Personal GCash',
      brand: 'GCash',
      last4: '7788',
      isDefault: true,
    });
    await paymentSection.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText('Payment method removed.')).toBeVisible();
    await expect(page.getByText('Personal GCash')).toHaveCount(0);
    expect(deletedPaymentMethodId).toBe('payment-method-2');

    await page.getByRole('button', { name: 'View Replies' }).click();
    await expect(page.getByText('Support is reviewing your booking.')).toBeVisible();
    await page.getByPlaceholder('Add a reply').fill('Thanks, please keep me posted.');
    await page.getByRole('button', { name: /^Send$/ }).click();
    await expect(page.getByText('Thanks, please keep me posted.')).toBeVisible();
    await expect.poll(() => sentSupportReplyBody).toEqual({
      message: 'Thanks, please keep me posted.',
    });

    expect(errors).toEqual([]);
  });

  test('customer booking detail drives payment, messaging, issue, status, and review flows', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    let bookingDetailState = {
      ...customerBookingFixture,
      status: 'confirmed',
    };
    let transitionBody: unknown = null;
    let paymentBody: unknown = null;
    let issueBody: unknown = null;
    let messageBody: unknown = null;
    let reviewBody: unknown = null;

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await fulfillJson(route, {
        access_token: 'customer-session-token',
        refresh_token: 'customer-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'customer-user-1',
          email: 'customer@example.test',
        },
      });
    });

    await page.route('**/auth/v1/user', async (route) => {
      await fulfillJson(route, customerProfileFixture.user);
    });

    await page.route('**/api/me', async (route) => {
      await fulfillJson(route, { data: customerProfileFixture });
    });

    await page.route('**/api/bookings', async (route) => {
      await fulfillJson(route, { data: [bookingDetailState] });
    });

    await page.route(`**/api/bookings/${customerBookingFixture.id}`, async (route) => {
      if (route.request().method() === 'PATCH') {
        transitionBody = route.request().postDataJSON();
        bookingDetailState = {
          ...bookingDetailState,
          status: 'cancelled',
        };
        await fulfillJson(route, { data: bookingDetailState });
        return;
      }

      await fulfillJson(route, { data: bookingDetailState });
    });

    await page.route(`**/api/bookings/${customerBookingFixture.id}/tracking`, async (route) => {
      await fulfillJson(route, {
        data: {
          bookingId: customerBookingFixture.id,
          bookingReference: customerBookingFixture.bookingReference,
          status: bookingDetailState.status,
          phase: 'on_the_way',
          etaMinutes: 12,
          distanceKm: 3.4,
          trafficLevel: 'moderate',
          destinationAddress: customerBookingFixture.serviceAddress,
          destinationLocation: {
            latitude: 14.5547,
            longitude: 121.0244,
          },
          providerLocation: {
            latitude: 14.5601,
            longitude: 121.0302,
          },
          scheduledAt: customerBookingFixture.scheduledAt,
          lastUpdatedAt: '2026-05-20T09:30:00.000Z',
        },
      });
    });

    await page.route(`**/api/bookings/${customerBookingFixture.id}/service-updates`, async (route) => {
      await fulfillJson(route, {
        data: [
          {
            id: 'service-update-1',
            bookingId: customerBookingFixture.id,
            actorId: 'provider-user-1',
            updateType: 'progress',
            message: 'Provider is en route.',
            checklist: null,
            attachmentId: null,
            createdAt: '2026-05-20T09:20:00.000Z',
          },
        ],
      });
    });

    await page.route('**/api/payments/methods', async (route) => {
      await fulfillJson(route, {
        data: [
          {
            id: 'payment-method-1',
            customerId: 'customer-user-1',
            methodType: 'gcash',
            label: 'Personal GCash',
            brand: 'GCash',
            last4: '7788',
            isDefault: true,
            createdAt: '2026-05-20T08:00:00.000Z',
          },
        ],
      });
    });

    await page.route('**/api/payments', async (route) => {
      paymentBody = route.request().postDataJSON();
      await fulfillJson(route, {
        data: {
          id: 'payment-1',
          bookingId: customerBookingFixture.id,
          customerId: 'customer-user-1',
          providerId: 'provider-profile-1',
          amount: 1350,
          platformFee: 150,
          providerPayout: 1200,
          status: 'pending',
          paymentMethod: 'gcash',
          paidAt: null,
          createdAt: '2026-05-20T09:45:00.000Z',
        },
      });
    });

    await page.route(/\/api\/conversations$/, async (route) => {
      await fulfillJson(route, {
        data: {
          id: 'conversation-detail-1',
          bookingId: customerBookingFixture.id,
          customerId: 'customer-user-1',
          providerId: 'provider-profile-1',
          lastMessageAt: '2026-05-20T09:25:00.000Z',
          createdAt: '2026-05-20T09:00:00.000Z',
        },
      });
    });

    await page.route('**/api/conversations/conversation-detail-1/messages', async (route) => {
      if (route.request().method() === 'POST') {
        messageBody = route.request().postDataJSON();
        await fulfillJson(route, {
          data: {
            id: 'message-2',
            conversationId: 'conversation-detail-1',
            senderId: 'customer-user-1',
            senderRole: 'customer',
            content: 'Please call when you arrive.',
            deliveryStatus: 'sent',
            createdAt: '2026-05-20T09:50:00.000Z',
            attachment: null,
          },
        });
        return;
      }

      await fulfillJson(route, {
        data: [
          {
            id: 'message-1',
            conversationId: 'conversation-detail-1',
            senderId: 'provider-user-1',
            senderRole: 'provider',
            content: 'I am on my way.',
            deliveryStatus: 'sent',
            createdAt: '2026-05-20T09:25:00.000Z',
            attachment: null,
          },
        ],
      });
    });

    await page.route('**/api/support-tickets', async (route) => {
      if (route.request().method() === 'POST') {
        issueBody = route.request().postDataJSON();
        await fulfillJson(route, {
          data: {
            id: 'ticket-booking-issue',
            userId: 'customer-user-1',
            subject: `Booking issue: ${customerBookingFixture.bookingReference}`,
            message: 'Provider has not arrived at the expected time.',
            category: 'booking_issue',
            status: 'open',
            createdAt: '2026-05-20T09:55:00.000Z',
            attachments: [],
          },
        });
        return;
      }

      await fulfillJson(route, { data: [] });
    });

    await page.route('**/api/reviews', async (route) => {
      reviewBody = route.request().postDataJSON();
      await fulfillJson(route, {
        data: {
          id: 'review-booking-1',
          bookingId: customerBookingFixture.id,
          providerId: 'provider-profile-1',
          reviewerId: 'customer-user-1',
          rating: 4,
          reviewText: 'Great service and clear updates.',
          isFlagged: false,
          createdAt: '2026-05-20T10:10:00.000Z',
        },
      });
    });

    await page.route('**/api/notifications', async (route) => {
      await fulfillJson(route, { data: [] });
    });

    await page.route('**/api/referrals', async (route) => {
      await fulfillJson(route, {
        data: {
          referralCode: 'SE-CUST-001',
          referralLinkPath: '/register?ref=SE-CUST-001',
          completedReferrals: 0,
          pendingReferrals: 0,
          totalRewards: 0,
        },
      });
    });

    await page.route('**/api/me/preferences', async (route) => {
      await fulfillJson(route, {
        data: {
          userId: 'customer-user-1',
          pushNotificationsEnabled: true,
          darkModeEnabled: false,
          language: 'en',
          notificationPreferences: {},
          updatedAt: '2026-05-20T08:00:00.000Z',
        },
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('customer@example.test');
    await page.getByLabel('Password', { exact: true }).fill('CustomerPass123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/account$/);

    await page.goto(`/bookings/${customerBookingFixture.id}`);
    await expect(page.getByText(customerBookingFixture.bookingReference)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deep Cleaning' })).toBeVisible();
    await expect(page.getByText('Status:')).toBeVisible();
    await expect(page.getByText('On the way')).toBeVisible();
    await expect(page.getByText('12 min')).toBeVisible();
    await expect(page.getByText('Provider is en route.')).toBeVisible();
    await expect(page.getByText('I am on my way.')).toBeVisible();

    const paymentSection = page.locator('section').filter({ hasText: 'Reserve payment' });
    await paymentSection.locator('select').selectOption('gcash');
    await paymentSection.getByLabel('Promo Code').fill('SERVE10');
    await paymentSection.getByRole('button', { name: /^Reserve$/ }).click();
    await expect(page.getByText(/reserved with gcash/i)).toBeVisible();
    expect(paymentBody).toEqual({
      bookingId: customerBookingFixture.id,
      paymentMethod: 'gcash',
      promoCode: 'SERVE10',
    });

    const messagesSection = page.locator('section').filter({ hasText: 'Messages' });
    await messagesSection.getByPlaceholder('Write a message to your provider').fill('Please call when you arrive.');
    await messagesSection.getByRole('button', { name: /^Send$/ }).click();
    await expect(page.getByText('Please call when you arrive.')).toBeVisible();
    expect(messageBody).toEqual({
      content: 'Please call when you arrive.',
    });

    await page.getByPlaceholder('Describe what happened with this booking').fill(
      'Provider has not arrived at the expected time.',
    );
    await page.getByRole('button', { name: 'Submit Issue' }).click();
    await expect(page.getByText('Support ticket ticket-booking-issue was created.')).toBeVisible();
    expect(issueBody).toMatchObject({
      subject: `Booking issue: ${customerBookingFixture.bookingReference}`,
      category: 'booking_issue',
    });
    expect(issueBody).toMatchObject({
      message: expect.stringContaining('Provider has not arrived at the expected time.'),
    });

    await page.getByRole('button', { name: 'Cancel Booking' }).click();
    await expect(page.getByText('Booking moved to Cancelled.')).toBeVisible();
    expect(transitionBody).toEqual({
      currentStatus: 'confirmed',
      nextStatus: 'cancelled',
      reason: 'customer_cancelled',
      explanation: null,
    });

    bookingDetailState = {
      ...bookingDetailState,
      status: 'completed',
    };
    await page
      .locator('section')
      .filter({ hasText: customerBookingFixture.bookingReference })
      .getByRole('button', { name: 'Refresh' })
      .click();
    await expect(page.getByText('Status:')).toBeVisible();

    const reviewSection = page.locator('section').filter({ hasText: 'Leave a Review' });
    await reviewSection.getByRole('button', { name: '4 star rating' }).click();
    await reviewSection.getByPlaceholder('What went well?').fill('Great service and clear updates.');
    await reviewSection.getByRole('button', { name: 'Submit Review' }).click();
    await expect(page.getByText('Your 4-star review has been submitted.')).toBeVisible();
    expect(reviewBody).toEqual({
      bookingId: customerBookingFixture.id,
      rating: 4,
      reviewText: 'Great service and clear updates.',
    });

    expect(errors).toEqual([]);
  });

  test('authenticated provider routes render with gateway-backed data', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    const routes = [
      { path: '/provider', text: 'New Requests' },
      { path: '/provider/dashboard', text: 'New Requests' },
      { path: '/provider/onboarding', text: 'Payout Setup' },
      { path: '/provider/bookings', text: 'Bookings & Requests' },
      { path: `/provider/booking-details/${bookingFixture.id}`, text: bookingFixture.bookingReference },
      { path: `/provider/request-details/${bookingFixture.id}`, text: bookingFixture.bookingReference },
      { path: `/provider/cancel-booking/${bookingFixture.id}`, text: 'Cancel Booking' },
      { path: '/provider/earningsdashboard', text: 'Earnings Dashboard' },
      { path: '/provider/earningsdetails', text: 'Earnings Details' },
      { path: '/provider/reviews', text: 'Reviews' },
      { path: '/provider/performanceinsights', text: 'Performance Insights' },
      { path: '/provider/calendar', text: 'Calendar' },
      { path: '/provider/availability', text: 'Set Availability' },
      { path: '/provider/block-time', text: 'Block Time' },
      { path: '/provider/payout', text: 'Payout' },
      { path: '/provider/request-payout', text: 'Request Payout' },
      { path: '/provider/payout-confirmation', text: 'Payout Request Received' },
      { path: '/provider/profile', text: 'Acme Home Services' },
      { path: '/provider/edit-profile', text: 'Edit Profile' },
      { path: '/provider/edit-services', text: 'Edit Services & Pricing' },
      { path: '/provider/portfolio', text: 'Portfolio Management' },
      { path: '/provider/settings', text: 'Settings' },
      { path: '/provider/help-center', text: 'Help Center' },
      { path: '/provider/messages', text: 'Maria Santos' },
      { path: '/provider/notification-preferences', text: 'Notification Preferences' },
    ];

    await seedProviderSession(page);
    await mockProviderGateway(page);

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByText(route.text).first(), route.path).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Provider Login' }), route.path).toHaveCount(0);
    }

    expect(errors).toEqual([]);
  });

  test('provider calendar adds a personal event through availability days off', async ({ page }) => {
    const errors = watchRuntimeErrors(page);
    const captures: ProviderGatewayCaptures = {
      availabilityDayOffBodies: [],
    };

    await seedProviderSession(page);
    await mockProviderGateway(page, captures);

    await page.goto('/provider/calendar');
    await page.getByRole('button', { name: 'Today' }).click();
    await page.getByRole('button', { name: 'Add personal event' }).click();
    await page.getByPlaceholder('Event Title').fill('Dental appointment');
    await page.locator('input[type="time"]').fill('15:30');
    await page.getByRole('button', { name: 'Add Event' }).click();

    await expect(page.getByText(/Personal event added for \d{4}-\d{2}-\d{2}\./)).toBeVisible();
    await page.getByRole('button', { name: 'Day', exact: true }).click();
    await expect(page.getByText('This day is blocked - No bookings available')).toBeVisible();

    expect(captures.availabilityDayOffBodies).toHaveLength(1);
    expect(captures.availabilityDayOffBodies?.[0]).toMatchObject({
      offDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      reason: 'Personal event: Dental appointment at 15:30',
    });
    expect(errors).toEqual([]);
  });

  test('provider profile tabs show live reviews and availability controls', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await seedProviderSession(page);
    await mockProviderGateway(page);

    await page.goto('/provider/profile');
    await expect(page.getByRole('heading', { name: 'Acme Home Services' })).toBeVisible();
    await expect(page.getByText('Based on 38 reviews')).toBeVisible();

    await page.getByRole('button', { name: 'Services & Pricing', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Deep Cleaning' })).toBeVisible();
    await page.getByRole('button', { name: 'Manage status' }).click();
    await expect(page).toHaveURL(/\/provider\/edit-services$/);

    await page.goto('/provider/profile');
    await page.getByRole('button', { name: 'Reviews', exact: true }).click();
    await expect(page.getByText('Live feedback synced from completed customer bookings.')).toBeVisible();
    await expect(page.getByText('Excellent service.')).toBeVisible();
    await page.getByRole('button', { name: 'Manage reviews' }).click();
    await expect(page).toHaveURL(/\/provider\/reviews$/);

    await page.goto('/provider/profile');
    await page.getByRole('button', { name: 'Availability', exact: true }).click();
    await expect(
      page.getByText('Weekly working hours and blocked dates synced with provider availability.'),
    ).toBeVisible();
    await expect(page.getByText('Mon')).toBeVisible();
    await expect(page.getByText('Available').first()).toBeVisible();
    await page.getByRole('button', { name: 'Edit hours' }).click();
    await expect(page).toHaveURL(/\/provider\/availability$/);

    expect(errors).toEqual([]);
  });

  test('public provider detail route creates an authenticated booking request through gateway proxies', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.request.delete('http://127.0.0.1:5101/__requests');

    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await fulfillJson(route, {
        access_token: 'customer-session-token',
        refresh_token: 'customer-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'customer-user-1',
          email: 'customer@example.test',
        },
      });
    });

    await page.route('**/auth/v1/user', async (route) => {
      await fulfillJson(route, {
        id: 'customer-user-1',
        email: 'customer@example.test',
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('customer@example.test');
    await page.getByLabel('Password', { exact: true }).fill('CustomerPass123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/account$/);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Featured Providers' })).toBeVisible();
    await expect(page.getByText('Public Clean Co').first()).toBeVisible();
    const providerLink = page.getByRole('link', {
      name: /Premium Deep Cleaning[\s\S]*View provider and request booking/i,
    });
    await providerLink.click();
    await expect(page).toHaveURL(/\/providers\/listing-public-cleaning$/);
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Premium Deep Cleaning' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Request this booking' })).toBeVisible();
    await expect(page.getByText('Sparkling kitchen after a deep clean.')).toBeVisible();
    await expect(page.getByText('Thorough, punctual, and easy to coordinate with.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toHaveCount(0);

    await page.getByLabel('Service Address').fill('456 Test Street, Makati City');
    await page.getByLabel('Preferred Schedule').fill('2026-05-24T16:00');
    await page.getByLabel('Estimated Hours').fill('3');
    await page.getByLabel('Payment Method').selectOption('gcash');
    await page.getByLabel('Notes').fill('Please bring eco-friendly cleaning supplies.');
    await page.getByRole('button', { name: 'Request Booking' }).click();

    await expect(
      page.getByText('Booking request PB-1001 was created and is pending.'),
    ).toBeVisible();

    const gatewayRequestsResponse = await page.request.get(
      'http://127.0.0.1:5101/__requests',
    );
    const gatewayRequests = (await gatewayRequestsResponse.json()) as {
      data: Array<{ method: string; path: string; body: Record<string, unknown> }>;
    };
    const quoteRequest = gatewayRequests.data.find(
      (request) => request.path === '/v1/pricing/quotes',
    );
    const bookingRequest = gatewayRequests.data.find(
      (request) => request.path === '/v1/bookings',
    );

    expect(quoteRequest?.body).toMatchObject({
      providerId: 'provider-public-1',
      serviceId: 'service-public-cleaning',
      serviceAddress: '456 Test Street, Makati City',
      hoursRequired: 3,
      bookingUrgency: 'standard',
      region: 'default',
    });
    expect(bookingRequest?.body).toMatchObject({
      providerId: 'provider-public-1',
      serviceId: 'service-public-cleaning',
      serviceTitle: 'Premium Deep Cleaning',
      serviceAddress: '456 Test Street, Makati City',
      hoursRequired: 3,
      serviceAmount: 1350,
      pricingMode: 'flat',
      acceptedQuoteId: 'quote-public-1',
      paymentMethod: 'gcash',
      customerNotes: 'Please bring eco-friendly cleaning supplies.',
    });

    expect(errors).toEqual([]);
  });

  test('supports mobile public navigation after the merge', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();

    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Access your account profile and provider status.')).toBeVisible();

    expect(errors).toEqual([]);
  });
});
