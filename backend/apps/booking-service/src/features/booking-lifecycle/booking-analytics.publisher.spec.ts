import { createApicenterClient } from '@servease/common';
import { BookingAnalyticsPublisher } from './booking-analytics.publisher';
import { BookingSummary } from './booking.types';

jest.mock('@servease/common', () => ({
  createApicenterClient: jest.fn(),
}));

const mockCreateApicenterClient = createApicenterClient as jest.Mock;

describe('BookingAnalyticsPublisher', () => {
  const booking: BookingSummary = {
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
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-22T12:00:00.000Z'));
    mockCreateApicenterClient.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('publishes booking.completed with the approved North Star payload shape', async () => {
    const publishTribeEvent = jest.fn().mockResolvedValue({ accepted: true });
    mockCreateApicenterClient.mockReturnValue({ publishTribeEvent });
    const expectedSourceServiceId =
      process.env.APICENTER_SERVICE_ID?.trim() || 'servease-booking';

    await new BookingAnalyticsPublisher().publishBookingCompleted(booking);

    expect(mockCreateApicenterClient).toHaveBeenCalledWith({
      ...process.env,
      APICENTER_SERVICE_ID: expectedSourceServiceId,
    });
    expect(publishTribeEvent).toHaveBeenCalledWith({
      key: 'booking-1',
      eventType: 'booking.completed',
      sourceServiceId: expectedSourceServiceId,
      payload: {
        bookingId: 'booking-1',
        bookingRef: 'SE-123',
        customerRef: 'customer-1',
        providerRef: 'provider-1',
        serviceId: 'service-1',
        serviceTitle: 'Deep Clean',
        status: 'completed',
        amountMinor: 120000,
        currency: 'PHP',
        scheduledAt: '2026-05-20T08:00:00.000Z',
        completedAt: '2026-05-22T12:00:00.000Z',
        occurredAt: '2026-05-22T12:00:00.000Z',
        northStarQuestion:
          'How many completed bookings did ServEase produce, with what completed booking value, by day/category/provider?',
        downstreamMetric: 'booking_completion_daily',
        schemaVersion: '1',
      },
      metadata: {
        schemaVersion: '1',
        classification: 'internal',
        metricIntent: 'booking_completion_daily',
      },
    });
  });
});
