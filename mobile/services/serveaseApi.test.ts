import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addProviderPortfolioMedia,
  addProviderTimeOffWindow,
  checkGeoFence,
  createCustomerAddress,
  createBooking,
  createBookingServiceUpdate,
  createCheckoutSession,
  createConversationMessage,
  createPayment,
  createPricingQuote,
  createSupportTicket,
  deleteCustomerPaymentMethod,
  deleteCustomerAddress,
  deleteBookingAttachment,
  deleteCurrentUserAccount,
  deleteProviderPortfolioMedia,
  disableCurrentUserTwoFactor,
  enableCurrentUserTwoFactor,
  exchangeGoogleCode,
  generateOtp,
  geocodeAddress,
  getCheckoutStatus,
  getDirections,
  getGoogleAuthorizationUrl,
  getMyProviderApplicationDocuments,
  getPublicProviderAvailability,
  getProviderAvailability,
  getBookingTrackingSnapshot,
  getCurrentUser,
  getProviderPayoutAccount,
  getReferralSummary,
  getUserPreferences,
  listCatalogCategories,
  listNotifications,
  listBookingServiceUpdates,
  listBookingTimelineEvents,
  listCustomerPaymentMethods,
  listCustomerAddresses,
  listCustomerBookings,
  listProviderPayoutMethods,
  listProviderPayouts,
  markNotificationRead,
  openConversation,
  registerPushDevice,
  registerAccount,
  raiseBookingDispute,
  reorderProviderPortfolio,
  removeProviderTimeOffWindow,
  replaceProviderAvailabilityWindows,
  requestPasswordReset,
  requestProviderPayout,
  reverseGeocode,
  subscribeBookingTrackingSnapshots,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
  setDefaultCustomerAddress,
  updateBookingLiveLocation,
  updateProviderPortfolioMedia,
  upsertCustomerPaymentMethod,
  updateUserPreferences,
  unregisterPushDevice,
  verifyOtp,
  verifyCurrentUserTwoFactor,
  uploadMedia,
  validatePromotion,
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
          serviceLatitude: 14.554729,
          serviceLongitude: 121.024445,
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
        serviceLatitude: 14.554729,
        serviceLongitude: 121.024445,
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
      serviceLatitude: 14.554729,
      serviceLongitude: 121.024445,
      scheduledAt: '2026-05-20T02:00:00.000Z',
    });
  });

  it('creates pricing quotes through the gateway', async () => {
    let requestBody: unknown = null;
    let authorization: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/pricing/quotes');
      assert.equal(init?.method, 'POST');
      authorization = new Headers(init?.headers).get('authorization');
      requestBody = JSON.parse(String(init?.body));
      return jsonResponse({
        data: {
          quoteId: 'quote-1',
          expiresAt: '2026-06-01T08:45:00.000Z',
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
            fuelPricePerLiter: 68,
            fuelIndexUpdatedAt: null,
            staleFuelIndex: false,
            fallbackUsed: true,
          },
          explanation: 'Within typical rates.',
        },
      });
    };

    const quote = await createPricingQuote(
      {
        providerId: 'provider-1',
        serviceId: 'service-1',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-06-01T09:00:00.000Z',
      },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(quote.estimatedTotal, 1450);
    assert.deepEqual(requestBody, {
      providerId: 'provider-1',
      serviceId: 'service-1',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-06-01T09:00:00.000Z',
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

  it('loads booking tracking snapshots with authentication', async () => {
    let authorization: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/bookings/booking-1/tracking');
      assert.equal(init?.method, 'GET');
      authorization = new Headers(init?.headers).get('authorization');
      return jsonResponse({
        data: {
          bookingId: 'booking-1',
          bookingReference: 'SE-123',
          status: 'in_progress',
          phase: 'on_the_way',
          etaMinutes: 18,
          distanceKm: 5.2,
          trafficLevel: 'moderate',
          destinationAddress: '123 Test St',
          destinationLocation: null,
          providerLocation: null,
          scheduledAt: '2026-05-20T02:00:00.000Z',
          lastUpdatedAt: '2026-05-16T00:00:00.000Z',
        },
      });
    };

    const tracking = await getBookingTrackingSnapshot('booking-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(tracking.phase, 'on_the_way');
    assert.equal(tracking.etaMinutes, 18);
  });

  it('subscribes to booking tracking stream with bearer authentication', () => {
    class FakeTrackingXhr {
      responseText = '';
      status = 200;
      headers = new Map<string, string>();
      method: string | null = null;
      url: string | null = null;
      async: boolean | null = null;
      aborted = false;
      onprogress: (() => void) | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      open(method: string, url: string, async: boolean) {
        this.method = method;
        this.url = url;
        this.async = async;
      }

      setRequestHeader(name: string, value: string) {
        this.headers.set(name.toLowerCase(), value);
      }

      send() {
        // The test drives progress manually.
      }

      abort() {
        this.aborted = true;
      }

      push(chunk: string) {
        this.responseText += chunk;
        this.onprogress?.();
      }
    }

    const xhr = new FakeTrackingXhr();
    const snapshots: unknown[] = [];
    const subscription = subscribeBookingTrackingSnapshots(
      'booking-1',
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        xhrFactory: () => xhr as unknown as XMLHttpRequest,
      },
      {
        onSnapshot: (snapshot) => snapshots.push(snapshot),
      },
    );

    assert.equal(xhr.method, 'GET');
    assert.equal(
      xhr.url,
      'http://gateway.test/v1/bookings/booking-1/tracking/stream',
    );
    assert.equal(xhr.headers.get('accept'), 'text/event-stream');
    assert.equal(xhr.headers.get('authorization'), 'Bearer access-token');

    xhr.push(
      `event: tracking\ndata: ${JSON.stringify({
        bookingId: 'booking-1',
        bookingReference: 'SE-123',
        status: 'in_progress',
        phase: 'on_the_way',
        etaMinutes: 18,
        distanceKm: 5.2,
        trafficLevel: 'moderate',
        destinationAddress: '123 Test St',
        destinationLocation: null,
        providerLocation: {
          latitude: 14.5995,
          longitude: 120.9842,
          updatedAt: '2026-05-16T00:00:05.000Z',
        },
        scheduledAt: '2026-05-20T02:00:00.000Z',
        lastUpdatedAt: '2026-05-16T00:00:05.000Z',
      })}\n\n`,
    );

    assert.equal(snapshots.length, 1);
    assert.deepEqual(snapshots[0], {
      bookingId: 'booking-1',
      bookingReference: 'SE-123',
      status: 'in_progress',
      phase: 'on_the_way',
      etaMinutes: 18,
      distanceKm: 5.2,
      trafficLevel: 'moderate',
      destinationAddress: '123 Test St',
      destinationLocation: null,
      providerLocation: {
        latitude: 14.5995,
        longitude: 120.9842,
        updatedAt: '2026-05-16T00:00:05.000Z',
      },
      scheduledAt: '2026-05-20T02:00:00.000Z',
      lastUpdatedAt: '2026-05-16T00:00:05.000Z',
    });

    subscription.close();
    assert.equal(xhr.aborted, true);
  });

  it('publishes booking live location with authentication', async () => {
    let authorization: string | null = null;
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(
        url,
        'http://gateway.test/v1/bookings/booking-1/tracking/location',
      );
      assert.equal(init?.method, 'PATCH');
      authorization = new Headers(init?.headers).get('authorization');
      requestBody = JSON.parse(String(init?.body));
      return jsonResponse({
        data: {
          latitude: 14.5995,
          longitude: 120.9842,
          accuracyMeters: 8,
          headingDegrees: 90,
          speedMps: 4,
          updatedAt: '2026-05-16T00:00:05.000Z',
        },
      });
    };

    const location = await updateBookingLiveLocation(
      'booking-1',
      {
        latitude: 14.5995,
        longitude: 120.9842,
        accuracyMeters: 8,
        headingDegrees: 90,
        speedMps: 4,
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(authorization, 'Bearer access-token');
    assert.deepEqual(requestBody, {
      latitude: 14.5995,
      longitude: 120.9842,
      accuracyMeters: 8,
      headingDegrees: 90,
      speedMps: 4,
    });
    assert.equal(location.updatedAt, '2026-05-16T00:00:05.000Z');
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
          customerAddresses: [
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
    assert.equal(profile.customerAddresses[0]?.label, 'Home');
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
          customerAddresses: [],
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

  it('registers a provider account with a selected catalog service', async () => {
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/auth/register');
      assert.equal(init?.method, 'POST');
      requestBody = JSON.parse(String(init?.body));

      return jsonResponse({
        data: {
          user: {
            id: 'user-1',
            email: 'provider@example.com',
            fullName: 'Provider Example',
            contactNumber: '+639000000001',
            role: 'provider',
            status: 'active',
          },
          customerProfile: null,
          customerAddresses: [],
          providerProfile: {
            id: 'provider-profile-1',
            businessName: 'Provider Co',
            verificationStatus: 'pending',
            averageRating: 0,
            reviewCount: 0,
          },
        },
      });
    };

    const profile = await registerAccount(
      {
        role: 'provider',
        email: 'provider@example.com',
        password: 'Password#2026',
        fullName: 'Provider Example',
        contactNumber: '+639000000001',
        birthdate: '1990-05-23',
        businessName: 'Provider Co',
        serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
        serviceDescription: 'Deep Cleaning',
        serviceArea: 'Quezon City',
      },
      {
        baseUrl: 'http://gateway.test',
        fetcher,
      },
    );

    assert.equal(profile.user.role, 'provider');
    assert.deepEqual(requestBody, {
      role: 'provider',
      email: 'provider@example.com',
      password: 'Password#2026',
      fullName: 'Provider Example',
      contactNumber: '+639000000001',
      birthdate: '1990-05-23',
      businessName: 'Provider Co',
      serviceId: '14e09a89-b7ad-483b-bfb6-6c49d8923197',
      serviceDescription: 'Deep Cleaning',
      serviceArea: 'Quezon City',
    });
  });

  it('requests password reset through the gateway', async () => {
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/auth/password-reset');
      assert.equal(init?.method, 'POST');
      requestBody = JSON.parse(String(init?.body));

      return jsonResponse({
        data: { ok: true },
      });
    };

    const result = await requestPasswordReset(
      {
        email: 'customer@example.com',
        redirectTo: 'servease://reset-password',
      },
      {
        baseUrl: 'http://gateway.test',
        fetcher,
      },
    );

    assert.equal(result.ok, true);
    assert.deepEqual(requestBody, {
      email: 'customer@example.com',
      redirectTo: 'servease://reset-password',
    });
  });

  it('requests APICenter OTP and Google auth through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      if (url.endsWith('/v1/auth/otp/generate')) {
        return jsonResponse({
          data: {
            otpId: 'otp-1',
            expiresAt: '2026-05-18T00:00:00.000Z',
            channel: 'email',
            target: 'customer@example.com',
          },
        });
      }

      if (url.endsWith('/v1/auth/otp/verify')) {
        return jsonResponse({
          data: {
            valid: true,
            channel: 'email',
            target: 'customer@example.com',
          },
        });
      }

      if (url.endsWith('/v1/auth/google/token')) {
        return jsonResponse({
          data: {
            accessToken: 'google-access-token',
            expiresIn: 3600,
            tokenType: 'Bearer',
            refreshToken: 'google-refresh-token',
          },
        });
      }

      return jsonResponse({
        data: {
          authorizationUrl: 'https://accounts.google.test/auth',
          state: 'state-1',
        },
      });
    };

    await generateOtp(
      { target: 'customer@example.com', channel: 'email' },
      { baseUrl: 'http://gateway.test', fetcher },
    );
    await verifyOtp('otp-1', '123456', {
      baseUrl: 'http://gateway.test',
      fetcher,
    });
    await getGoogleAuthorizationUrl(
      {
        redirectUri: 'servease://auth/google/callback',
        scopes: ['openid', 'email', 'profile'],
      },
      { baseUrl: 'http://gateway.test', fetcher },
    );
    await exchangeGoogleCode(
      {
        code: 'code-1',
        redirectUri: 'servease://auth/google/callback',
      },
      { baseUrl: 'http://gateway.test', fetcher },
    );

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/auth/otp/generate',
        method: 'POST',
        body: { target: 'customer@example.com', channel: 'email' },
      },
      {
        url: 'http://gateway.test/v1/auth/otp/verify',
        method: 'POST',
        body: { otpId: 'otp-1', code: '123456' },
      },
      {
        url: 'http://gateway.test/v1/auth/google/authorize',
        method: 'POST',
        body: {
          redirectUri: 'servease://auth/google/callback',
          scopes: ['openid', 'email', 'profile'],
        },
      },
      {
        url: 'http://gateway.test/v1/auth/google/token',
        method: 'POST',
        body: {
          code: 'code-1',
          redirectUri: 'servease://auth/google/callback',
        },
      },
    ]);
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
          customerAddresses: [],
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

  it('loads current provider application documents through the gateway', async () => {
    let authorization: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(
        url,
        'http://gateway.test/v1/auth/provider-application/me/documents',
      );
      assert.equal(init?.method, 'GET');
      authorization = new Headers(init?.headers).get('authorization');

      return jsonResponse({
        data: {
          application: {
            id: 'provider-application-1',
            applicationReference: 'PA-20260523-001',
            businessName: 'Provider Co',
            serviceArea: 'Quezon City',
            serviceDescription: null,
            verificationStatus: 'pending',
            latestDecisionReason: null,
            latestDecisionAt: null,
            createdAt: '2026-05-23T00:00:00.000Z',
            updatedAt: '2026-05-23T00:00:00.000Z',
          },
          documents: [
            {
              id: 'document-1',
              applicationId: 'provider-application-1',
              userId: 'user-1',
              documentType: 'government_id',
              fileUrl: null,
              storagePath: 'provider_document/user-1/id.jpg',
              status: 'pending',
              createdAt: '2026-05-23T00:01:00.000Z',
              previewUrl: 'https://storage.test/id-preview',
              downloadUrl: 'https://storage.test/id-download',
            },
          ],
        },
      });
    };

    const response = await getMyProviderApplicationDocuments({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(response.application.verificationStatus, 'pending');
    assert.equal(response.documents[0]?.documentType, 'government_id');
  });

  it('manages customer saved addresses through the gateway', async () => {
    const calls: Array<{ url: string; method?: string; body?: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: init?.method,
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      });

      if (url === 'http://gateway.test/v1/me/addresses' && init?.method === 'GET') {
        return jsonResponse({
          data: [
            {
              id: 'address-1',
              userId: 'user-1',
              label: 'Home',
              address: '123 Test St',
              barangay: null,
              city: 'Manila',
              province: null,
              region: 'NCR',
              latitude: 14.5995,
              longitude: 120.9842,
              isDefault: true,
              createdAt: null,
              updatedAt: null,
            },
          ],
        });
      }

      if (url === 'http://gateway.test/v1/me/addresses' && init?.method === 'POST') {
        return jsonResponse({
          data: {
            id: 'address-2',
            userId: 'user-1',
            label: 'Work',
            address: '456 Office Ave',
            barangay: null,
            city: null,
            province: null,
            region: null,
            latitude: null,
            longitude: null,
            isDefault: false,
            createdAt: null,
            updatedAt: null,
          },
        });
      }

      if (
        url === 'http://gateway.test/v1/me/addresses/address-2/default' &&
        init?.method === 'POST'
      ) {
        return jsonResponse({
          data: {
            id: 'address-2',
            userId: 'user-1',
            label: 'Work',
            address: '456 Office Ave',
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

      assert.equal(url, 'http://gateway.test/v1/me/addresses/address-1');
      assert.equal(init?.method, 'DELETE');
      return jsonResponse({ data: { ok: true } });
    };

    const addresses = await listCustomerAddresses({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const created = await createCustomerAddress(
      { label: 'Work', address: '456 Office Ave' },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );
    const defaultAddress = await setDefaultCustomerAddress('address-2', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const deleted = await deleteCustomerAddress('address-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(addresses[0]?.label, 'Home');
    assert.equal(created.address, '456 Office Ave');
    assert.equal(defaultAddress.isDefault, true);
    assert.deepEqual(deleted, { ok: true });
    assert.deepEqual(calls.map((call) => [call.method, call.url]), [
      ['GET', 'http://gateway.test/v1/me/addresses'],
      ['POST', 'http://gateway.test/v1/me/addresses'],
      ['POST', 'http://gateway.test/v1/me/addresses/address-2/default'],
      ['DELETE', 'http://gateway.test/v1/me/addresses/address-1'],
    ]);
  });

  it('updates the current user password through the gateway', async () => {
    let authorization: string | null = null;
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/me/password');
      assert.equal(init?.method, 'PATCH');
      authorization = new Headers(init?.headers).get('authorization');
      requestBody = JSON.parse(String(init?.body));

      return jsonResponse({
        data: { ok: true },
      });
    };

    const result = await updateCurrentUserPassword(
      {
        currentPassword: 'OldPassword#2026',
        newPassword: 'NewPassword#2026',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(result.ok, true);
    assert.equal(authorization, 'Bearer access-token');
    assert.deepEqual(requestBody, {
      currentPassword: 'OldPassword#2026',
      newPassword: 'NewPassword#2026',
    });
  });

  it('deletes the current user account through the gateway', async () => {
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/me');
      assert.equal(init?.method, 'DELETE');
      assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer access-token');
      return jsonResponse({ data: { ok: true } });
    };

    const deleted = await deleteCurrentUserAccount({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.deepEqual(deleted, { ok: true });
  });

  it('manages current user two-factor authentication through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      if (url.endsWith('/enable')) {
        return jsonResponse({
          data: {
            enabled: false,
            secret: 'JBSWY3DPEHPK3PXP',
            otpauthUrl: 'otpauth://totp/ServEase:test',
            qrCodeDataUrl: 'data:image/png;base64,test',
          },
        });
      }
      return jsonResponse({
        data: {
          enabled: !url.endsWith('/disable'),
          verifiedAt: '2026-05-17T00:00:00.000Z',
        },
      });
    };

    await enableCurrentUserTwoFactor({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    await verifyCurrentUserTwoFactor('123456', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    await disableCurrentUserTwoFactor('123456', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.deepEqual(calls.map((call) => [call.url, call.method]), [
      ['http://gateway.test/v1/me/two-factor/enable', 'POST'],
      ['http://gateway.test/v1/me/two-factor/verify', 'POST'],
      ['http://gateway.test/v1/me/two-factor/disable', 'POST'],
    ]);
    assert.deepEqual(calls[1]?.body, { code: '123456' });
    assert.deepEqual(calls[2]?.body, { code: '123456' });
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
          attachment: null,
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
    assert.deepEqual(calls[1]?.body, {
      content: 'Hello provider',
      attachment: null,
    });
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
      {
        bookingId: 'booking-1',
        paymentMethod: 'cash_on_service',
        promoCode: 'SERVEASE10',
      },
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
      promoCode: 'SERVEASE10',
    });
    assert.deepEqual(bodies[1], {
      subject: 'Need help',
      message: 'Please check my booking.',
      category: 'booking',
    });
    assert.equal(payment.status, 'pending');
    assert.equal(ticket.status, 'open');
  });

  it('creates APICenter checkout sessions and reads checkout status', async () => {
    const calls: Array<{
      url: string;
      method: string;
      authorization: string | null;
      body: unknown;
    }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        authorization: new Headers(init?.headers).get('authorization'),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      return jsonResponse({
        data: {
          checkoutId: 'checkout-1',
          provider: 'paymongo',
          status: url.endsWith('/status') ? 'paid' : 'created',
          referenceId: 'booking-1',
          redirectUrl: 'https://pay.test/checkout-1',
          paymentId: 'payment-1',
          bookingId: 'booking-1',
          localPaymentStatus: url.endsWith('/status') ? 'paid' : 'pending',
        },
      });
    };

    const checkout = await createCheckoutSession(
      {
        bookingId: 'booking-1',
        successUrl: 'servease://payment/success',
        cancelUrl: 'servease://payment/cancel',
        paymentMethods: ['gcash'],
      },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );
    const status = await getCheckoutStatus('checkout-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(checkout.checkoutId, 'checkout-1');
    assert.equal(status.status, 'paid');
    assert.equal(status.paymentId, 'payment-1');
    assert.equal(status.localPaymentStatus, 'paid');
    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/payments/checkout-sessions',
        method: 'POST',
        authorization: 'Bearer access-token',
        body: {
          bookingId: 'booking-1',
          successUrl: 'servease://payment/success',
          cancelUrl: 'servease://payment/cancel',
          paymentMethods: ['gcash'],
        },
      },
      {
        url: 'http://gateway.test/v1/payments/checkout-sessions/checkout-1/status',
        method: 'GET',
        authorization: 'Bearer access-token',
        body: null,
      },
    ]);
  });

  it('uses authenticated APICenter geo gateway endpoints', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      if (url.endsWith('/geofence/check')) {
        return jsonResponse({
          data: {
            inside: true,
            distanceDetails: [],
            provider: 'local',
          },
        });
      }

      return jsonResponse({
        data: {
          formattedAddress: 'Manila, Philippines',
          latitude: 14.5995,
          longitude: 120.9842,
          provider: 'google-maps',
        },
      });
    };

    await geocodeAddress('Manila, Philippines', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
      language: 'en',
    });
    await reverseGeocode(14.5995, 120.9842, {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    await checkGeoFence(
      { latitude: 14.5995, longitude: 120.9842, fenceId: 'metro-manila' },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );
    await getDirections(
      {
        origin: { latitude: 14.5995, longitude: 120.9842 },
        destination: { latitude: 14.61, longitude: 121.001 },
      },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/geo/geocode',
        method: 'POST',
        body: {
          address: 'Manila, Philippines',
          language: 'en',
        },
      },
      {
        url: 'http://gateway.test/v1/geo/reverse-geocode',
        method: 'POST',
        body: {
          latitude: 14.5995,
          longitude: 120.9842,
        },
      },
      {
        url: 'http://gateway.test/v1/geo/geofence/check',
        method: 'POST',
        body: {
          latitude: 14.5995,
          longitude: 120.9842,
          fenceId: 'metro-manila',
        },
      },
      {
        url: 'http://gateway.test/v1/geo/directions',
        method: 'POST',
        body: {
          origin: { latitude: 14.5995, longitude: 120.9842 },
          destination: { latitude: 14.61, longitude: 121.001 },
        },
      },
    ]);
  });

  it('validates promotion codes through the authenticated gateway endpoint', async () => {
    let requestBody: unknown = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/payments/promotions/validate');
      assert.equal(init?.method, 'POST');
      assert.equal(
        new Headers(init?.headers).get('authorization'),
        'Bearer access-token',
      );
      requestBody = JSON.parse(String(init?.body));
      return jsonResponse({
        data: {
          code: 'SERVEASE10',
          valid: true,
          discountAmount: 120,
          finalAmount: 1080,
          message: 'Promo applied.',
        },
      });
    };

    const promotion = await validatePromotion('booking-1', 'SERVEASE10', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.deepEqual(requestBody, {
      bookingId: 'booking-1',
      code: 'SERVEASE10',
    });
    assert.equal(promotion.finalAmount, 1080);
  });

  it('manages customer payment methods through authenticated gateway endpoints', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      if (init?.method === 'GET') {
        return jsonResponse({
          data: [
            {
              id: 'method-1',
              customerId: 'customer-1',
              methodType: 'cash_on_service',
              label: 'Cash on service',
              brand: 'Cash',
              last4: null,
              isDefault: true,
              createdAt: '2026-05-16T00:00:00.000Z',
            },
          ],
        });
      }

      if (init?.method === 'DELETE') {
        return jsonResponse({
          data: {
            id: 'method-2',
            customerId: 'customer-1',
            methodType: 'card',
            label: 'Card ending 4242',
            brand: 'Visa',
            last4: '4242',
            isDefault: false,
            createdAt: '2026-05-16T00:00:00.000Z',
          },
        });
      }

      return jsonResponse({
        data: {
          id: 'method-2',
          customerId: 'customer-1',
          methodType: 'card',
          label: 'Card ending 4242',
          brand: 'Visa',
          last4: '4242',
          isDefault: true,
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      });
    };

    const methods = await listCustomerPaymentMethods({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const method = await upsertCustomerPaymentMethod(
      {
        methodType: 'card',
        label: 'Card ending 4242',
        brand: 'Visa',
        last4: '4242',
        isDefault: true,
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );
    const deleted = await deleteCustomerPaymentMethod('method-2', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(methods[0]?.methodType, 'cash_on_service');
    assert.equal(method.methodType, 'card');
    assert.equal(deleted.id, 'method-2');
    assert.deepEqual(calls.map((call) => [call.url, call.method, call.body]), [
      ['http://gateway.test/v1/payments/methods', 'GET', null],
      [
        'http://gateway.test/v1/payments/methods',
        'PUT',
        {
          methodType: 'card',
          label: 'Card ending 4242',
          brand: 'Visa',
          last4: '4242',
          isDefault: true,
        },
      ],
      ['http://gateway.test/v1/payments/methods/method-2', 'DELETE', null],
    ]);
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

  it('adds and deletes provider portfolio media through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      if (init?.method === 'DELETE') {
        return jsonResponse({}, 204);
      }

      return jsonResponse({
        data: {
          id: 'portfolio-1',
          providerId: 'provider-1',
          uploadedBy: 'provider-user-1',
          fileUrl: 'https://storage.test/portfolio.jpg',
          fileName: 'portfolio.jpg',
          mimeType: 'image/jpeg',
          storagePath: 'provider_portfolio/provider-user-1/portfolio.jpg',
          fileSize: 12,
          caption: 'Completed cleaning job',
          sortOrder: 0,
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      });
    };

    const media = await addProviderPortfolioMedia(
      {
        fileUrl: 'https://storage.test/portfolio.jpg',
        fileName: 'portfolio.jpg',
        mimeType: 'image/jpeg',
        storagePath: 'provider_portfolio/provider-user-1/portfolio.jpg',
        fileSize: 12,
        caption: 'Completed cleaning job',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );
    await deleteProviderPortfolioMedia('portfolio-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(media.id, 'portfolio-1');
    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/catalog/provider/portfolio',
        method: 'POST',
        body: {
          fileUrl: 'https://storage.test/portfolio.jpg',
          fileName: 'portfolio.jpg',
          mimeType: 'image/jpeg',
          storagePath: 'provider_portfolio/provider-user-1/portfolio.jpg',
          fileSize: 12,
          caption: 'Completed cleaning job',
        },
      },
      {
        url: 'http://gateway.test/v1/catalog/provider/portfolio/portfolio-1',
        method: 'DELETE',
        body: null,
      },
    ]);
  });

  it('updates and reorders provider portfolio media through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      return jsonResponse({
        data: url.endsWith('/order')
          ? []
          : {
              id: 'portfolio-1',
              providerId: 'provider-1',
              uploadedBy: 'provider-user-1',
              fileUrl: 'https://storage.test/portfolio.jpg',
              fileName: 'portfolio.jpg',
              mimeType: 'image/jpeg',
              storagePath: 'provider_portfolio/provider-user-1/portfolio.jpg',
              fileSize: 12,
              caption: 'Updated caption',
              sortOrder: 0,
              createdAt: '2026-05-16T00:00:00.000Z',
            },
      });
    };

    await updateProviderPortfolioMedia(
      'portfolio-1',
      {
        fileUrl: 'https://storage.test/portfolio.jpg',
        fileName: 'portfolio.jpg',
        mimeType: 'image/jpeg',
        storagePath: 'provider_portfolio/provider-user-1/portfolio.jpg',
        fileSize: 12,
        caption: 'Updated caption',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );
    await reorderProviderPortfolio(
      [
        { id: 'portfolio-2', sortOrder: 0 },
        { id: 'portfolio-1', sortOrder: 1 },
      ],
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/catalog/provider/portfolio/portfolio-1',
        method: 'PUT',
        body: {
          fileUrl: 'https://storage.test/portfolio.jpg',
          fileName: 'portfolio.jpg',
          mimeType: 'image/jpeg',
          storagePath: 'provider_portfolio/provider-user-1/portfolio.jpg',
          fileSize: 12,
          caption: 'Updated caption',
        },
      },
      {
        url: 'http://gateway.test/v1/catalog/provider/portfolio/order',
        method: 'PUT',
        body: {
          items: [
            { id: 'portfolio-2', sortOrder: 0 },
            { id: 'portfolio-1', sortOrder: 1 },
          ],
        },
      },
    ]);
  });

  it('deletes booking attachments and raises booking disputes through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      return jsonResponse({
        data: url.endsWith('/disputes')
          ? {
              id: 'dispute-1',
              bookingId: 'booking-1',
              raisedBy: 'user-1',
              category: 'damage',
              reason: 'Incorrect work',
              description: null,
              status: 'open',
              resolvedAt: null,
              resolvedBy: null,
              createdAt: '2026-05-16T00:00:00.000Z',
            }
          : {
              id: 'attachment-1',
              bookingId: 'booking-1',
              uploadedBy: 'user-1',
              mediaKind: 'booking_reference',
              fileUrl: 'https://storage.test/photo.jpg',
              fileName: 'photo.jpg',
              mimeType: 'image/jpeg',
              storagePath: 'booking_reference/user/photo.jpg',
              fileSize: 12,
              caption: null,
              createdAt: '2026-05-16T00:00:00.000Z',
            },
      });
    };

    await deleteBookingAttachment('booking-1', 'attachment-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const dispute = await raiseBookingDispute(
      'booking-1',
      {
        category: 'damage',
        reason: 'Incorrect work',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(dispute.id, 'dispute-1');
    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/bookings/booking-1/attachments/attachment-1',
        method: 'DELETE',
        body: null,
      },
      {
        url: 'http://gateway.test/v1/bookings/booking-1/disputes',
        method: 'POST',
        body: {
          category: 'damage',
          reason: 'Incorrect work',
        },
      },
    ]);
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

  it('registers and unregisters mobile push devices through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      if (init?.method === 'DELETE') {
        return jsonResponse({ data: { ok: true } });
      }

      return jsonResponse({
        data: {
          id: 'device-1',
          userId: 'user-1',
          token: 'ExponentPushToken[abc]',
          platform: 'ios',
          deviceId: 'ios-device-1',
          isActive: true,
          lastRegisteredAt: '2026-05-18T00:00:00.000Z',
          createdAt: '2026-05-18T00:00:00.000Z',
        },
      });
    };

    const device = await registerPushDevice(
      {
        token: 'ExponentPushToken[abc]',
        platform: 'ios',
        deviceId: 'ios-device-1',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );
    const result = await unregisterPushDevice('ExponentPushToken[abc]', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/notifications/devices',
        method: 'POST',
        body: {
          token: 'ExponentPushToken[abc]',
          platform: 'ios',
          deviceId: 'ios-device-1',
        },
      },
      {
        url: 'http://gateway.test/v1/notifications/devices/ExponentPushToken%5Babc%5D',
        method: 'DELETE',
        body: null,
      },
    ]);
    assert.equal(device.isActive, true);
    assert.equal(result.ok, true);
  });

  it('loads referral summaries through the gateway', async () => {
    let authorization: string | null = null;
    const fetcher = async (url: string, init?: RequestInit) => {
      assert.equal(url, 'http://gateway.test/v1/referrals');
      assert.equal(init?.method, 'GET');
      authorization = new Headers(init?.headers).get('authorization');
      return jsonResponse({
        data: {
          referralCode: 'SE-ABC12345',
          referralLinkPath: '/signup?ref=SE-ABC12345',
          completedReferrals: 2,
          pendingReferrals: 1,
          totalRewards: 300,
        },
      });
    };

    const summary = await getReferralSummary({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.equal(authorization, 'Bearer access-token');
    assert.equal(summary.referralCode, 'SE-ABC12345');
    assert.equal(summary.totalRewards, 300);
  });

  it('loads and updates user preferences through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });

      return jsonResponse({
        data: {
          userId: 'user-1',
          pushNotificationsEnabled: false,
          darkModeEnabled: true,
          language: 'fil',
          updatedAt: '2026-05-16T00:00:00.000Z',
        },
      });
    };

    const current = await getUserPreferences({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const updated = await updateUserPreferences(
      {
        pushNotificationsEnabled: false,
        darkModeEnabled: true,
        language: 'fil',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
      },
    );

    assert.equal(current.language, 'fil');
    assert.equal(updated.darkModeEnabled, true);
    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/me/preferences',
        method: 'GET',
        body: null,
      },
      {
        url: 'http://gateway.test/v1/me/preferences',
        method: 'PUT',
        body: {
          pushNotificationsEnabled: false,
          darkModeEnabled: true,
          language: 'fil',
        },
      },
    ]);
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
      timeOffWindows: [],
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

  it('adds and removes provider partial time-off windows through the gateway', async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    const schedule = {
      providerId: 'provider-1',
      windows: [],
      daysOff: [],
      timeOffWindows: [
        {
          id: 'time-off-1',
          offDate: '2026-05-24',
          startTime: '14:00',
          endTime: '17:00',
          reason: 'Personal errand',
        },
      ],
    };
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return jsonResponse({ data: schedule });
    };

    await addProviderTimeOffWindow(
      {
        offDate: '2026-05-24',
        startTime: '14:00',
        endTime: '17:00',
        reason: 'Personal errand',
      },
      { baseUrl: 'http://gateway.test', token: 'access-token', fetcher },
    );
    await removeProviderTimeOffWindow('time-off-1', {
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });

    assert.deepEqual(calls, [
      {
        url: 'http://gateway.test/v1/provider/availability/time-off',
        method: 'POST',
        body: {
          offDate: '2026-05-24',
          startTime: '14:00',
          endTime: '17:00',
          reason: 'Personal errand',
        },
      },
      {
        url: 'http://gateway.test/v1/provider/availability/time-off/time-off-1',
        method: 'DELETE',
        body: null,
      },
    ]);
  });

  it('loads provider payouts and requests a payout with idempotency', async () => {
    const calls: Array<{
      url: string;
      method: string;
      body: unknown;
      idempotencyKey: string | null;
    }> = [];
    const fetcher = async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        method: String(init?.method),
        body: init?.body ? JSON.parse(String(init.body)) : null,
        idempotencyKey: new Headers(init?.headers).get('idempotency-key'),
      });

      if (url.endsWith('/payout-account')) {
        return jsonResponse({
          data: {
            availableBalance: 1000,
            pendingBalance: 250,
            totalPaidOut: 5000,
            nextPayoutDate: '2026-05-22',
          },
        });
      }

      if (url.endsWith('/payout-methods')) {
        return jsonResponse({
          data: [
            {
              id: 'method-1',
              providerId: 'provider-1',
              methodType: 'gcash',
              accountLabel: 'GCash **** 1234',
              accountName: 'Provider',
              accountNumberLast4: '1234',
              isDefault: true,
              createdAt: '2026-05-16T00:00:00.000Z',
            },
          ],
        });
      }

      if (init?.method === 'POST') {
        return jsonResponse({
          data: {
            id: 'payout-1',
            providerId: 'provider-1',
            amount: 500,
            processingFee: 12.5,
            netAmount: 487.5,
            status: 'requested',
            payoutMethodId: 'method-1',
            methodType: 'gcash',
            accountLabel: 'GCash **** 1234',
            reference: 'PO-TEST',
            periodStart: null,
            periodEnd: null,
            requestedAt: '2026-05-16T00:00:00.000Z',
            paidAt: null,
            createdAt: '2026-05-16T00:00:00.000Z',
          },
        });
      }

      return jsonResponse({ data: [] });
    };

    const account = await getProviderPayoutAccount({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const methods = await listProviderPayoutMethods({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const payouts = await listProviderPayouts({
      baseUrl: 'http://gateway.test',
      token: 'access-token',
      fetcher,
    });
    const payout = await requestProviderPayout(
      {
        amount: 500,
        payoutMethodId: 'method-1',
      },
      {
        baseUrl: 'http://gateway.test',
        token: 'access-token',
        fetcher,
        idempotencyKey: 'mobile-provider-payout-retry-1',
      },
    );

    assert.equal(account.availableBalance, 1000);
    assert.equal(methods[0]?.id, 'method-1');
    assert.deepEqual(payouts, []);
    assert.equal(payout.reference, 'PO-TEST');
    assert.deepEqual(calls.map((call) => [call.url, call.method, call.body]), [
      ['http://gateway.test/v1/payments/payout-account', 'GET', null],
      ['http://gateway.test/v1/payments/payout-methods', 'GET', null],
      ['http://gateway.test/v1/payments/payouts', 'GET', null],
      [
        'http://gateway.test/v1/payments/payouts',
        'POST',
        {
          amount: 500,
          payoutMethodId: 'method-1',
        },
      ],
    ]);
    assert.equal(calls[3]?.idempotencyKey, 'mobile-provider-payout-retry-1');
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
