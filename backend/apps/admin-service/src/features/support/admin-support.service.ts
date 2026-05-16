import { Injectable } from '@nestjs/common';
import { SupportTicketReplySummary, SupportTicketSummary } from './admin-support.types';
import { SupportServiceClient } from './clients/support-service.client';

@Injectable()
export class AdminSupportService {
  constructor(private readonly supportServiceClient: SupportServiceClient) {}

  getTicket(ticketId: string): Promise<SupportTicketSummary> {
    return this.supportServiceClient.getTicket(ticketId);
  }

  listTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    return this.supportServiceClient.listTickets(status ?? null);
  }

  updateTicketStatus(ticketId: string, status: string): Promise<SupportTicketSummary> {
    return this.supportServiceClient.updateTicketStatus(ticketId, status);
  }

  listReplies(ticketId: string): Promise<SupportTicketReplySummary[]> {
    return this.supportServiceClient.listReplies(ticketId);
  }

  addReply(ticketId: string, repliedBy: string, message: string): Promise<SupportTicketReplySummary> {
    return this.supportServiceClient.addReply(ticketId, repliedBy, message);
  }

  assignTicket(ticketId: string, assigneeId: string | null): Promise<SupportTicketSummary> {
    return this.supportServiceClient.assignTicket(ticketId, assigneeId);
  }
}
