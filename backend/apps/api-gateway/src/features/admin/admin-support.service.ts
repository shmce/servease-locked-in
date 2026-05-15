import { Injectable } from '@nestjs/common';
import { SupportTicketSummary } from './admin-support.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminSupportGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listSupportTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    return this.adminServiceClient.listSupportTickets(status ?? null);
  }

  updateTicketStatus(
    ticketId: string,
    status: string,
  ): Promise<SupportTicketSummary> {
    return this.adminServiceClient.updateTicketStatus(ticketId, status);
  }
}
