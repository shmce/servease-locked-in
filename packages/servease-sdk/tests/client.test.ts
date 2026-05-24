import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ServEaseApiError,
  createServEaseClient,
  type FetchLike,
} from '../src/index.ts';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('createServEaseClient', () => {
  it('builds gateway URLs with query params and auth headers', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({ data: [{ id: 'provider-1', businessName: 'QuickFix' }] });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test/',
      accessToken: 'tribe-token',
      fetch: fetcher,
    });

    const providers = await client.catalog.listProviders({
      serviceId: 'service-1',
      city: 'Manila',
    });

    assert.equal(providers[0]?.id, 'provider-1');
    assert.equal(
      requests[0]?.url,
      'https://api.servease.test/v1/catalog/providers?serviceId=service-1&city=Manila',
    );
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer tribe-token');
  });

  it('attaches idempotency keys for side-effect requests', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({
        data: {
          bookingId: 'booking-1',
          status: 'pending',
          serviceId: 'service-1',
          providerId: 'provider-1',
          scheduledAt: '2026-05-20T09:00:00.000Z',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      fetch: fetcher,
    });

    await client.bookings.create(
      {
        serviceId: 'service-1',
        providerId: 'provider-1',
        scheduledAt: '2026-05-20T09:00:00.000Z',
        serviceAddress: {
          line1: '123 Street',
          city: 'Manila',
          latitude: 14.5995,
          longitude: 120.9842,
        },
        hoursRequired: 2,
      },
      { accessToken: 'customer-token', idempotencyKey: 'booking-key-1' },
    );

    assert.equal(requests[0]?.method, 'POST');
    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/bookings');
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer customer-token');
    assert.equal(requests[0]?.headers.get('idempotency-key'), 'booking-key-1');
    assert.equal(requests[0]?.headers.get('content-type'), 'application/json');
  });

  it('throws ServEaseApiError for gateway error envelopes', async () => {
    const fetcher: FetchLike = async () =>
      jsonResponse(
        {
          error: {
            code: 'provider_unavailable',
            message: 'Provider is unavailable.',
            details: { providerId: 'provider-1' },
          },
        },
        { status: 409 },
      );

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      fetch: fetcher,
    });

    await assert.rejects(
      () => client.bookings.get('booking-1'),
      (error) => {
        assert.ok(error instanceof ServEaseApiError);
        assert.equal(error.status, 409);
        assert.equal(error.code, 'provider_unavailable');
        assert.equal(error.message, 'Provider is unavailable.');
        assert.deepEqual(error.details, { providerId: 'provider-1' });
        return true;
      },
    );
  });

  it('creates customer pricing quotes through the public pricing route', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({
        data: {
          quoteId: 'quote-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          serviceId: 'service-1',
          categoryId: 'category-1',
          expiresAt: '2026-05-20T09:15:00.000Z',
          currency: 'PHP',
          estimatedTotal: 1450,
          fairRangeMin: 1200,
          fairRangeMax: 1550,
          fairnessStatus: 'within_range',
          confidence: 'high',
          lineItems: [{ code: 'labor', label: 'Labor', amount: 1200 }],
          signals: {
            distanceKm: null,
            durationMinutes: null,
            fuelPricePerLiter: 65,
            fuelIndexUpdatedAt: null,
            staleFuelIndex: false,
            fallbackUsed: false,
          },
          explanation: 'Within typical range.',
          createdAt: '2026-05-20T09:00:00.000Z',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      fetch: fetcher,
    });

    const quote = await client.pricing.createQuote(
      {
        providerId: 'provider-1',
        serviceId: 'service-1',
        serviceAddress: '123 Street, Manila',
        scheduledAt: '2026-05-20T09:00:00.000Z',
        hoursRequired: 2,
      },
      { accessToken: 'customer-token' },
    );

    assert.equal(quote.quoteId, 'quote-1');
    assert.equal(requests[0]?.method, 'POST');
    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/pricing/quotes');
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer customer-token');
  });

  it('requests provider pricing guidance without exposing pricing internals', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({
        data: {
          quoteId: 'guidance-1',
          estimatedTotal: 500,
          fairRangeMin: 450,
          fairRangeMax: 650,
          fairnessStatus: 'within_range',
          confidence: 'medium',
          explanation: 'Within range.',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      accessToken: 'provider-token',
      fetch: fetcher,
    });

    const guidance = await client.pricing.getProviderGuidance({
      serviceId: 'service-1',
      proposedPrice: 500,
      pricingMode: 'flat',
    });

    assert.equal(guidance.quoteId, 'guidance-1');
    assert.equal(
      requests[0]?.url,
      'https://api.servease.test/v1/provider/pricing/guidance',
    );
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer provider-token');
  });

  it('loads the signed-in provider application status', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({
        data: {
          id: 'application-1',
          applicationReference: 'APP-001',
          businessName: 'QuickFix',
          serviceArea: 'Manila',
          serviceDescription: 'Home repair',
          verificationStatus: 'pending',
          latestDecisionReason: null,
          latestDecisionAt: null,
          createdAt: '2026-05-20T09:00:00.000Z',
          updatedAt: '2026-05-20T09:00:00.000Z',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      fetch: fetcher,
    });

    const status = await client.providerApplications.getMine({
      accessToken: 'provider-token',
    });

    assert.equal(status.applicationReference, 'APP-001');
    assert.equal(
      requests[0]?.url,
      'https://api.servease.test/v1/auth/provider-application/me',
    );
    assert.equal(requests[0]?.headers.get('authorization'), 'Bearer provider-token');
  });

  it('exposes provider partial time-off availability helpers', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return jsonResponse({
        data: {
          providerId: 'provider-1',
          windows: [],
          daysOff: [],
          timeOffWindows: [
            {
              id: 'time-off-1',
              offDate: '2026-05-26',
              startTime: '14:00',
              endTime: '17:00',
              reason: 'Personal errand',
            },
          ],
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      accessToken: 'provider-token',
      fetch: fetcher,
    });

    assert.equal(typeof (client.availability as any).addTimeOff, 'function');
    assert.equal(typeof (client.availability as any).removeTimeOff, 'function');

    const schedule = await (client.availability as any).addTimeOff({
      offDate: '2026-05-26',
      startTime: '14:00',
      endTime: '17:00',
      reason: 'Personal errand',
    });
    await (client.availability as any).removeTimeOff('time-off-1');

    assert.equal(schedule.timeOffWindows[0]?.startTime, '14:00');
    assert.equal(requests[0]?.method, 'POST');
    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/provider/availability/time-off');
    assert.deepEqual(await requests[0]?.json(), {
      offDate: '2026-05-26',
      startTime: '14:00',
      endTime: '17:00',
      reason: 'Personal errand',
    });
    assert.equal(requests[1]?.method, 'DELETE');
    assert.equal(
      requests[1]?.url,
      'https://api.servease.test/v1/provider/availability/time-off/time-off-1',
    );
  });

  it('exposes payment helpers through public payment routes', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith('/v1/payments/promotions/validate')) {
        return jsonResponse({
          data: {
            code: 'SAVE10',
            valid: true,
            discountAmount: 100,
            finalAmount: 900,
            message: 'Promotion applied.',
          },
        });
      }
      return jsonResponse({
        data: {
          checkoutId: 'checkout-1',
          provider: 'mock',
          status: 'created',
          referenceId: 'booking-1',
          redirectUrl: 'https://checkout.test',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      accessToken: 'customer-token',
      fetch: fetcher,
    });

    const promotion = await client.payments.validatePromotion({
      bookingId: 'booking-1',
      code: 'SAVE10',
    });
    const checkout = await client.payments.createCheckoutSession(
      {
        bookingId: 'booking-1',
        successUrl: 'https://app.test/success',
        cancelUrl: 'https://app.test/cancel',
      },
      { idempotencyKey: 'checkout-key-1' },
    );

    assert.equal(promotion.valid, true);
    assert.equal(checkout.checkoutId, 'checkout-1');
    assert.equal(
      requests[0]?.url,
      'https://api.servease.test/v1/payments/promotions/validate',
    );
    assert.equal(
      requests[1]?.url,
      'https://api.servease.test/v1/payments/checkout-sessions',
    );
    assert.equal(requests[1]?.headers.get('idempotency-key'), 'checkout-key-1');
  });

  it('exposes messaging helpers through public conversation routes', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith('/messages')) {
        return jsonResponse({
          data: {
            id: 'message-1',
            conversationId: 'conversation-1',
            senderId: 'user-1',
            senderRole: 'customer',
            content: 'Hello',
            deliveryStatus: null,
            createdAt: '2026-05-20T09:00:00.000Z',
            attachment: null,
          },
        });
      }
      return jsonResponse({
        data: {
          id: 'conversation-1',
          bookingId: 'booking-1',
          customerId: 'customer-1',
          providerId: 'provider-1',
          lastMessageAt: null,
          createdAt: '2026-05-20T09:00:00.000Z',
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      accessToken: 'user-token',
      fetch: fetcher,
    });

    await client.messaging.open({ bookingId: 'booking-1' });
    await client.messaging.sendMessage('conversation-1', { content: 'Hello' });

    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/conversations');
    assert.equal(
      requests[1]?.url,
      'https://api.servease.test/v1/conversations/conversation-1/messages',
    );
  });

  it('exposes reviews, support, notifications, and profile helpers', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith('/v1/me')) {
        return jsonResponse({
          data: {
            user: {
              id: 'user-1',
              email: 'user@test.local',
              fullName: 'Test User',
              contactNumber: null,
              role: 'customer',
              status: 'active',
            },
            customerProfile: null,
            customerAddresses: [],
            providerProfile: null,
          },
        });
      }
      if (request.url.endsWith('/v1/me/addresses')) {
        return jsonResponse({
          data: [
            {
              id: 'address-1',
              userId: 'user-1',
              label: 'Home',
              address: '123 Test St',
              barangay: null,
              city: null,
              province: null,
              region: null,
              latitude: null,
              longitude: null,
              isDefault: true,
              createdAt: null,
              updatedAt: null,
            },
          ],
        });
      }
      if (request.url.endsWith('/v1/me/addresses/address-1/default')) {
        return jsonResponse({
          data: {
            id: 'address-1',
            userId: 'user-1',
            label: 'Home',
            address: '123 Test St',
            barangay: null,
            city: null,
            province: null,
            region: null,
            latitude: null,
            longitude: null,
            isDefault: true,
            createdAt: null,
            updatedAt: null,
          },
        });
      }
      if (request.url.includes('/v1/support/tickets')) {
        return jsonResponse({
          data: {
            id: 'ticket-1',
            userId: 'user-1',
            subject: 'Help',
            message: 'Need help',
            category: 'booking',
            status: 'open',
            createdAt: null,
            attachments: [],
          },
        });
      }
      if (request.url.includes('/v1/notifications')) {
        return jsonResponse({
          data: {
            id: 'notification-1',
            userId: 'user-1',
            type: 'booking_created',
            title: 'Booking created',
            body: null,
            isRead: true,
            metadata: null,
            createdAt: null,
          },
        });
      }
      return jsonResponse({
        data: {
          id: 'review-1',
          bookingId: 'booking-1',
          providerId: 'provider-1',
          reviewerId: 'user-1',
          reviewerFullName: 'Test User',
          rating: 5,
          reviewText: 'Great',
          isFlagged: false,
          createdAt: null,
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      accessToken: 'user-token',
      fetch: fetcher,
    });

    await client.profile.getCurrent();
    await client.profile.listAddresses();
    await client.profile.setDefaultAddress('address-1');
    await client.reviews.create({ bookingId: 'booking-1', rating: 5, reviewText: 'Great' });
    await client.support.createTicket({ subject: 'Help', message: 'Need help' });
    await client.notifications.markRead('notification-1');

    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/me');
    assert.equal(requests[1]?.url, 'https://api.servease.test/v1/me/addresses');
    assert.equal(
      requests[2]?.url,
      'https://api.servease.test/v1/me/addresses/address-1/default',
    );
    assert.equal(requests[3]?.url, 'https://api.servease.test/v1/reviews');
    assert.equal(requests[4]?.url, 'https://api.servease.test/v1/support/tickets');
    assert.equal(
      requests[5]?.url,
      'https://api.servease.test/v1/notifications/notification-1/read',
    );
  });

  it('exposes ServEase-owned geo, referral, and upload helpers', async () => {
    const requests: Request[] = [];
    const fetcher: FetchLike = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.url.endsWith('/v1/referrals')) {
        return jsonResponse({
          data: {
            referralCode: 'ABC123',
            referralLinkPath: '/ref/ABC123',
            completedReferrals: 1,
            pendingReferrals: 2,
            totalRewards: 100,
          },
        });
      }
      if (request.url.endsWith('/v1/uploads')) {
        return jsonResponse({
          data: {
            bucket: 'uploads',
            path: 'message/file.txt',
            publicUrl: 'https://cdn.test/file.txt',
            kind: 'message_attachment',
            contentType: 'text/plain',
            size: 5,
          },
        });
      }
      return jsonResponse({
        data: {
          provider: 'openrouteservice',
          distanceMeters: 1000,
          durationSeconds: 600,
          geometry: [],
          steps: [],
        },
      });
    };

    const client = createServEaseClient({
      baseUrl: 'https://api.servease.test',
      accessToken: 'user-token',
      fetch: fetcher,
    });

    await client.geo.directions({
      origin: { latitude: 14.5995, longitude: 120.9842 },
      destination: { latitude: 14.55, longitude: 121.02 },
    });
    await client.referrals.getSummary();
    await client.uploads.create({
      kind: 'message_attachment',
      file: new Blob(['hello'], { type: 'text/plain' }),
      fileName: 'hello.txt',
    });

    assert.equal(requests[0]?.url, 'https://api.servease.test/v1/geo/directions');
    assert.equal(requests[1]?.url, 'https://api.servease.test/v1/referrals');
    assert.equal(requests[2]?.url, 'https://api.servease.test/v1/uploads');
    assert.match(
      requests[2]?.headers.get('content-type') ?? '',
      /^multipart\/form-data; boundary=/,
    );
  });
});
