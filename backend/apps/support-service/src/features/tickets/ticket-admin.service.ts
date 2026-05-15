import { Injectable } from '@nestjs/common';
import { InvalidSupportTicketRequestError } from './ticket.errors';
import { SupportTicketStatus, SupportTicketSummary } from './ticket.types';
import { SupabaseSupportTicketRepository } from './supabase-ticket.repository';

const validStatuses = new Set(['open', 'in_progress', 'resolved', 'closed']);

@Injectable()
export class SupportTicketAdminService {
  constructor(private readonly ticketRepository: SupabaseSupportTicketRepository) {}

  async listTickets(
    status?: string | null,
  ): Promise<SupportTicketSummary[]> {
    if (status && !validStatuses.has(status)) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.listAllTickets(
      (status as SupportTicketStatus | undefined) ?? null,
    );
  }

  async updateTicketStatus(
    ticketId: string,
    status: string,
  ): Promise<SupportTicketSummary> {
    if (!ticketId || !validStatuses.has(status)) {
      throw new InvalidSupportTicketRequestError();
    }

    return this.ticketRepository.updateTicketStatus(
      ticketId,
      status as SupportTicketStatus,
    );
  }
}
