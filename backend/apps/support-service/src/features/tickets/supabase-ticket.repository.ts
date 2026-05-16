import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { SupportTicketNotFoundError } from './ticket.errors';
import {
  CreateSupportTicketInput,
  SupportTicketAttachmentSummary,
  SupportTicketReplySummary,
  SupportTicketStatus,
  SupportTicketSummary,
} from './ticket.types';

interface SupabaseRpcClient {
  rpc(
    functionName: string,
    args: Record<string, unknown>,
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
  assignee_id?: string | null;
  created_at: string | null;
  attachments?: unknown;
}

interface TicketReplyRow {
  id: string;
  ticket_id: string;
  replied_by: string;
  message: string;
  created_at: string | null;
}

interface TicketAttachmentRow {
  id: string;
  ticket_id?: string;
  ticketId?: string;
  uploaded_by?: string | null;
  uploadedBy?: string | null;
  file_url?: string;
  fileUrl?: string;
  file_name?: string | null;
  fileName?: string | null;
  mime_type?: string | null;
  mimeType?: string | null;
  storage_path?: string | null;
  storagePath?: string | null;
  file_size?: number | null;
  fileSize?: number | null;
  created_at?: string | null;
  createdAt?: string | null;
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
        p_attachments: input.attachments ?? [],
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

  async getTicket(userId: string, ticketId: string): Promise<SupportTicketSummary> {
    const { data, error } = await this.client
      .rpc('servease_get_support_ticket', {
        p_user_id: userId,
        p_ticket_id: ticketId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get support ticket: ${error.message}`);
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

  async adminGetTicket(ticketId: string): Promise<SupportTicketSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_get_support_ticket', {
        p_ticket_id: ticketId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get admin support ticket: ${error.message}`);
    }

    if (!data) {
      throw new SupportTicketNotFoundError();
    }

    return this.mapTicket(data);
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

  async addReply(
    ticketId: string,
    repliedBy: string,
    message: string,
  ): Promise<SupportTicketReplySummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_add_ticket_reply', {
        p_ticket_id: ticketId,
        p_replied_by: repliedBy,
        p_message: message,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to add ticket reply: ${error.message}`);
    }

    if (!data) {
      throw new SupportTicketNotFoundError();
    }

    const row = data as unknown as TicketReplyRow;
    return {
      id: row.id,
      ticketId: row.ticket_id,
      repliedBy: row.replied_by,
      message: row.message,
      createdAt: row.created_at,
    };
  }

  async listReplies(ticketId: string): Promise<SupportTicketReplySummary[]> {
    const { data, error } = await this.client.rpc('servease_admin_list_ticket_replies', {
      p_ticket_id: ticketId,
    });

    if (error) {
      throw new Error(`Failed to list ticket replies: ${error.message}`);
    }

    return ((data ?? []) as unknown as TicketReplyRow[]).map((row) => ({
      id: row.id,
      ticketId: row.ticket_id,
      repliedBy: row.replied_by,
      message: row.message,
      createdAt: row.created_at,
    }));
  }

  async assignTicket(ticketId: string, assigneeId: string | null): Promise<SupportTicketSummary> {
    const { data, error } = await this.client
      .rpc('servease_admin_assign_ticket', {
        p_ticket_id: ticketId,
        p_assignee_id: assigneeId,
      })
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to assign ticket: ${error.message}`);
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
      assigneeId: row.assignee_id ?? null,
      createdAt: row.created_at,
      attachments: this.mapAttachments(row.attachments),
    };
  }

  private mapAttachments(value: unknown): SupportTicketAttachmentSummary[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.mapAttachment(item as TicketAttachmentRow));
  }

  private mapAttachment(row: TicketAttachmentRow): SupportTicketAttachmentSummary {
    return {
      id: row.id,
      ticketId: row.ticket_id ?? row.ticketId ?? '',
      uploadedBy: row.uploaded_by ?? row.uploadedBy ?? null,
      fileUrl: row.file_url ?? row.fileUrl ?? '',
      fileName: row.file_name ?? row.fileName ?? null,
      mimeType: row.mime_type ?? row.mimeType ?? null,
      storagePath: row.storage_path ?? row.storagePath ?? null,
      fileSize: row.file_size ?? row.fileSize ?? null,
      createdAt: row.created_at ?? row.createdAt ?? null,
    };
  }
}
