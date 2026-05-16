import { Injectable } from '@nestjs/common';
import { SupportServiceClient } from './clients/support-service.client';
import {
  CreateSupportTicketRequest,
  SupportTicketReplySummary,
  SupportTicketSummary,
} from './support.types';

@Injectable()
export class SupportGatewayService {
  constructor(private readonly supportServiceClient: SupportServiceClient) {}

  getTicket(userId: string, ticketId: string): Promise<SupportTicketSummary> {
    return this.supportServiceClient.getTicket(userId, ticketId);
  }

  createTicket(input: CreateSupportTicketRequest): Promise<SupportTicketSummary> {
    return this.supportServiceClient.createTicket(input);
  }

  listTickets(userId: string): Promise<SupportTicketSummary[]> {
    return this.supportServiceClient.listTickets(userId);
  }

  listReplies(
    userId: string,
    ticketId: string,
  ): Promise<SupportTicketReplySummary[]> {
    return this.supportServiceClient.listReplies(userId, ticketId);
  }

  addReply(
    userId: string,
    ticketId: string,
    message: string,
  ): Promise<SupportTicketReplySummary> {
    return this.supportServiceClient.addReply(userId, ticketId, message);
  }
}
