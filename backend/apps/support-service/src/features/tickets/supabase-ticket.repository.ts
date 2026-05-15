import { Injectable, Optional } from '@nestjs/common';
import { createSupabaseServiceClient } from '../../../../../libs/common/src';
import { SupportTicketNotFoundError } from './ticket.errors';
import {
  CreateSupportTicketInput,
  SupportTicketAttachmentSummary,
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
  created_at: string | null;
  attachments?: unknown;
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
