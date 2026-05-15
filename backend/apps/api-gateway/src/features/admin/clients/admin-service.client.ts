import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminDependencyUnavailableError } from '../admin-support.errors';
import { PaymentSummary } from '../admin-payment.types';
import { SupportTicketSummary } from '../admin-support.types';

@Injectable()
export class AdminServiceClient {
  constructor(private readonly configService: ConfigService) {}

  listSupportTickets(status?: string | null): Promise<SupportTicketSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<SupportTicketSummary[]>(
      `/internal/admin/support/tickets?${searchParams.toString()}`,
      'GET',
    );
  }

  updateTicketStatus(
    ticketId: string,
    status: string,
  ): Promise<SupportTicketSummary> {
    return this.request<SupportTicketSummary>(
      `/internal/admin/support/tickets/${ticketId}/status`,
      'PATCH',
      {
        status,
      },
    );
  }

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    const searchParams = new URLSearchParams();
    if (status) {
      searchParams.set('status', status);
    }
    return this.request<PaymentSummary[]>(
      `/internal/admin/payments?${searchParams.toString()}`,
      'GET',
    );
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/admin/payments/${paymentId}/status`,
      'PATCH',
      {
        status,
      },
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'PATCH',
    body?: unknown,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'ADMIN_SERVICE_URL',
      'http://localhost:8511',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new AdminDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
