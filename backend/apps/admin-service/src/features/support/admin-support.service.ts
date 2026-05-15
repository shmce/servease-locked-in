import { Injectable } from '@nestjs/common';
import { SupportTicketSummary } from './admin-support.types';
import { SupportServiceClient } from './clients/support-service.client';

@Injectable()
export class AdminSupportService {
  constructor(private readonly supportServiceClient: SupportServiceClient) {}

  listTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    return this.supportServiceClient.listTickets(status ?? null);
  }

  updateTicketStatus(
    ticketId: string,
    status: string,
  ): Promise<SupportTicketSummary> {
    return this.supportServiceClient.updateTicketStatus(ticketId, status);
  }
}
