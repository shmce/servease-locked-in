import { BookingLifecycleService } from './booking-lifecycle.service';
import { BookingSummary } from './booking.types';
import { SupabaseBookingRepository } from './supabase-booking.repository';

describe('BookingLifecycleService', () => {
  const createService = (
    repository: SupabaseBookingRepository,
    analyticsPublisher?: { publishBookingCompleted: jest.Mock },
  ): BookingLifecycleService => {
    const ServiceConstructor = BookingLifecycleService as unknown as new (
      ...args: unknown[]
    ) => BookingLifecycleService;
    return new ServiceConstructor(repository, analyticsPublisher);
  };

  const createBookingSummary = (
    overrides: Partial<BookingSummary> = {},
  ): BookingSummary => ({
    id: 'booking-1',
    bookingReference: 'SE-123',
    customerId: 'customer-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    serviceTitle: 'Deep Clean',
    serviceDescription: null,
    serviceAddress: '123 Test St',
    scheduledAt: '2026-05-20T08:00:00.000Z',
    hoursRequired: null,
    serviceAmount: 1200,
    pricingMode: 'flat',
    acceptedQuoteId: null,
    quoteFairnessStatus: null,
    quoteConfidence: null,
    customerNotes: null,
    status: 'completed',
    totalAmount: 1200,
    attachments: [],
    ...overrides,
  });

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

  it('publishes a booking.completed analytics event after a completed transition succeeds', async () => {
    const completedBooking = createBookingSummary();
    const repository = {
      transitionStatus: jest.fn().mockResolvedValue(completedBooking),
    } as unknown as SupabaseBookingRepository;
    const analyticsPublisher = {
      publishBookingCompleted: jest.fn().mockResolvedValue(undefined),
    };
    const service = createService(repository, analyticsPublisher);

    await expect(
      service.transitionStatus(
        'booking-1',
        'provider-1',
        'in_progress',
        'completed',
      ),
    ).resolves.toBe(completedBooking);

    expect(repository.transitionStatus).toHaveBeenCalledWith(
      'booking-1',
      'provider-1',
      'completed',
      undefined,
      undefined,
    );
    expect(analyticsPublisher.publishBookingCompleted).toHaveBeenCalledWith(
      completedBooking,
    );
  });

  it('does not publish analytics for non-completed transitions', async () => {
    const confirmedBooking = createBookingSummary({ status: 'confirmed' });
    const repository = {
      transitionStatus: jest.fn().mockResolvedValue(confirmedBooking),
    } as unknown as SupabaseBookingRepository;
    const analyticsPublisher = {
      publishBookingCompleted: jest.fn().mockResolvedValue(undefined),
    };
    const service = createService(repository, analyticsPublisher);

    await expect(
      service.transitionStatus('booking-1', 'provider-1', 'pending', 'confirmed'),
    ).resolves.toBe(confirmedBooking);

    expect(analyticsPublisher.publishBookingCompleted).not.toHaveBeenCalled();
  });

  it('does not publish analytics when the completed transition fails', async () => {
    const repository = {
      transitionStatus: jest
        .fn()
        .mockRejectedValue(new Error('Failed to transition booking')),
    } as unknown as SupabaseBookingRepository;
    const analyticsPublisher = {
      publishBookingCompleted: jest.fn().mockResolvedValue(undefined),
    };
    const service = createService(repository, analyticsPublisher);

    await expect(
      service.transitionStatus(
        'booking-1',
        'provider-1',
        'in_progress',
        'completed',
      ),
    ).rejects.toThrow('Failed to transition booking');

    expect(analyticsPublisher.publishBookingCompleted).not.toHaveBeenCalled();
  });

  it('returns the completed booking when APICenter analytics publishing fails', async () => {
    const completedBooking = createBookingSummary();
    const repository = {
      transitionStatus: jest.fn().mockResolvedValue(completedBooking),
    } as unknown as SupabaseBookingRepository;
    const analyticsPublisher = {
      publishBookingCompleted: jest
        .fn()
        .mockRejectedValue(new Error('apicenter_unavailable')),
    };
    const service = createService(repository, analyticsPublisher);

    await expect(
      service.transitionStatus(
        'booking-1',
        'provider-1',
        'in_progress',
        'completed',
      ),
    ).resolves.toBe(completedBooking);
    expect(analyticsPublisher.publishBookingCompleted).toHaveBeenCalledWith(
      completedBooking,
    );
  });
});
