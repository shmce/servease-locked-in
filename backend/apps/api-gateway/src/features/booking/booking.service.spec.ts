import { BookingGatewayService } from './booking.service';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { InvalidBookingTransitionError } from './booking.errors';
import { NotificationServiceClient } from '../notifications/clients/notification-service.client';
import { CatalogServiceClient } from '../current-user/clients/catalog-service.client';
import { GeoServiceClient } from '../geo/clients/geo-service.client';
import { PaymentGatewayService } from '../payments/payment.service';
import { firstValueFrom } from 'rxjs';

describe('BookingGatewayService', () => {
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
      findProviderBusinessNameByProviderId: jest.fn().mockResolvedValue(
        'GreenFix Home Services',
      ),
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

    const booking = await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T08:00:00.000Z',
    });

    expect(client.createBooking).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      {
        providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
      },
    );
    expect(booking.customerFullName).toBe('Casey Customer');
    expect(booking.customerContactNumber).toBe('+639170001001');
    expect(booking.providerBusinessName).toBe('GreenFix Home Services');
  });

  it('creates a provider notification when a customer books a service', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(createBookingSummary()),
    } as unknown as BookingServiceClient;
    const notificationClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    };
    const catalogClient = {
      findProviderBusinessNameByProviderId: jest.fn().mockResolvedValue(
        'GreenFix Home Services',
      ),
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
      scheduledAt: '2026-05-20T08:00:00.000Z',
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
      createNotification: jest.fn().mockRejectedValue(new Error('notification down')),
    };
    const catalogClient = {
      findProviderBusinessNameByProviderId: jest.fn().mockResolvedValue(
        'GreenFix Home Services',
      ),
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
        scheduledAt: '2026-05-20T08:00:00.000Z',
      }),
    ).resolves.toMatchObject({
      id: '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      providerBusinessName: 'GreenFix Home Services',
    });
  });

  it('reserves a pending cash payment when a cash booking is created', async () => {
    const client = {
      createBooking: jest.fn().mockResolvedValue(createBookingSummary({
        totalAmount: 1200,
      })),
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
      undefined,
      paymentGatewayService,
    );

    await service.createBooking('8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1', {
      providerId: 'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
      serviceAddress: '123 Test St',
      scheduledAt: '2026-05-20T08:00:00.000Z',
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
      findProviderBusinessNameByProviderId: jest.fn().mockResolvedValue(
        'GreenFix Home Services',
      ),
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
    expect(catalogClient.findProviderBusinessNameByProviderId).toHaveBeenCalledTimes(1);
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
        scheduledAt: '2026-05-20T08:00:00.000Z',
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
    expect(snapshot.destinationAddress).toBe('123 Test St, Manila, Philippines');
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
        scheduledAt: '2026-05-20T08:00:00.000Z',
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
      transitionStatus: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'confirmed',
      })),
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

  it('marks cash-on-service payment paid when the provider completes the booking', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'in_progress',
      })),
      transitionStatus: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'completed',
      })),
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

    expect(paymentGatewayService.confirmCashOnServicePayment).toHaveBeenCalledWith(
      '0ec2c525-63e0-4a39-9f81-60b8585f45dc',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(booking.status).toBe('completed');
  });

  it('rejects completing an online-payment booking until the payment is paid', async () => {
    const client = {
      findBooking: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'in_progress',
      })),
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
      transitionStatus: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'confirmed',
      })),
    } as unknown as BookingServiceClient;
    const notificationClient = {
      createNotification: jest.fn().mockResolvedValue({ id: 'notification-1' }),
    };
    const service = new BookingGatewayService(
      client,
      createAuthClient(),
      notificationClient as unknown as NotificationServiceClient,
      {
        findProviderBusinessNameByProviderId: jest.fn().mockResolvedValue(
          'GreenFix Home Services',
        ),
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
      findBooking: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'confirmed',
      })),
      transitionStatus: jest.fn().mockResolvedValue(createBookingSummary({
        status: 'cancelled',
      })),
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
    scheduledAt: '2026-05-20T08:00:00.000Z',
    status: 'pending',
    totalAmount: 1200,
    attachments: [],
    ...overrides,
  };
}
