import http from 'node:http';

const port = Number.parseInt(readArg('--port') ?? '5101', 10);
const providerId = 'provider-public-1';
const serviceId = 'service-public-cleaning';
const listingId = 'listing-public-cleaning';

const categories = [
  {
    id: 'category-home',
    name: 'Domestic & Cleaning Services',
    description: 'Trusted help for cleaning and household tasks.',
    icon: null,
  },
];

const services = [
  {
    id: serviceId,
    categoryId: 'category-home',
    name: 'Deep Cleaning',
    description: 'Detailed home cleaning for apartments and houses.',
    price: 1500,
    pricingMode: 'flat',
  },
];

const providers = [
  {
    id: listingId,
    providerId,
    providerBusinessName: 'Public Clean Co',
    serviceId,
    title: 'Premium Deep Cleaning',
    description: 'Kitchen, bathroom, bedroom, and living area deep cleaning.',
    price: 1500,
    pricingMode: 'flat',
    averageRating: 4.9,
    reviewCount: 21,
    verificationStatus: 'approved',
  },
  {
    id: 'listing-public-window-cleaning',
    providerId,
    providerBusinessName: 'Public Clean Co',
    serviceId,
    title: 'Window Cleaning',
    description: 'Interior window and glass panel cleaning.',
    price: 650,
    pricingMode: 'flat',
    averageRating: 4.8,
    reviewCount: 12,
    verificationStatus: 'approved',
  },
];

