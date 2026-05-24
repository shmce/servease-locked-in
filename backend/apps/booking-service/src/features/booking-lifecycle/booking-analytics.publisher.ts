import { Injectable } from '@nestjs/common';
import { createApicenterClient } from '@servease/common';
import { BookingSummary } from './booking.types';

const BOOKING_COMPLETED_SCHEMA_VERSION = '1';
const BOOKING_COMPLETION_METRIC = 'booking_completion_daily';
const BOOKING_COMPLETION_NORTH_STAR_QUESTION =
  'How many completed bookings did ServEase produce, with what completed booking value, by day/category/provider?';
const DEFAULT_BOOKING_SOURCE_SERVICE_ID = 'servease-booking';

@Injectable()
export class BookingAnalyticsPublisher {
  async publishBookingCompleted(booking: BookingSummary): Promise<void> {
    const sourceServiceId =
      process.env.APICENTER_SERVICE_ID?.trim() || DEFAULT_BOOKING_SOURCE_SERVICE_ID;
    const occurredAt = new Date().toISOString();
    const client = createApicenterClient({
      ...process.env,
      APICENTER_SERVICE_ID: sourceServiceId,
    });

    await client.publishTribeEvent({
      key: booking.id,
      eventType: 'booking.completed',
      sourceServiceId,
      payload: {
        bookingId: booking.id,
        bookingRef: booking.bookingReference,
        customerRef: booking.customerId,
        providerRef: booking.providerId,
        serviceId: booking.serviceId,
        serviceTitle: booking.serviceTitle,
        status: booking.status,
        amountMinor: this.toMinorUnits(booking.totalAmount),
        currency: 'PHP',
        scheduledAt: booking.scheduledAt,
        completedAt: occurredAt,
        occurredAt,
        northStarQuestion: BOOKING_COMPLETION_NORTH_STAR_QUESTION,
        downstreamMetric: BOOKING_COMPLETION_METRIC,
        schemaVersion: BOOKING_COMPLETED_SCHEMA_VERSION,
      },
      metadata: {
        schemaVersion: BOOKING_COMPLETED_SCHEMA_VERSION,
        classification: 'internal',
        metricIntent: BOOKING_COMPLETION_METRIC,
      },
    });
  }

  private toMinorUnits(amount: number): number {
    if (!Number.isFinite(amount)) {
      return 0;
    }

    return Math.round(amount * 100);
  }
}
