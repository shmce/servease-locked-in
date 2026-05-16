import { BookingGatewayService } from './booking.service';
import { BookingServiceClient } from './clients/booking-service.client';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';

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
    const service = new BookingGatewayService(client, authClient);

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
    const service = new BookingGatewayService(client, authClient);

    const bookings = await service.listBookings(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );

    expect(client.listBookings).toHaveBeenCalledWith(
      '8e96e80a-faa5-4db2-a7c9-e02c40ec5ad1',
      'b60d73f9-a5f2-41bb-90c7-7272c6af8821',
    );
    expect(authClient.findUserById).toHaveBeenCalledTimes(1);
    expect(bookings).toEqual([
      expect.objectContaining({
        customerFullName: 'Casey Customer',
        customerContactNumber: '+639170001001',
      }),
      expect.objectContaining({
        customerFullName: 'Casey Customer',
        customerContactNumber: '+639170001001',
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
    const service = new BookingGatewayService(client, createAuthClient());

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
    expect(snapshot.phase).toBe('on_the_way');
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
