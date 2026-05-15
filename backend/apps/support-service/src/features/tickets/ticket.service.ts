import { Injectable } from '@nestjs/common';
import { InvalidSupportTicketRequestError } from './ticket.errors';
import {
  CreateSupportTicketInput,
  SupportTicketSummary,
} from './ticket.types';
import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

@Injectable()
export class SupportTicketService {
  constructor(private readonly ticketRepository: SupabaseSupportTicketRepository) {}

  async createTicket(
    input: CreateSupportTicketInput,
  ): Promise<SupportTicketSummary> {
    const subject = input.subject.trim();
    if (!input.userId || !subject) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.createTicket({
      userId: input.userId,
      subject,
      message: input.message?.trim() || null,
      category: input.category?.trim() || null,
    });
  }

  async listTickets(userId: string): Promise<SupportTicketSummary[]> {
    if (!userId) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.listTickets(userId);
  }
}
