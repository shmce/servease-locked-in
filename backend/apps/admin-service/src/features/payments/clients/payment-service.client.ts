import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentSummary } from '../admin-payment.types';

@Injectable()
export class PaymentServiceClient {
  constructor(private readonly configService: ConfigService) {}

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
      'PAYMENT_SERVICE_URL',
      'http://localhost:8507',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('payment_dependency_unavailable');
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }
}
