import { Injectable } from '@nestjs/common';
import { SupportTicketReplySummary, SupportTicketSummary } from './admin-support.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminSupportGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  getSupportTicket(ticketId: string): Promise<SupportTicketSummary> {
    return this.adminServiceClient.getSupportTicket(ticketId);
  }

  listSupportTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    return this.adminServiceClient.listSupportTickets(status ?? null);
  }

  updateTicketStatus(ticketId: string, status: string): Promise<SupportTicketSummary> {
    return this.adminServiceClient.updateTicketStatus(ticketId, status);
  }

  listReplies(ticketId: string): Promise<SupportTicketReplySummary[]> {
    return this.adminServiceClient.listSupportTicketReplies(ticketId);
  }

  addReply(ticketId: string, repliedBy: string, message: string): Promise<SupportTicketReplySummary> {
    return this.adminServiceClient.addSupportTicketReply(ticketId, repliedBy, message);
  }

  assignTicket(ticketId: string, assigneeId: string | null): Promise<SupportTicketSummary> {
    return this.adminServiceClient.assignSupportTicket(ticketId, assigneeId);
  }
}
