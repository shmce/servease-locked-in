import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupportTicketReplySummary, SupportTicketSummary } from '../admin-support.types';

@Injectable()
export class SupportServiceClient {
  constructor(private readonly configService: ConfigService) {}

  listTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<SupportTicketSummary[]>(
      `/internal/admin/support/tickets?${searchParams.toString()}`,
      'GET',
    );
  }

  getTicket(ticketId: string): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}`,
      'GET',
    );
  }

  updateTicketStatus(ticketId: string, status: string): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}/status`,
      'PATCH',
      { status },
    );
  }

  listReplies(ticketId: string): Promise<SupportTicketReplySummary[]> {
    return this.request<SupportTicketReplySummary[]>(
      `/internal/admin/support/tickets/${ticketId}/replies`,
      'GET',
    );
  }

  addReply(ticketId: string, repliedBy: string, message: string): Promise<SupportTicketReplySummary> {
    return this.request<SupportTicketReplySummary>(
      `/internal/admin/support/tickets/${ticketId}/replies`,
      'POST',
      { repliedBy, message },
    );
  }

  assignTicket(ticketId: string, assigneeId: string | null): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}/assignee`,
      'PATCH',
      { assigneeId },
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'PATCH' | 'POST',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'SUPPORT_SERVICE_URL',
      'http://localhost:8510',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('support_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
