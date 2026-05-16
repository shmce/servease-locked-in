import { Injectable } from '@nestjs/common';
import { AdminDisputeSummary } from './admin-dispute.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminDisputeGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listDisputes(status?: string | null): Promise<AdminDisputeSummary[]> {
    return this.adminServiceClient.listDisputes(status ?? null);
  }

  getDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.adminServiceClient.getDispute(disputeId);
  }

  resolveDispute(disputeId: string): Promise<AdminDisputeSummary> {
    return this.adminServiceClient.resolveDispute(disputeId);
  }
}
