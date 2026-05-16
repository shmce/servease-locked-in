import { Injectable } from '@nestjs/common';
import { InvalidSupportTicketRequestError } from './ticket.errors';
import {
  CreateSupportTicketInput,
  SupportTicketReplySummary,
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
    if (
      !input.userId ||
      !subject ||
      input.attachments?.some((attachment) => !attachment.fileUrl?.trim())
    ) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.createTicket({
      userId: input.userId,
      subject,
      message: input.message?.trim() || null,
      category: input.category?.trim() || null,
      attachments: input.attachments ?? [],
    });
  }

  async getTicket(userId: string, ticketId: string): Promise<SupportTicketSummary> {
    if (!userId || !ticketId) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.getTicket(userId, ticketId);
  }

  async listTickets(userId: string): Promise<SupportTicketSummary[]> {
    if (!userId) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.listTickets(userId);
  }

  async listReplies(
    userId: string,
    ticketId: string,
  ): Promise<SupportTicketReplySummary[]> {
    if (!userId || !ticketId) {
      throw new InvalidSupportTicketRequestError();
    }

    await this.ticketRepository.getTicket(userId, ticketId);
    return this.ticketRepository.listReplies(ticketId);
  }

  async addReply(
    userId: string,
    ticketId: string,
    message: string,
  ): Promise<SupportTicketReplySummary> {
    const trimmed = message?.trim() ?? '';
    if (!userId || !ticketId || !trimmed) {
      throw new InvalidSupportTicketRequestError();
    }

    await this.ticketRepository.getTicket(userId, ticketId);
    return this.ticketRepository.addReply(ticketId, userId, trimmed);
  }
}
