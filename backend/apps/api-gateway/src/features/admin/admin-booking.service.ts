import { Injectable } from '@nestjs/common';
import { AuthServiceClient } from '../current-user/clients/auth-service.client';
import { CurrentUserIdentity } from '../current-user/current-user.types';
import {
  AdminBookingMessage,
  AdminBookingSummary,
  AdminBookingsSummaryStats,
  AdminOperationsAlerts,
  AppendAdminBookingMessageRequest,
  CancelAdminBookingRequest,
  EscalateAdminBookingRequest,
  ListAdminBookingsFilter,
} from './admin-booking.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminBookingGatewayService {
  constructor(
    private readonly adminServiceClient: AdminServiceClient,
    private readonly authServiceClient: AuthServiceClient,
  ) {}

  getOperationsAlerts(): Promise<AdminOperationsAlerts> {
    return this.adminServiceClient.getOperationsAlerts();
  }

  getBookingsSummary(): Promise<AdminBookingsSummaryStats> {
    return this.adminServiceClient.getBookingsSummary();
  }

  async listBookings(
    filter: ListAdminBookingsFilter,
  ): Promise<AdminBookingSummary[]> {
    return this.enrichBookings(await this.adminServiceClient.listBookings(filter));
  }

  async getBooking(bookingId: string): Promise<AdminBookingSummary> {
    return this.enrichBooking(await this.adminServiceClient.getBooking(bookingId));
  }

  async cancelBooking(
    bookingId: string,
    adminUserId: string,
    input: CancelAdminBookingRequest,
  ): Promise<AdminBookingSummary> {
    return this.enrichBooking(
      await this.adminServiceClient.cancelBooking(bookingId, {
        ...input,
        adminUserId,
      }),
    );
  }

  async escalateBooking(
    bookingId: string,
    adminUserId: string,
    input: EscalateAdminBookingRequest,
  ): Promise<AdminBookingSummary> {
    return this.enrichBooking(
      await this.adminServiceClient.escalateBooking(bookingId, {
        ...input,
        adminUserId,
      }),
    );
  }

  listMessages(bookingId: string): Promise<AdminBookingMessage[]> {
    return this.adminServiceClient.listBookingMessages(bookingId);
  }

  appendMessage(
    bookingId: string,
    input: AppendAdminBookingMessageRequest,
  ): Promise<AdminBookingMessage> {
    return this.adminServiceClient.appendBookingMessage(bookingId, input);
  }

  private async enrichBookings(
    bookings: AdminBookingSummary[],
  ): Promise<AdminBookingSummary[]> {
    const customerCache = new Map<string, Promise<CurrentUserIdentity>>();
    return Promise.all(
      bookings.map((booking) => this.enrichBooking(booking, customerCache)),
    );
  }

  private async enrichBooking(
    booking: AdminBookingSummary,
    customerCache = new Map<string, Promise<CurrentUserIdentity>>(),
  ): Promise<AdminBookingSummary> {
    let customer = customerCache.get(booking.customerId);

    if (!customer) {
      customer = this.authServiceClient.findUserById(booking.customerId);
      customerCache.set(booking.customerId, customer);
    }

    try {
      const customerIdentity = await customer;
      return {
        ...booking,
        customerFullName: customerIdentity.fullName,
        customerContactNumber: customerIdentity.contactNumber,
      };
    } catch {
      return {
        ...booking,
        customerFullName: null,
        customerContactNumber: null,
      };
    }
  }
}
