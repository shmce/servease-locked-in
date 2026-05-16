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
        providerLocation: null,
      }),
    );
    expect(snapshot.etaMinutes).toBeGreaterThanOrEqual(8);
    expect(snapshot.distanceKm).toBeGreaterThanOrEqual(2.5);
  });
});
