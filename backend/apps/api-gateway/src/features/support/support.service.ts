import { Injectable } from '@nestjs/common';
import { SupportServiceClient } from './clients/support-service.client';
import {
  CreateSupportTicketRequest,
  SupportTicketSummary,
} from './support.types';

@Injectable()
export class SupportGatewayService {
  constructor(private readonly supportServiceClient: SupportServiceClient) {}

  createTicket(input: CreateSupportTicketRequest): Promise<SupportTicketSummary> {
    return this.supportServiceClient.createTicket(input);
  }

  listTickets(userId: string): Promise<SupportTicketSummary[]> {
    return this.supportServiceClient.listTickets(userId);
  }
}
