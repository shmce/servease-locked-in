import { Injectable } from '@nestjs/common';
import { AdminDisputeSummary } from './admin-dispute.types';
import { BookingServiceClient } from './clients/booking-service.client';

@Injectable()
export class AdminDisputeService {
  constructor(private readonly bookingServiceClient: BookingServiceClient) {}

  listDisputes(status?: string | null): Promise<AdminDisputeSummary[]> {
    return this.bookingServiceClient.listDisputes(status ?? null);
  }

  getDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.bookingServiceClient.getDispute(disputeId);
  }

  resolveDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.bookingServiceClient.resolveDispute(disputeId);
  }
}
