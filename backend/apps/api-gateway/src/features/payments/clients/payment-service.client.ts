import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentDependencyUnavailableError,
  PaymentNotFoundError,
} from '../payment.errors';
import {
  CreatePaymentRequest,
  PaymentSummary,
  PaymentVisibility,
} from '../payment.types';

@Injectable()
export class PaymentServiceClient {
  constructor(private readonly configService: ConfigService) {}

  createPayment(input: CreatePaymentRequest): Promise<PaymentSummary> {
    return this.request<PaymentSummary>('/internal/payments', 'POST', input);
  }

  listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    const searchParams = new URLSearchParams();
    if (visibility.customerId) {
      searchParams.set('customerId', visibility.customerId);
    }
    if (visibility.providerId) {
      searchParams.set('providerId', visibility.providerId);
    }

    return this.request<PaymentSummary[]>(
      `/internal/payments?${searchParams.toString()}`,
      'GET',
    );
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST',
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
      const code = await this.readErrorCode(response);
      if (code === 'payment_not_found') {
        throw new PaymentNotFoundError();
      }
      throw new PaymentDependencyUnavailableError();
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  private async readErrorCode(response: Response): Promise<string | null> {
    try {
      const payload = (await response.json()) as {
        error?: {
          code?: string;
        };
      };
      return payload.error?.code ?? null;
    } catch {
      return null;
    }
  }
}
