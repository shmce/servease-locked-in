import { BookingLifecycleService } from './booking-lifecycle.service';
import { SupabaseBookingRepository } from './supabase-booking.repository';

describe('BookingLifecycleService', () => {
  it('derives a tracking snapshot for a visible in-progress booking', async () => {
    const repository = {
      findVisibleBooking: jest.fn().mockResolvedValue({
        id: 'booking-1',
        bookingReference: 'SE-123',
        customerId: 'customer-1',
        providerId: 'provider-1',
        serviceId: 'service-1',
        serviceTitle: 'Deep Clean',
        serviceAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
        status: 'in_progress',
        totalAmount: 1200,
        attachments: [],
      }),
      getLiveLocation: jest.fn().mockResolvedValue({
        latitude: 14.5995,
        longitude: 120.9842,
        accuracyMeters: 8,
        headingDegrees: 90,
        speedMps: 4,
        updatedAt: '2026-05-16T00:00:05.000Z',
      }),
    } as unknown as SupabaseBookingRepository;
    const service = new BookingLifecycleService(repository);

    const snapshot = await service.getTrackingSnapshot(
      'booking-1',
      'customer-1',
      null,
    );

    expect(repository.findVisibleBooking).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(snapshot).toEqual(
      expect.objectContaining({
        bookingId: 'booking-1',
        bookingReference: 'SE-123',
        status: 'in_progress',
        phase: 'on_the_way',
        destinationAddress: '123 Test St',
        scheduledAt: '2026-05-20T08:00:00.000Z',
        providerLocation: {
          latitude: 14.5995,
          longitude: 120.9842,
          accuracyMeters: 8,
          headingDegrees: 90,
          speedMps: 4,
          updatedAt: '2026-05-16T00:00:05.000Z',
        },
        lastUpdatedAt: '2026-05-16T00:00:05.000Z',
      }),
    );
    expect(repository.getLiveLocation).toHaveBeenCalledWith(
      'booking-1',
      'customer-1',
      null,
    );
    expect(snapshot.etaMinutes).toBeGreaterThanOrEqual(8);
    expect(snapshot.distanceKm).toBeGreaterThanOrEqual(2.5);
  });

  it('validates and forwards provider live location updates', async () => {
    const repository = {
      upsertLiveLocation: jest.fn().mockResolvedValue({
        latitude: 14.5995,
        longitude: 120.9842,
        updatedAt: '2026-05-16T00:00:05.000Z',
      }),
    } as unknown as SupabaseBookingRepository;
    const service = new BookingLifecycleService(repository);

    await expect(
      service.updateLiveLocation({
        bookingId: 'booking-1',
        providerId: 'provider-1',
        latitude: 14.5995,
        longitude: 120.9842,
        accuracyMeters: 8,
        headingDegrees: 90,
        speedMps: 4,
      }),
    ).resolves.toEqual({
      latitude: 14.5995,
      longitude: 120.9842,
      updatedAt: '2026-05-16T00:00:05.000Z',
    });
    expect(repository.upsertLiveLocation).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      providerId: 'provider-1',
      latitude: 14.5995,
      longitude: 120.9842,
      accuracyMeters: 8,
      headingDegrees: 90,
      speedMps: 4,
    });
  });
});
