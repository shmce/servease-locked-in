import { Injectable, Optional } from '@nestjs/common';
import {
  AddProviderTimeOffWindowInput,
  AvailabilityWindowInput,
  ProviderBookedWindow,
  ProviderAvailabilitySchedule,
} from './availability.types';
import { AvailabilityServiceClient } from './clients/availability-service.client';
import { BookingServiceClient } from '../booking/clients/booking-service.client';
import { BookingSummary } from '../booking/booking.types';

@Injectable()
export class AvailabilityGatewayService {
  constructor(
    private readonly availabilityServiceClient: AvailabilityServiceClient,
    @Optional() private readonly bookingServiceClient?: BookingServiceClient,
  ) {}

  async getSchedule(providerId: string): Promise<ProviderAvailabilitySchedule> {
    const schedule = await this.availabilityServiceClient.getSchedule(providerId);
    if (!this.bookingServiceClient) {
      return {
        ...schedule,
        bookedWindows: schedule.bookedWindows ?? [],
      };
    }

    return {
      ...schedule,
      bookedWindows: this.toBookedWindows(
        await this.bookingServiceClient.listBookings(null, providerId),
      ),
    };
  }

  replaceWindows(
    providerId: string,
    windows: AvailabilityWindowInput[],
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.replaceWindows(providerId, windows);
  }

  addDayOff(
    providerId: string,
    offDate: string,
    reason?: string | null,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.addDayOff(providerId, offDate, reason);
  }

  removeDayOff(
    providerId: string,
    offDate: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.removeDayOff(providerId, offDate);
  }

  addTimeOffWindow(
    providerId: string,
    input: AddProviderTimeOffWindowInput,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.addTimeOffWindow(providerId, input);
  }

  removeTimeOffWindow(
    providerId: string,
    id: string,
  ): Promise<ProviderAvailabilitySchedule> {
    return this.availabilityServiceClient.removeTimeOffWindow(providerId, id);
  }

  private toBookedWindows(bookings: BookingSummary[]): ProviderBookedWindow[] {
    return bookings
      .filter(
        (
          booking,
        ): booking is BookingSummary & { status: ProviderBookedWindow['status'] } =>
          this.isBookedWindowStatus(booking.status),
      )
      .map((booking) => {
        const start = new Date(booking.scheduledAt);
        const durationHours = Math.max(1, Number(booking.hoursRequired ?? 1));
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        return {
          bookingId: booking.id,
          offDate: this.formatManilaDate(start),
          startTime: this.formatManilaTime(start),
          endTime: this.formatManilaTime(end),
          status: booking.status,
        };
      });
  }

  private isBookedWindowStatus(
    status: BookingSummary['status'],
  ): status is ProviderBookedWindow['status'] {
    return (
      status === 'pending' ||
      status === 'confirmed' ||
      status === 'in_progress'
    );
  }

  private formatManilaDate(value: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Manila',
      year: 'numeric',
    }).formatToParts(value);

    return `${this.part(parts, 'year')}-${this.part(parts, 'month')}-${this.part(
      parts,
      'day',
    )}`;
  }

  private formatManilaTime(value: Date): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    }).formatToParts(value);

    return `${this.part(parts, 'hour')}:${this.part(parts, 'minute')}`;
  }

  private part(parts: Intl.DateTimeFormatPart[], type: string): string {
    return parts.find((part) => part.type === type)?.value ?? '00';
  }
}
