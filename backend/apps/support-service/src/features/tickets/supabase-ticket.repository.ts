import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { SupportTicketNotFoundError } from './ticket.errors';
import {
  CreateSupportTicketInput,
  SupportTicketStatus,
  SupportTicketSummary,
} from './ticket.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, string | null>,
  ): PromiseLike<{
    data: TicketRow[] | null;
    error: { message: string; code?: string } | null;
  }> & {
    maybeSingle(): PromiseLike<{
      data: TicketRow | null;
      error: { message: string; code?: string } | null;
    }>;
  };
}

interface TicketRow {
  id: string;
  user_id: string;
  subject: string;
  message: string | null;
  category: string | null;
  status: SupportTicketStatus;
  created_at: string | null;
}

@Injectable()
export class SupabaseSupportTicketRepository {
  private readonly client: SupabaseRpcClient;

  constructor(@Optional() client?: SupabaseRpcClient) {
    this.client =
      client ?? (createSupabaseServiceClient() as unknown as SupabaseRpcClient);
  }

  async createTicket(
    input: CreateSupportTicketInput,
  ): Promise<SupportTicketSummary> {
    const { data, error } = await this.client
      .rpc('servease_create_support_ticket', {
        p_user_id: input.userId,
        p_subject: input.subject,
        p_message: input.message ?? null,
        p_category: input.category ?? null,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to create support ticket: ${error.message}`);
    }

    if (!data) {
      throw new SupportTicketNotFoundError();
    }

    return this.mapTicket(data);
  }

  async listTickets(userId: string): Promise<SupportTicketSummary[]> {
    const { data, error } = await this.client.rpc('servease_list_support_tickets', {
      p_user_id: userId,
    });

    if (error) {
      throw new Error(`Failed to list support tickets: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapTicket(row));
  }

  async listAllTickets(
    status: SupportTicketStatus | null,
  ): Promise<SupportTicketSummary[]> {
    const { data, error } = await this.client.rpc(
      'servease_admin_list_support_tickets',
      {
        p_status: status,
      },
    );

    if (error) {
      throw new Error(`Failed to list admin support tickets: ${error.message}`);
    }

    return (data ?? []).map((row) => this.mapTicket(row));
  }

  async updateTicketStatus(
    ticketId: string,
    status: SupportTicketStatus,
  ): Promise<SupportTicketSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_update_support_ticket_status', {
        p_ticket_id: ticketId,
        p_status: status,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update support ticket: ${error.message}`);
    }

    if (!data) {
      throw new SupportTicketNotFoundError();
    }

    return this.mapTicket(data);
  }

  private mapTicket(row: TicketRow): SupportTicketSummary {
    return {
      id: row.id,
      userId: row.user_id,
      subject: row.subject,
      message: row.message,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
