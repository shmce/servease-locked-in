import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupportDependencyUnavailableError } from '../support.errors';
import {
  CreateSupportTicketRequest,
  SupportTicketSummary,
} from '../support.types';

@Injectable()
export class SupportServiceClient {
  constructor(private readonly configService: ConfigService) {}

  createTicket(input: CreateSupportTicketRequest): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      '/internal/support/tickets',
      'POST',
      input,
    );
  }

  getTicket(userId: string, ticketId: string): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/support/tickets/${encodeURIComponent(ticketId)}?userId=${encodeURIComponent(userId)}`,
      'GET',
    );
  }

  listTickets(userId: string): Promise<SupportTicketSummary[]> {
    return this.request<SupportTicketSummary[]>(
      `/internal/support/tickets?userId=${encodeURIComponent(userId)}`,
      'GET',
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
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
      throw new SupportDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
