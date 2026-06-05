import { BookingGatewayService } from './booking.service';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import {
  BookingPriceChangedError,
  BookingScheduleInPastError,
  BookingStartWindowNotOpenError,
  InvalidBookingScheduleError,
  InvalidBookingTransitionError,
} from './booking.errors';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { CatalogServiceClient as CatalogBrowseServiceClient } from '../catalog/clients/catalog-service.client';
import { GeoServiceClient } from '../geo/clients/geo-service.client';
import { PaymentGatewayService } from '../payments/payment.service';
import { firstValueFrom } from 'rxjs';

describe('BookingGatewayService', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('forwards booking creation with the authenticated user id', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue({
        id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        status: 'pending',
      }),
    } as unknown as BookingServiceClient;
    const authClient = createAuthClient();
    const catalogClient = {
      findProviderBusinessNameByProviderId: jest
        .fn()
        .mockResolvedValue('GreenFix Home Services'),
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
        businessName: 'GreenFix Home Services',
      }),
    };
    const service = new BookingGatewayService(
      client,
      authClient,
      undefined,
      catalogClient as unknown as CatalogServiceClient,
    );

    const booking = await service.createBooking(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        serviceLatitude: 14.554729,
        serviceLongitude: 121.024445,
        scheduledAt: '2026-07-20T08:00:00.000Z',
      },
    );

    expect(client.createBooking).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      expect.objectContaining({
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        serviceLatitude: 14.554729,
        serviceLongitude: 121.024445,
        scheduledAt: '2026-07-20T08:00:00.000Z',
        serviceAmount: 0,
        totalAmount: 145,
        acceptedQuoteId: null,
        priceBreakdown: expect.objectContaining({
          serviceSubtotal: 0,
          travelFee: 120,
          serviceFee: 25,
          total: 145,
          fallbackUsed: true,
        }),
      }),
    );
    expect(booking.customerFullName).toBe('Casey Customer');
    expect(booking.customerContactNumber).toBe('+639170001001');
    expect(booking.providerBusinessName).toBe('GreenFix Home Services');
  });

  it('calculates the authoritative booking total from the provider listing rate', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          serviceAmount: 1500,
          totalAmount: 1701,
        }),
      ),
    } as unknown as BookingServiceClient;
    const catalogBrowseClient = {
      listProviderListings: jest.fn().mockResolvedValue([
        {
          id: 'listing-1',
          providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          providerBusinessName: 'GreenFix Home Services',
          serviceId: 'service-1',
          title: 'Deep Clean',
          description: 'Detailed cleaning',
          price: 1500,
          pricingMode: 'flat',
          averageRating: 5,
          reviewCount: 10,
          verificationStatus: 'approved',
        },
      ]),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      undefined,
      undefined,
      catalogBrowseClient as unknown as CatalogBrowseServiceClient,
    );

    await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceId: 'service-1',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-07-20T08:00:00.000Z',
      serviceAmount: 999,
    });

    expect(catalogBrowseClient.listProviderListings).toHaveBeenCalledWith(
      'service-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(client.createBooking).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      expect.objectContaining({
        serviceTitle: 'Deep Clean',
        serviceDescription: 'Detailed cleaning',
        serviceAmount: 1500,
        totalAmount: 1701,
        pricingMode: 'flat',
        priceBreakdown: expect.objectContaining({
          serviceSubtotal: 1500,
          travelFee: 120,
          serviceFee: 81,
          total: 1701,
          fallbackUsed: true,
        }),
      }),
    );
  });

  it.each([
    { pricingMode: 'flat' as const, rate: 1500, hoursRequired: 3 },
    { pricingMode: 'hourly' as const, rate: 500, hoursRequired: 3 },
  ])(
    'uses the same booking price breakdown for $pricingMode preview and creation',
    async ({ pricingMode, rate, hoursRequired }) => {
      const client = {
        createBooking: jest.fn().mockImplementation((_customerId, input) =>
          Promise.resolve(
            createBookingSummary({
              serviceAmount: input.serviceAmount,
              totalAmount: input.totalAmount,
              pricingMode: input.pricingMode,
              priceBreakdown: input.priceBreakdown,
            }),
          ),
        ),
      } as unknown as BookingServiceClient;
      const catalogBrowseClient = {
        listProviderListings: jest.fn().mockResolvedValue([
          {
            id: 'listing-1',
            providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
            providerBusinessName: 'GreenFix Home Services',
            serviceId: 'service-1',
            title: 'Deep Clean',
            description: 'Detailed cleaning',
            price: rate,
            pricingMode,
            averageRating: 5,
            reviewCount: 10,
            verificationStatus: 'approved',
          },
        ]),
      };
      const service = new BookingGatewayService(
        client,
        createAuthClient(),
        undefined,
        undefined,
        undefined,
        undefined,
        catalogBrowseClient as unknown as CatalogBrowseServiceClient,
      );
      const input = {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceId: 'service-1',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-07-20T08:00:00.000Z',
        hoursRequired,
        serviceAmount: 999,
      };

      const preview = await service.previewBookingPrice(
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        input,
      );
      const booking = await service.createBooking(
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        {
          ...input,
          previewTotalAmount: preview.totalAmount,
        },
      );

      expect(booking.serviceAmount).toBe(preview.serviceAmount);
      expect(booking.totalAmount).toBe(preview.totalAmount);
      expect(booking.pricingMode).toBe(preview.pricingMode);
      expect(booking.priceBreakdown).toEqual(
        expect.objectContaining({
          serviceSubtotal: preview.priceBreakdown.serviceSubtotal,
          travelFee: preview.priceBreakdown.travelFee,
          serviceFee: preview.priceBreakdown.serviceFee,
          total: preview.priceBreakdown.total,
          metadata: expect.objectContaining({
            pricingMode,
            hoursRequired,
            serviceRate: rate,
          }),
        }),
      );
    },
  );

  it('rejects booking creation with an updated breakdown when the preview total materially changed', async () => {
    const client = {
      createBooking: jest.fn(),
    } as unknown as BookingServiceClient;
    const catalogBrowseClient = {
      listProviderListings: jest.fn().mockResolvedValue([
        {
          id: 'listing-1',
          providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
          providerBusinessName: 'GreenFix Home Services',
          serviceId: 'service-1',
          title: 'Deep Clean',
          description: 'Detailed cleaning',
          price: 2200,
          pricingMode: 'flat',
          averageRating: 5,
          reviewCount: 10,
          verificationStatus: 'approved',
        },
      ]),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      undefined,
      undefined,
      catalogBrowseClient as unknown as CatalogBrowseServiceClient,
    );

    await expect(
      service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceId: 'service-1',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-07-20T08:00:00.000Z',
        serviceAmount: 1500,
        previewTotalAmount: 1500,
      }),
    ).rejects.toMatchObject({
      details: expect.objectContaining({
        previousTotalAmount: 1500,
        updatedTotalAmount: 2436,
        preview: expect.objectContaining({
          totalAmount: 2436,
          priceBreakdown: expect.objectContaining({
            serviceSubtotal: 2200,
            travelFee: 120,
            serviceFee: 116,
            total: 2436,
          }),
        }),
      }),
    });
    await expect(
      service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceId: 'service-1',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-07-20T08:00:00.000Z',
        serviceAmount: 1500,
        previewTotalAmount: 1500,
      }),
    ).rejects.toBeInstanceOf(BookingPriceChangedError);
    expect(client.createBooking).not.toHaveBeenCalled();
  });

  it('creates a provider notification when a customer books a service', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(createBookingSummary()),
    } as unknown as BookingServiceClient;
    const notificationClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    };
    const catalogClient = {
      findProviderBusinessNameByProviderId: jest
        .fn()
        .mockResolvedValue('GreenFix Home Services'),
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
        businessName: 'GreenFix Home Services',
      }),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      notificationClient as unknown as NotificationServiceClient,
      catalogClient as unknown as CatalogServiceClient,
    );

    await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-07-20T08:00:00.000Z',
    });

    expect(catalogClient.findProviderOwnerByProviderId).toHaveBeenCalledWith(
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(notificationClient.createNotification).toHaveBeenCalledWith({
      userId: 'provider-user-1',
      type: 'booking_created',
      title: 'New booking request',
      body: 'Casey Customer requested Deep Clean.',
      metadata: {
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        bookingReference: 'SE-ABC123',
        status: 'pending',
      },
    });
  });

  it('keeps booking creation successful when provider notification dispatch fails', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(createBookingSummary()),
    } as unknown as BookingServiceClient;
    const notificationClient = {
      createNotification: jest
        .fn()
        .mockRejectedValue(new Error('notification down')),
    };
    const catalogClient = {
      findProviderBusinessNameByProviderId: jest
        .fn()
        .mockResolvedValue('GreenFix Home Services'),
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
        businessName: 'GreenFix Home Services',
      }),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      notificationClient as unknown as NotificationServiceClient,
      catalogClient as unknown as CatalogServiceClient,
    );

    await expect(
      service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-07-20T08:00:00.000Z',
      }),
    ).resolves.toMatchObject({
      id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      providerBusinessName: 'GreenFix Home Services',
    });
  });

  it('reserves a pending cash payment when a cash booking is created', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          totalAmount: 1200,
        }),
      ),
    } as unknown as BookingServiceClient;
    const paymentGatewayService = {
      createPayment: jest.fn().mockResolvedValue({ id: 'payment-1' }),
    } as unknown as PaymentGatewayService;
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      undefined,
      paymentGatewayService,
    );

    await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-07-20T08:00:00.000Z',
      paymentMethod: 'cash_on_service',
    });

    expect(paymentGatewayService.createPayment).toHaveBeenCalledWith({
      bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      amount: 1200,
      paymentMethod: 'cash_on_service',
    });
  });

  it('rejects past schedules before booking creation and payment side effects', async () => {
    const client = {
      createBooking: jest.fn(),
    } as unknown as BookingServiceClient;
    const paymentGatewayService = {
      createPayment: jest.fn(),
    } as unknown as PaymentGatewayService;
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      undefined,
      paymentGatewayService,
    );

    await expect(
      service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-01-01T00:00:00.000Z',
        paymentMethod: 'cash_on_service',
      }),
    ).rejects.toBeInstanceOf(BookingScheduleInPastError);

    expect(client.createBooking).not.toHaveBeenCalled();
    expect(paymentGatewayService.createPayment).not.toHaveBeenCalled();
  });

  it('rejects unparsable booking schedules before booking creation', async () => {
    const client = {
      createBooking: jest.fn(),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        scheduledAt: 'not-a-date',
      }),
    ).rejects.toBeInstanceOf(InvalidBookingScheduleError);

    expect(client.createBooking).not.toHaveBeenCalled();
  });

  it('creates a final breakdown and ignores accepted quote tokens', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          totalAmount: 1386,
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceId: 'service-1',
      serviceAddress: ' 123   Test St ',
      scheduledAt: '2026-07-20T08:00:00.000Z',
      hoursRequired: 2,
      serviceAmount: 1200,
      pricingMode: 'flat',
      acceptedQuoteId: 'quote-1',
    });

    expect(client.createBooking).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      expect.objectContaining({
        serviceAmount: 1200,
        totalAmount: 1386,
        acceptedQuoteId: null,
        quoteFairnessStatus: null,
        quoteConfidence: null,
        priceBreakdown: expect.objectContaining({
          serviceSubtotal: 1200,
          travelFee: 120,
          serviceFee: 66,
          total: 1386,
        }),
      }),
    );
  });

  it('keeps cash booking creation resilient when a stale quote token is sent', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          totalAmount: 1386,
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceId: 'service-1',
        serviceAddress: '456 Other St',
        scheduledAt: '2026-07-20T08:00:00.000Z',
        hoursRequired: 2,
        serviceAmount: 1200,
        pricingMode: 'flat',
        acceptedQuoteId: 'quote-1',
        paymentMethod: 'cash_on_service',
      }),
    ).resolves.toMatchObject({ id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc' });

    expect(client.createBooking).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      expect.objectContaining({
        acceptedQuoteId: null,
        priceBreakdown: expect.objectContaining({
          calculationSource: 'fallback',
          fallbackUsed: true,
        }),
      }),
    );
  });

  it('forwards booking list visibility ids and enriches customer contact once per customer', async () => {
    const client = {
      listBookings: jest.fn().mockResolvedValue([
        {
          id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        },
        {
          id: '3af5444e-7c0d-4bde-b4aa-352bbaed3813',
          customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        },
      ]),
    } as unknown as BookingServiceClient;
    const authClient = createAuthClient();
    const catalogClient = {
      findProviderBusinessNameByProviderId: jest
        .fn()
        .mockResolvedValue('GreenFix Home Services'),
      findProviderOwnerByProviderId: jest.fn().mockResolvedValue({
        userId: 'provider-user-1',
        businessName: 'GreenFix Home Services',
      }),
    };
    const service = new BookingGatewayService(
      client,
      authClient,
      undefined,
      catalogClient as unknown as CatalogServiceClient,
    );

    const bookings = await service.listBookings(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );

    expect(client.listBookings).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(authClient.findUserById).toHaveBeenCalledTimes(1);
    expect(
      catalogClient.findProviderBusinessNameByProviderId,
    ).toHaveBeenCalledTimes(1);
    expect(catalogClient.findProviderOwnerByProviderId).not.toHaveBeenCalled();
    expect(bookings).toEqual([
      expect.objectContaining({
        customerFullName: 'Casey Customer',
        customerContactNumber: '+639170001001',
        providerBusinessName: 'GreenFix Home Services',
      }),
      expect.objectContaining({
        customerFullName: 'Casey Customer',
        customerContactNumber: '+639170001001',
        providerBusinessName: 'GreenFix Home Services',
      }),
    ]);
  });

  it('forwards booking service update reads and writes with provider identity', async () => {
    const client = {
      listServiceUpdates: jest.fn().mockResolvedValue([
        {
          id: 'update-1',
          bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          actorId: 'provider-user-1',
          updateType: 'progress',
          message: 'Halfway done.',
          checklist: null,
          attachmentId: null,
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      ]),
      createServiceUpdate: jest.fn().mockResolvedValue({
        id: 'update-2',
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        actorId: 'provider-user-1',
        updateType: 'checklist',
        message: 'Pre-service checklist completed.',
        checklist: {
          scopeConfirmed: true,
          toolsReady: true,
          instructionsReviewed: true,
        },
        attachmentId: null,
        createdAt: '2026-05-16T00:01:00.000Z',
      }),
      listTimelineEvents: jest.fn().mockResolvedValue([
        {
          id: 'timeline-1',
          bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          eventType: 'created',
          label: 'Booking requested',
          icon: 'calendar',
          createdAt: '2026-05-16T00:00:00.000Z',
        },
      ]),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const updates = await service.listServiceUpdates(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    const created = await service.createServiceUpdate(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      {
        updateType: 'checklist',
        message: 'Pre-service checklist completed.',
        checklist: {
          scopeConfirmed: true,
          toolsReady: true,
          instructionsReviewed: true,
        },
      },
    );
    const timeline = await service.listTimelineEvents(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );

    expect(client.listServiceUpdates).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(client.createServiceUpdate).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      {
        actorId: 'provider-user-1',
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        updateType: 'checklist',
        message: 'Pre-service checklist completed.',
        checklist: {
          scopeConfirmed: true,
          toolsReady: true,
          instructionsReviewed: true,
        },
      },
    );
    expect(updates[0]?.message).toBe('Halfway done.');
    expect(created.updateType).toBe('checklist');
    expect(client.listTimelineEvents).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(timeline[0]?.eventType).toBe('created');
  });

  it('forwards dispute creation with the authenticated actor id', async () => {
    const client = {
      raiseDispute: jest.fn().mockResolvedValue({
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
      }),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const dispute = await service.raiseDispute('booking-1', 'user-1', {
      category: 'damage',
      reason: 'Incorrect work',
    });

    expect(client.raiseDispute).toHaveBeenCalledWith('booking-1', {
      actorId: 'user-1',
      category: 'damage',
      reason: 'Incorrect work',
    });
    expect(dispute.id).toBe('dispute-1');
  });

  it('forwards booking tracking reads with booking visibility ids', async () => {
    const client = {
      getTrackingSnapshot: jest.fn().mockResolvedValue({
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        bookingReference: 'SE-ABC123',
        status: 'in_progress',
        phase: 'on_the_way',
        etaMinutes: 18,
        distanceKm: 5.2,
        trafficLevel: 'moderate',
        destinationAddress: '123 Test St',
        destinationLocation: null,
        providerLocation: null,
        scheduledAt: '2026-07-20T08:00:00.000Z',
        lastUpdatedAt: '2026-05-16T00:00:00.000Z',
      }),
    } as unknown as BookingServiceClient;
    const geoClient = {
      geocodeAddress: jest.fn().mockResolvedValue({
        formattedAddress: '123 Test St, Manila, Philippines',
        latitude: 14.5995,
        longitude: 120.9842,
        provider: 'google-maps',
      }),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      geoClient as unknown as GeoServiceClient,
    );

    const snapshot = await service.getTrackingSnapshot(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      null,
    );

    expect(client.getTrackingSnapshot).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      null,
    );
    expect(geoClient.geocodeAddress).toHaveBeenCalledWith({
      address: '123 Test St',
      language: 'en',
      region: 'ph',
    });
    expect(snapshot.phase).toBe('on_the_way');
    expect(snapshot.destinationLocation).toEqual({
      latitude: 14.5995,
      longitude: 120.9842,
    });
    expect(snapshot.destinationAddress).toBe(
      '123 Test St, Manila, Philippines',
    );
  });

  it('uses stored tracking destination coordinates before address geocoding', async () => {
    const client = {
      getTrackingSnapshot: jest.fn().mockResolvedValue({
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        bookingReference: 'SE-ABC123',
        status: 'in_progress',
        phase: 'on_the_way',
        etaMinutes: 18,
        distanceKm: 5.2,
        trafficLevel: 'moderate',
        destinationAddress: '123 Test St',
        destinationLocation: {
          latitude: 14.554729,
          longitude: 121.024445,
        },
        providerLocation: null,
        scheduledAt: '2026-07-20T08:00:00.000Z',
        lastUpdatedAt: '2026-05-16T00:00:00.000Z',
      }),
    } as unknown as BookingServiceClient;
    const geoClient = {
      geocodeAddress: jest.fn(),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      geoClient as unknown as GeoServiceClient,
    );

    const snapshot = await service.getTrackingSnapshot(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      null,
    );

    expect(geoClient.geocodeAddress).not.toHaveBeenCalled();
    expect(snapshot.destinationLocation).toEqual({
      latitude: 14.554729,
      longitude: 121.024445,
    });
    expect(snapshot.destinationAddress).toBe('123 Test St');
  });

  it('streams booking tracking snapshots over the gateway cadence', async () => {
    const client = {
      getTrackingSnapshot: jest.fn().mockResolvedValue({
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        bookingReference: 'SE-ABC123',
        status: 'in_progress',
        phase: 'on_the_way',
        etaMinutes: 18,
        distanceKm: 5.2,
        trafficLevel: 'moderate',
        destinationAddress: '123 Test St',
        destinationLocation: {
          latitude: 14.5995,
          longitude: 120.9842,
        },
        providerLocation: {
          latitude: 14.6,
          longitude: 120.99,
          updatedAt: '2026-05-16T00:00:05.000Z',
        },
        scheduledAt: '2026-07-20T08:00:00.000Z',
        lastUpdatedAt: '2026-05-16T00:00:05.000Z',
      }),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const snapshot = await firstValueFrom(
      service.streamTrackingSnapshots(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        null,
      ),
    );

    expect(client.getTrackingSnapshot).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      null,
    );
    expect(snapshot.providerLocation).toEqual({
      latitude: 14.6,
      longitude: 120.99,
      updatedAt: '2026-05-16T00:00:05.000Z',
    });
  });

  it('forwards provider live location updates to booking-service', async () => {
    const client = {
      updateLiveLocation: jest.fn().mockResolvedValue({
        latitude: 14.5995,
        longitude: 120.9842,
        updatedAt: '2026-05-16T00:00:05.000Z',
      }),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.updateLiveLocation(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        {
          latitude: 14.5995,
          longitude: 120.9842,
          accuracyMeters: 8,
        },
      ),
    ).resolves.toEqual({
      latitude: 14.5995,
      longitude: 120.9842,
      updatedAt: '2026-05-16T00:00:05.000Z',
    });
    expect(client.updateLiveLocation).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      {
        latitude: 14.5995,
        longitude: 120.9842,
        accuracyMeters: 8,
      },
    );
  });

  it('rejects provider-only transitions from the booking customer', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(createBookingSummary()),
      transitionStatus: jest.fn(),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.transitionStatus(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
        null,
        'pending',
        'confirmed',
      ),
    ).rejects.toBeInstanceOf(InvalidBookingTransitionError);

    expect(client.findBooking).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      null,
    );
    expect(client.transitionStatus).not.toHaveBeenCalled();
  });

  it('allows assigned providers to confirm pending bookings', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(createBookingSummary()),
      listBookings: jest.fn().mockResolvedValue([]),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const booking = await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'pending',
      'confirmed',
    );

    expect(client.transitionStatus).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'pending',
      'confirmed',
      undefined,
      undefined,
    );
    expect(booking.status).toBe('confirmed');
  });

  it('blocks providers from accepting another booking while on the way', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          id: 'pending-booking-1',
          status: 'pending',
        }),
      ),
      listBookings: jest.fn().mockResolvedValue([
        createBookingSummary({
          id: 'active-booking-1',
          status: 'in_progress',
        }),
      ]),
      transitionStatus: jest.fn(),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.transitionStatus(
        'pending-booking-1',
        'provider-user-1',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        'pending',
        'confirmed',
      ),
    ).rejects.toBeInstanceOf(InvalidBookingTransitionError);

    expect(client.listBookings).toHaveBeenCalledWith(
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(client.transitionStatus).not.toHaveBeenCalled();
  });

  it('allows providers to complete the booking that is already on the way', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          id: 'active-booking-1',
          status: 'in_progress',
        }),
      ),
      listBookings: jest.fn(),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          id: 'active-booking-1',
          status: 'completed',
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const booking = await service.transitionStatus(
      'active-booking-1',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'in_progress',
      'completed',
    );

    expect(client.listBookings).not.toHaveBeenCalled();
    expect(client.transitionStatus).toHaveBeenCalledWith(
      'active-booking-1',
      'provider-user-1',
      'in_progress',
      'completed',
      undefined,
      undefined,
    );
    expect(booking.status).toBe('completed');
  });

  it('marks cash-on-service payment paid when the provider completes the booking', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'in_progress',
        }),
      ),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'completed',
        }),
      ),
    } as unknown as BookingServiceClient;
    const paymentGatewayService = {
      listPayments: jest.fn().mockResolvedValue([
        {
          id: 'payment-1',
          bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          paymentMethod: 'cash_on_service',
          status: 'pending',
        },
      ]),
      confirmCashOnServicePayment: jest.fn().mockResolvedValue({
        id: 'payment-1',
        status: 'paid',
      }),
    } as unknown as PaymentGatewayService;
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      undefined,
      paymentGatewayService,
    );

    const booking = await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'in_progress',
      'completed',
    );

    expect(
      paymentGatewayService.confirmCashOnServicePayment,
    ).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(booking.status).toBe('completed');
  });

  it('uses the authoritative booking status when a stale client completes a started booking', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'in_progress',
        }),
      ),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'completed',
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const booking = await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'confirmed',
      'completed',
    );

    expect(client.transitionStatus).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'in_progress',
      'completed',
      undefined,
      undefined,
    );
    expect(booking.status).toBe('completed');
  });

  it('starts a confirmed booking before completing it from the provider completion action', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-20T07:31:00.000Z'));
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
        }),
      ),
      listBookings: jest.fn().mockResolvedValue([]),
      transitionStatus: jest
        .fn()
        .mockResolvedValueOnce(
          createBookingSummary({
            status: 'in_progress',
          }),
        )
        .mockResolvedValueOnce(
          createBookingSummary({
            status: 'completed',
          }),
        ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const booking = await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'confirmed',
      'completed',
    );

    expect(client.transitionStatus).toHaveBeenNthCalledWith(
      1,
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'confirmed',
      'in_progress',
      undefined,
      undefined,
    );
    expect(client.transitionStatus).toHaveBeenNthCalledWith(
      2,
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'in_progress',
      'completed',
      undefined,
      undefined,
    );
    expect(booking.status).toBe('completed');
  });

  it('allows providers to start a confirmed booking before the start window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-20T07:00:00.000Z'));
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
          scheduledAt: '2026-07-20T08:00:00.000Z',
        }),
      ),
      listBookings: jest.fn().mockResolvedValue([]),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'in_progress',
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.transitionStatus(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        'provider-user-1',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        'confirmed',
        'in_progress',
      ),
    ).resolves.toMatchObject({ status: 'in_progress' });

    expect(client.listBookings).toHaveBeenCalledWith(
      null,
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(client.transitionStatus).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'confirmed',
      'in_progress',
      undefined,
      undefined,
    );
  });

  it('allows providers to start a confirmed booking within the start window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-20T07:31:00.000Z'));
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
          scheduledAt: '2026-07-20T08:00:00.000Z',
        }),
      ),
      listBookings: jest.fn().mockResolvedValue([]),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'in_progress',
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.transitionStatus(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        'provider-user-1',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        'confirmed',
        'in_progress',
      ),
    ).resolves.toMatchObject({ status: 'in_progress' });

    expect(client.transitionStatus).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'confirmed',
      'in_progress',
      undefined,
      undefined,
    );
  });

  it('blocks confirmed booking auto-complete before the start window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-20T07:00:00.000Z'));
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
          scheduledAt: '2026-07-20T08:00:00.000Z',
        }),
      ),
      listBookings: jest.fn(),
      transitionStatus: jest.fn(),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    await expect(
      service.transitionStatus(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        'provider-user-1',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        'confirmed',
        'completed',
      ),
    ).rejects.toBeInstanceOf(BookingStartWindowNotOpenError);

    expect(client.transitionStatus).not.toHaveBeenCalled();
  });

  it('returns an already completed booking when completion is retried', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'completed',
        }),
      ),
      transitionStatus: jest.fn(),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const booking = await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'in_progress',
      'completed',
    );

    expect(client.transitionStatus).not.toHaveBeenCalled();
    expect(booking.status).toBe('completed');
  });

  it('rejects completing an online-payment booking until the payment is paid', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'in_progress',
        }),
      ),
      transitionStatus: jest.fn(),
    } as unknown as BookingServiceClient;
    const paymentGatewayService = {
      listPayments: jest.fn().mockResolvedValue([
        {
          id: 'payment-1',
          bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
          paymentMethod: 'gcash',
          status: 'pending',
        },
      ]),
    } as unknown as PaymentGatewayService;
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      undefined,
      undefined,
      undefined,
      paymentGatewayService,
    );

    await expect(
      service.transitionStatus(
        '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        'provider-user-1',
        'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        'in_progress',
        'completed',
      ),
    ).rejects.toBeInstanceOf(InvalidBookingTransitionError);

    expect(client.transitionStatus).not.toHaveBeenCalled();
  });

  it('creates a customer notification when a provider changes booking status', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(createBookingSummary()),
      listBookings: jest.fn().mockResolvedValue([]),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
        }),
      ),
    } as unknown as BookingServiceClient;
    const notificationClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      notificationClient as unknown as NotificationServiceClient,
      {
        findProviderBusinessNameByProviderId: jest
          .fn()
          .mockResolvedValue('GreenFix Home Services'),
        findProviderOwnerByProviderId: jest.fn(),
      } as unknown as CatalogServiceClient,
    );

    await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'provider-user-1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      'pending',
      'confirmed',
    );

    expect(notificationClient.createNotification).toHaveBeenCalledWith({
      userId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      type: 'booking_status_updated',
      title: 'Booking confirmed',
      body: 'Your Deep Clean booking was confirmed.',
      metadata: {
        bookingId: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
        bookingReference: 'SE-ABC123',
        status: 'confirmed',
      },
    });
  });

  it('allows customers to cancel their own cancellable bookings', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'confirmed',
        }),
      ),
      transitionStatus: jest.fn().mockResolvedValue(
        createBookingSummary({
          status: 'cancelled',
        }),
      ),
    } as unknown as BookingServiceClient;
    const service = new BookingGatewayService(client, createAuthClient());

    const booking = await service.transitionStatus(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      null,
      'confirmed',
      'cancelled',
    );

    expect(client.transitionStatus).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'confirmed',
      'cancelled',
      undefined,
      undefined,
    );
    expect(booking.status).toBe('cancelled');
  });
});

function createAuthClient(): AuthServiceClient {
  return {
    findUserById: jest.fn().mockResolvedValue({
      id: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      email: 'customer@example.test',
      fullName: 'Casey Customer',
      contactNumber: '+639170001001',
      role: 'customer',
      status: 'active',
    }),
  } as unknown as AuthServiceClient;
}

function createBookingSummary(overrides = {}) {
  return {
    id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
    bookingReference: 'SE-ABC123',
    customerId: '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
    providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    serviceId: 'service-1',
    serviceTitle: 'Deep Clean',
    serviceAddress: '123 Test St',
    serviceLatitude: null,
    serviceLongitude: null,
    scheduledAt: '2026-07-20T08:00:00.000Z',
    status: 'pending',
    totalAmount: 1200,
    attachments: [],
    ...overrides,
  };
}