const requestLog = [];

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, null);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/__requests') {
    sendJson(response, 200, { data: requestLog });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/auth/v1/token') {
    sendJson(response, 400, {
      error: 'invalid_grant',
      error_description: 'Invalid login credentials',
    });
    return;
  }

  if (request.method === 'DELETE' && url.pathname === '/__requests') {
    requestLog.length = 0;
    sendJson(response, 200, { data: [] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog/categories') {
    sendJson(response, 200, { data: categories });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog/services') {
    sendJson(response, 200, { data: services });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog/providers') {
    sendJson(response, 200, { data: providers });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/me') {
    sendJson(response, 200, {
      data: {
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
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/bookings') {
    sendJson(response, 200, { data: [] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/notifications') {
    sendJson(response, 200, { data: [] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/referrals') {
    sendJson(response, 200, {
      data: {
        referralCode: 'SE-PUBLIC-001',
        referralLinkPath: '/register?ref=SE-PUBLIC-001',
        completedReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0,
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/payments/methods') {
    sendJson(response, 200, { data: [] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/me/preferences') {
    sendJson(response, 200, {
      data: {
        userId: 'customer-user-1',
        pushNotificationsEnabled: true,
        darkModeEnabled: false,
        language: 'en',
        notificationPreferences: {},
        updatedAt: '2026-05-20T08:00:00.000Z',
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/me/two-factor') {
    sendJson(response, 200, {
      data: {
        enabled: false,
        verifiedAt: null,
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/me/sessions') {
    sendJson(response, 200, { data: [] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/provider/profile') {
    sendJson(response, 200, {
      data: {
        account: {
          id: 'provider-user-1',
          email: 'provider@example.test',
          fullName: 'Alex Provider',
          contactNumber: '+639171234567',
          role: 'provider',
          status: 'active',
        },
        provider: {
          id: 'provider-profile-1',
          businessName: 'Acme Home Services',
          bio: 'Trusted home service provider.',
          serviceDescription: 'Cleaning and home maintenance.',
          serviceArea: 'Metro Manila',
          yearsExperience: 6,
          verificationStatus: 'approved',
          averageRating: 4.9,
          reviewCount: 38,
        },
        services: [],
        portfolio: [],
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/provider/dashboard') {
    sendJson(response, 200, {
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
          cancellationRate: 2,
          responseTimeMinutes: 10,
        },
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/provider/availability') {
    sendJson(response, 200, {
      data: {
        providerId: 'provider-profile-1',
        windows: [
          {
            id: 'availability-provider-1',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true,
            sortOrder: 1,
          },
        ],
        daysOff: [],
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/payments') {
    sendJson(response, 200, { data: [] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/support/tickets') {
    sendJson(response, 200, { data: [] });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === `/v1/catalog/providers/${providerId}/portfolio`
  ) {
    sendJson(response, 200, {
      data: [
        {
          id: 'portfolio-public-1',
          providerId,
          uploadedBy: 'provider-user-public-1',
          fileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
          fileName: 'deep-cleaning-result.jpg',
          mimeType: 'image/jpeg',
          storagePath: 'portfolio/deep-cleaning-result.jpg',
          fileSize: 1024,
          caption: 'Sparkling kitchen after a deep clean.',
          sortOrder: 1,
          createdAt: '2026-05-20T08:00:00.000Z',
        },
      ],
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === `/v1/provider/availability/${providerId}`
  ) {
    sendJson(response, 200, {
      data: {
        providerId,
        windows: [
          {
            id: 'availability-public-1',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true,
            sortOrder: 1,
          },
          {
            id: 'availability-public-2',
            dayOfWeek: 'saturday',
            startTime: '10:00',
            endTime: '14:00',
            isActive: true,
            sortOrder: 2,
          },
        ],
        daysOff: [
          {
            id: 'day-off-public-1',
            offDate: '2026-06-12',
            reason: 'Independence Day',
          },
        ],
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/reviews') {
    sendJson(response, 200, {
      data: [
        {
          id: 'review-public-1',
          bookingId: 'booking-public-1',
          providerId,
          reviewerId: 'customer-public-1',
          rating: 5,
          reviewText: 'Thorough, punctual, and easy to coordinate with.',
          isFlagged: false,
          createdAt: '2026-05-18T08:00:00.000Z',
        },
      ],
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/pricing/quotes') {
    const body = await readBody(request);
    requestLog.push({
      method: request.method,
      path: url.pathname,
      body,
    });
    sendJson(response, 200, {
      data: {
        quoteId: 'quote-public-1',
        expiresAt: '2026-05-21T12:00:00.000Z',
        currency: 'PHP',
        estimatedTotal: 1350,
        fairRangeMin: 1200,
        fairRangeMax: 1500,
        fairnessStatus: 'within_range',
        confidence: 'high',
        lineItems: [
          {
            code: 'base_service',
            label: 'Base service',
            amount: 1350,
          },
        ],
        explanation: 'Mock fair estimate based on provider rate and requested hours.',
      },
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/bookings') {
    const body = await readBody(request);
    requestLog.push({
      method: request.method,
      path: url.pathname,
      body,
    });
    sendJson(response, 201, {
      data: {
        id: 'booking-public-1',
        bookingReference: 'PB-1001',
        customerId: 'customer-user-1',
        customerFullName: 'Customer Example',
        customerContactNumber: '+639171234567',
        providerId: body?.providerId ?? providerId,
        serviceId: body?.serviceId ?? serviceId,
        serviceTitle: body?.serviceTitle ?? 'Premium Deep Cleaning',
        serviceDescription: body?.serviceDescription ?? null,
        serviceAddress: body?.serviceAddress ?? null,
        scheduledAt: body?.scheduledAt ?? '2026-05-24T08:00:00.000Z',
        hoursRequired: body?.hoursRequired ?? null,
        serviceAmount: body?.serviceAmount ?? null,
        pricingMode: body?.pricingMode ?? 'flat',
        customerNotes: body?.customerNotes ?? null,
        status: 'pending',
        totalAmount: body?.serviceAmount ?? 1350,
        attachments: [],
      },
    });
    return;
  }

  sendJson(response, 404, {
    error: {
      code: 'not_found',
      message: `No mock gateway route for ${request.method} ${url.pathname}`,
    },
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock ServEase gateway listening on http://127.0.0.1:${port}`);
});

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : null;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, apikey, content-type',
    'access-control-allow-methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'content-type': 'application/json',
  });
  response.end(payload === null ? '' : JSON.stringify(payload));
}
