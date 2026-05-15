import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBooking,
  createBookingServiceUpdate,
  createConversationMessage,
  createPayment,
  createSupportTicket,
  getPublicProviderAvailability,
  getProviderAvailability,
  getCurrentUser,
  listCatalogCategories,
  listNotifications,
  listBookingServiceUpdates,
  listBookingTimelineEvents,
  listCustomerBookings,
  markNotificationRead,
  openConversation,
  registerAccount,
  replaceProviderAvailabilityWindows,
  updateCurrentUserProfile,
  uploadMedia,
} from './serveaseApi';

describe('serveaseApi', () => {
  it('loads catalog categories from the gateway', async () => {
    const calls: RequestInit[] = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push(init ?? {});
      assert.equal(url, 'http://gateway.test/v1/catalog/categories');
      return jsonResponse({
        data: [
          {
            id: 'category-1',
            name: 'Cleaning',
            description: null,
            icon: 'sparkles',
          },
        ],
      });
    };

    const categories = await listCatalogCategories({
      baseUrl: 'http://gateway.test',
      fetcher,
    });

    assert.equal(categories[0]?.name, 'Cleaning');
    assert.equal(calls[0]?.method, 'GET');
  });

  it('creates bookings with the bearer token and request body', async () => {
    let requestBody: unknown = null;
    let authorization: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/bookings');
      assert.equal(init?.method, 'POST');
      authorization = new Headers(init?.headers).get('authorization');
      requestBody = JSON.parse(String(init?.body));
      return jsonResponse({
        data: {
          id: 'booking-1',
          bookingReference: 'SE-123',
          customerId: 'customer-1',
          providerId: 'provider-1',
          serviceId: 'service-1',
          serviceTitle: 'Deep Clean',
          serviceAddress: '123 Test St',
          scheduledAt: '2026-05-20T02:00:00.000Z',
          status: 'pending',
          totalAmount: 1200,
        },
      });
    };

    await createBooking(
      {
        providerId: 'provider-1',
        serviceId: 'service-1',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T02:00:00.000Z',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(authorization, 'Bearer access-token');
    assert.deepEqual(requestBody, {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T02:00:00.000Z',
    });
  });

  it('creates and lists booking service updates with authenticated requests', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      if (url.endsWith('/timeline')) {
        return jsonResponse({
          data: [
            {
              id: 'timeline-1',
              bookingId: 'booking-1',
              eventType: 'created',
              label: 'Booking requested',
              icon: 'calendar',
              createdAt: '2026-05-16T00:00:00.000Z',
            },
          ],
        });
      }

      if (init?.method === 'POST') {
        return jsonResponse({
          data: {
            id: 'update-1',
            bookingId: 'booking-1',
            actorId: 'provider-user-1',
            updateType: 'progress',
            message: 'Halfway done.',
            checklist: null,
            attachmentId: null,
            createdAt: '2026-05-16T00:00:00.000Z',
          },
        });
      }

      return jsonResponse({
        data: [
          {
            id: 'update-1',
            bookingId: 'booking-1',
            actorId: 'provider-user-1',
            updateType: 'progress',
            message: 'Halfway done.',
            checklist: null,
            attachmentId: null,
            createdAt: '2026-05-16T00:00:00.000Z',
          },
        ],
      });
    };

    const created = await createBookingServiceUpdate(
      'booking-1',
      {
        updateType: 'progress',
        message: 'Halfway done.',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );
    const updates = await listBookingServiceUpdates('booking-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const timeline = await listBookingTimelineEvents('booking-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/bookings/booking-1/service-updates',
        method: 'POST',
        body: {
          updateType: 'progress',
          message: 'Halfway done.',
        },
      },
      {
        url: 'http://gateway.test/v1/bookings/booking-1/service-updates',
        method: 'GET',
        body: null,
      },
      {
        url: 'http://gateway.test/v1/bookings/booking-1/timeline',
        method: 'GET',
        body: null,
      },
    ]);
    assert.equal(created.message, 'Halfway done.');
    assert.equal(updates[0]?.updateType, 'progress');
    assert.equal(timeline[0]?.eventType, 'created');
  });

  it('returns useful gateway error messages', async () => {
    const fetcher = async () =>
      jsonResponse(
        {
          error: {
            code: 'provider_unavailable',
            message: 'Provider is unavailable for the requested time.',
            details: {},
          },
        },
        409,
      );

    await assert.rejects(
      () =>
        listCustomerBookings({
          baseUrl: 'http://gateway.test',
          token: 'access-token',
          fetcher,
        }),
      /Provider is unavailable for the requested time/,
    );
  });

  it('loads the current gateway profile with the bearer token', async () => {
    let authorization: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/me');
      assert.equal(init?.method, 'GET');
      authorization = new Headers(init?.headers).get('authorization');

      return jsonResponse({
        data: {
          user: {
            id: 'user-1',
            email: 'customer@example.com',
            fullName: 'Customer Example',
            contactNumber: '+639000000000',
            role: 'customer',
            status: 'active',
          },
          customerProfile: {
            id: 'customer-profile-1',
            address: '123 Test St',
          },
          providerProfile: null,
        },
      });
    };

    const profile = await getCurrentUser({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(profile.user.email, 'customer@example.com');
    assert.equal(profile.customerProfile?.address, '123 Test St');
  });

  it('registers a customer account through the gateway', async () => {
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/auth/register');
      assert.equal(init?.method, 'POST');
      requestBody = JSON.parse(String(init?.body));

      return jsonResponse({
        data: {
          user: {
            id: 'user-1',
            email: 'new.customer@example.com',
            fullName: 'New Customer',
            contactNumber: '+639000000001',
            role: 'customer',
            status: 'active',
          },
          customerProfile: {
            id: 'customer-profile-1',
            address: '123 New Street',
          },
          providerProfile: null,
        },
      });
    };

    const profile = await registerAccount(
      {
        role: 'customer',
        email: 'new.customer@example.com',
        password: 'Password#2026',
        fullName: 'New Customer',
        contactNumber: '+639000000001',
        address: '123 New Street',
      },
      {
        baseUrl: 'http://gateway.test',
        fetcher,
      },
    );

    assert.equal(profile.user.role, 'customer');
    assert.deepEqual(requestBody, {
      role: 'customer',
      email: 'new.customer@example.com',
      password: 'Password#2026',
      fullName: 'New Customer',
      contactNumber: '+639000000001',
      address: '123 New Street',
    });
  });

  it('updates the current user profile through the gateway', async () => {
    let authorization: string | null = null;
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/me');
      assert.equal(init?.method, 'PATCH');
      authorization = new Headers(init?.headers).get('authorization');
      requestBody = JSON.parse(String(init?.body));

      return jsonResponse({
        data: {
          user: {
            id: 'user-1',
            email: 'customer@example.com',
            fullName: 'Updated Customer',
            contactNumber: '+639000000001',
            role: 'customer',
            status: 'active',
          },
          customerProfile: {
            id: 'customer-profile-1',
            address: 'Updated address',
          },
          providerProfile: null,
        },
      });
    };

    const profile = await updateCurrentUserProfile(
      {
        fullName: 'Updated Customer',
        contactNumber: '+639000000001',
        address: 'Updated address',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(profile.user.fullName, 'Updated Customer');
    assert.deepEqual(requestBody, {
      fullName: 'Updated Customer',
      contactNumber: '+639000000001',
      address: 'Updated address',
    });
  });

  it('opens a conversation and sends a message through the gateway', async () => {
    const calls: Array<{ url: string; body: unknown; authorization: string | null }> =
      [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        body: init?.body ? JSON.parse(String(init.body)) : null,
        authorization: new Headers(init?.headers).get('authorization'),
      });

      if (url.endsWith('/v1/conversations')) {
        return jsonResponse({
          data: {
            id: 'conversation-1',
            bookingId: 'booking-1',
            customerId: 'customer-1',
            providerId: 'provider-1',
            lastMessageAt: null,
            createdAt: '2026-05-20T02:00:00.000Z',
          },
        });
      }

      return jsonResponse({
        data: {
          id: 'message-1',
          conversationId: 'conversation-1',
          senderId: 'customer-1',
          senderRole: 'customer',
          content: 'Hello provider',
          deliveryStatus: 'sent',
          createdAt: '2026-05-20T02:01:00.000Z',
        },
      });
    };

    const conversation = await openConversation('booking-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const message = await createConversationMessage(
      conversation.id,
      'Hello provider',
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(calls[0]?.url, 'http://gateway.test/v1/conversations');
    assert.deepEqual(calls[0]?.body, { bookingId: 'booking-1' });
    assert.equal(
      calls[1]?.url,
      'http://gateway.test/v1/conversations/conversation-1/messages',
    );
    assert.deepEqual(calls[1]?.body, { content: 'Hello provider' });
    assert.equal(calls[1]?.authorization, 'Bearer access-token');
    assert.equal(message.content, 'Hello provider');
  });

  it('creates payments and support tickets with authenticated bodies', async () => {
    const bodies: unknown[] = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)));

      if (url.endsWith('/v1/payments')) {
        return jsonResponse({
          data: {
            id: 'payment-1',
            bookingId: 'booking-1',
            customerId: 'customer-1',
            providerId: 'provider-1',
            amount: 1200,
            platformFee: 180,
            providerPayout: 1020,
            status: 'pending',
            paymentMethod: 'cash_on_service',
            paidAt: null,
            createdAt: '2026-05-20T02:00:00.000Z',
          },
        });
      }

      return jsonResponse({
        data: {
          id: 'ticket-1',
          userId: 'customer-1',
          subject: 'Need help',
          message: 'Please check my booking.',
          category: 'booking',
          status: 'open',
          createdAt: '2026-05-20T02:00:00.000Z',
        },
      });
    };

    const payment = await createPayment(
      { bookingId: 'booking-1', paymentMethod: 'cash_on_service' },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );
    const ticket = await createSupportTicket(
      {
        subject: 'Need help',
        message: 'Please check my booking.',
        category: 'booking',
      },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );

    assert.deepEqual(bodies[0], {
      bookingId: 'booking-1',
      paymentMethod: 'cash_on_service',
    });
    assert.deepEqual(bodies[1], {
      subject: 'Need help',
      message: 'Please check my booking.',
      category: 'booking',
    });
    assert.equal(payment.status, 'pending');
    assert.equal(ticket.status, 'open');
  });

  it('uploads media through the authenticated gateway endpoint', async () => {
    let authorization: string | null = null;
    let bodyWasFormData = false;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/uploads');
      assert.equal(init?.method, 'POST');
      authorization = new Headers(init?.headers).get('authorization');
      bodyWasFormData = init?.body instanceof FormData;
      assert.equal(new Headers(init?.headers).get('content-type'), null);

      return jsonResponse({
        data: {
          bucket: 'servease-uploads',
          path: 'booking_reference/user-1/file.jpg',
          publicUrl: 'https://storage.test/file.jpg',
          kind: 'booking_reference',
          contentType: 'image/jpeg',
          size: 12,
        },
      });
    };

    const upload = await uploadMedia(
      {
        kind: 'booking_reference',
        uri: 'file:///photo.jpg',
        name: 'photo.jpg',
        contentType: 'image/jpeg',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(bodyWasFormData, true);
    assert.equal(upload.publicUrl, 'https://storage.test/file.jpg');
  });

  it('lists notifications and marks one read with PATCH', async () => {
    const methods: string[] = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      methods.push(String(init?.method));

      if (url.endsWith('/read')) {
        return jsonResponse({
          data: {
            id: 'notification-1',
            userId: 'customer-1',
            type: 'booking',
            title: 'Booking update',
            body: 'Your booking changed.',
            isRead: true,
            metadata: null,
            createdAt: '2026-05-20T02:00:00.000Z',
          },
        });
      }

      return jsonResponse({
        data: [
          {
            id: 'notification-1',
            userId: 'customer-1',
            type: 'booking',
            title: 'Booking update',
            body: 'Your booking changed.',
            isRead: false,
            metadata: null,
            createdAt: '2026-05-20T02:00:00.000Z',
          },
        ],
      });
    };

    const notifications = await listNotifications({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const read = await markNotificationRead('notification-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(notifications[0]?.isRead, false);
    assert.equal(read.isRead, true);
    assert.deepEqual(methods, ['GET', 'PATCH']);
  });

  it('loads public/provider availability and replaces provider-owned windows through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const schedule = {
      providerId: 'provider-1',
      windows: [
        {
          id: 'window-1',
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
          sortOrder: 1,
        },
      ],
      daysOff: [],
    };
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return jsonResponse({ data: schedule });
    };

    await getProviderAvailability({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    await getPublicProviderAvailability('provider-1', {
      baseUrl: 'http://gateway.test',
      fetcher,
    });
    await replaceProviderAvailabilityWindows(
      [
        {
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00',
          isActive: true,
        },
      ],
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/provider/availability',
        method: 'GET',
        body: null,
      },
      {
        url: 'http://gateway.test/v1/provider/availability/provider-1',
        method: 'GET',
        body: null,
      },
      {
        url: 'http://gateway.test/v1/provider/availability/windows',
        method: 'PUT',
        body: {
          windows: [
            {
              dayOfWeek: 'monday',
              startTime: '09:00',
              endTime: '17:00',
              isActive: true,
            },
          ],
        },
      },
    ]);
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
