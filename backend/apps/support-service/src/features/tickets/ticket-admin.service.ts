import { Injectable } from '@nestjs/common';
import { InvalidSupportTicketRequestError } from './ticket.errors';
import {
  SupportTicketReplySummary,
  SupportTicketStatus,
  SupportTicketSummary,
} from './ticket.types';
import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

const validStatuses = new Set(['open', 'in_progress', 'resolved', 'closed']);

@Injectable()
export class SupportTicketAdminService {
  constructor(private readonly ticketRepository: SupabaseSupportTicketRepository) {}

  async getTicket(ticketId: string): Promise<SupportTicketSummary> {
    if (!ticketId) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.adminGetTicket(ticketId);
  }

  async listTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    if (status && !validStatuses.has(status)) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.listAllTickets(
      (status as SupportTicketStatus | undefined) ?? null,
    );
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<SupportTicketSummary> {
    if (!ticketId || !validStatuses.has(status)) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.updateTicketStatus(ticketId, status as SupportTicketStatus);
  }

  async addReply(
    ticketId: string,
    repliedBy: string,
    message: string,
  ): Promise<SupportTicketReplySummary> {
    if (!ticketId || !repliedBy || !message?.trim()) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.addReply(ticketId, repliedBy, message.trim());
  }

  async listReplies(ticketId: string): Promise<SupportTicketReplySummary[]> {
    if (!ticketId) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.listReplies(ticketId);
  }

  async assignTicket(ticketId: string, assigneeId: string | null): Promise<SupportTicketSummary> {
    if (!ticketId) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.assignTicket(ticketId, assigneeId);
  }
}
