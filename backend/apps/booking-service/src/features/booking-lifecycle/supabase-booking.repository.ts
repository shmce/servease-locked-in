import { Injectable } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import {
  BookingNotFoundError,
  InvalidBookingTransitionError,
  ProviderUnavailableError,
} from './booking.errors';
import {
  BookingStatus,
  BookingSummary,
  CreateBookingInput,
} from './booking.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | number | null>,
  ): PromiseLike<{
    data: BookingRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: BookingRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface BookingRow {
  id: string;
  booking_reference: string;
  customer_id: string;
  provider_id: string;
  service_id: string | null;
  service_title: string | null;
  service_address: string | null;
  scheduled_at: string;
  status: BookingStatus;
  total_amount: string | number | null;
}

@Injectable()
export class SupabaseBookingRepository {
  private readonly client: SupabaseRpcClient;

  constructor(client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createBooking(input: CreateBookingInput): Promise<BookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_booking', {
        p_customer_id: input.customerId,
        p_provider_id: input.providerId,
        p_service_id: input.serviceId ?? null,
        p_service_title: input.serviceTitle ?? null,
        p_service_name: input.serviceName ?? null,
        p_service_description: input.serviceDescription ?? null,
        p_service_address: input.serviceAddress,
        p_scheduled_at: input.scheduledAt,
        p_hours_required: input.hoursRequired ?? 1,
        p_service_amount: input.serviceAmount ?? 0,
        p_pricing_mode: input.pricingMode ?? 'flat',
        p_payment_method: input.paymentMethod ?? 'cash_on_service',
        p_customer_notes: input.customerNotes ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('provider_unavailable')) {
        throw new ProviderUnavailableError();
      }
      throw new Error(`Failed to create booking: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create booking: missing booking row');
    }

    return this.mapBooking(data);
  }

  async listVisibleBookings(
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_visible_bookings', {
      p_customer_id: customerId,
      p_provider_id: providerId,
    });

    if (error) {
      throw new Error(`Failed to list bookings: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapBooking(row));
  }

  async findVisibleBooking(
    bookingId: string,
    customerId: string | null,
    providerId: string | null,
  ): Promise<BookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_visible_booking', {
        p_booking_id: bookingId,
        p_customer_id: customerId,
        p_provider_id: providerId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapBooking(data);
  }

  async transitionStatus(
    bookingId: string,
    actorId: string,
    nextStatus: BookingStatus,
    reason?: string | null,
    explanation?: string | null,
  ): Promise<BookingSummary> {
    const { data, error } = await this.client
      .rpc('servease_transition_booking_status', {
        p_booking_id: bookingId,
        p_actor_id: actorId,
        p_next_status: nextStatus,
        p_reason: reason ?? null,
        p_explanation: explanation ?? null,
      })
      .maybeSingle();

    if (error) {
      if (error.message.includes('booking_not_found')) {
        throw new BookingNotFoundError();
      }
      if (error.message.includes('invalid_booking_transition')) {
        throw new InvalidBookingTransitionError();
      }
      throw new Error(`Failed to transition booking: ${error.message}`);
    }

    if (!data) {
      throw new BookingNotFoundError();
    }

    return this.mapBooking(data);
  }

  private mapBooking(row: BookingRow): BookingSummary {
    return {
      id: row.id,
      bookingReference: row.booking_reference,
      customerId: row.customer_id,
      providerId: row.provider_id,
      serviceId: row.service_id,
      serviceTitle: row.service_title,
      serviceAddress: row.service_address,
      scheduledAt: row.scheduled_at,
      status: row.status,
      totalAmount: Number(row.total_amount ?? 0),
    };
  }
}
