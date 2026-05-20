import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentDependencyUnavailableError,
  PaymentNotFoundError,
} from '../payment.errors';
import {
  CreateCheckoutSessionInput,
  ApicenterCheckoutWebhookRequest,
  CreatePaymentRequest,
  CustomerPaymentMethodSummary,
  PaymentCheckoutSessionSummary,
  PaymentSummary,
  PaymentVisibility,
  PromotionValidationSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutSummary,
  UpsertCustomerPaymentMethodRequest,
  UpsertPayoutMethodRequest,
} from '../payment.types';

@Injectable()
export class PaymentServiceClient {
  constructor(private readonly configService: ConfigService) {}

  createPayment(input: CreatePaymentRequest): Promise<PaymentSummary> {
    return this.request<PaymentSummary>('/internal/payments', 'POST', input);
  }

  confirmCashOnServicePayment(
    bookingId: string,
    providerId?: string | null,
  ): Promise<PaymentSummary> {
    return this.request<PaymentSummary>(
      `/internal/payments/bookings/${encodeURIComponent(
        bookingId,
      )}/cash-on-service/confirm`,
      'POST',
      { providerId: providerId ?? null },
    );
  }

  createCheckoutSession(
    input: CreateCheckoutSessionInput,
    idempotencyKey?: string | null,
  ): Promise<PaymentCheckoutSessionSummary> {
    return this.request<PaymentCheckoutSessionSummary>(
      '/internal/payments/checkout-sessions',
      'POST',
      input,
      idempotencyKey,
    );
  }

  getCheckoutStatus(checkoutId: string): Promise<PaymentCheckoutSessionSummary> {
    return this.request<PaymentCheckoutSessionSummary>(
      `/internal/payments/checkout-sessions/${encodeURIComponent(checkoutId)}/status`,
      'GET',
    );
  }

  syncApicenterCheckoutWebhook(
    input: ApicenterCheckoutWebhookRequest,
  ): Promise<PaymentCheckoutSessionSummary> {
    return this.request<PaymentCheckoutSessionSummary>(
      '/internal/payments/checkout-sessions/webhook',
      'POST',
      input,
    );
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

  validatePromotion(
    code: string,
    amount: number,
  ): Promise<PromotionValidationSummary> {
    return this.request<PromotionValidationSummary>(
      '/internal/payments/promotions/validate',
      'POST',
      {
        code,
        amount,
      },
    );
  }

  getPayoutAccount(providerId: string): Promise<PayoutAccountSummary> {
    return this.request<PayoutAccountSummary>(
      `/internal/payments/payout-account?providerId=${encodeURIComponent(providerId)}`,
      'GET',
    );
  }

  listPayoutMethods(providerId: string): Promise<PayoutMethodSummary[]> {
    return this.request<PayoutMethodSummary[]>(
      `/internal/payments/payout-methods?providerId=${encodeURIComponent(providerId)}`,
      'GET',
    );
  }

  upsertPayoutMethod(
    providerId: string,
    input: UpsertPayoutMethodRequest,
  ): Promise<PayoutMethodSummary> {
    return this.request<PayoutMethodSummary>('/internal/payments/payout-methods', 'PUT', {
      providerId,
      ...input,
    });
  }

  listCustomerPaymentMethods(
    customerId: string,
  ): Promise<CustomerPaymentMethodSummary[]> {
    return this.request<CustomerPaymentMethodSummary[]>(
      `/internal/payments/customer-methods?customerId=${encodeURIComponent(customerId)}`,
      'GET',
    );
  }

  upsertCustomerPaymentMethod(
    customerId: string,
    input: UpsertCustomerPaymentMethodRequest,
  ): Promise<CustomerPaymentMethodSummary> {
    return this.request<CustomerPaymentMethodSummary>(
      '/internal/payments/customer-methods',
      'PUT',
      {
        customerId,
        ...input,
      },
    );
  }

  deleteCustomerPaymentMethod(
    customerId: string,
    methodId: string,
  ): Promise<CustomerPaymentMethodSummary> {
    return this.request<CustomerPaymentMethodSummary>(
      `/internal/payments/customer-methods/${encodeURIComponent(
        methodId,
      )}?customerId=${encodeURIComponent(customerId)}`,
      'DELETE',
    );
  }

  listPayouts(providerId: string): Promise<PayoutSummary[]> {
    return this.request<PayoutSummary[]>(
      `/internal/payments/payouts?providerId=${encodeURIComponent(providerId)}`,
      'GET',
    );
  }

  createPayoutRequest(
    userId: string,
    providerId: string,
    input: { amount: number; payoutMethodId: string },
    idempotencyKey?: string | null,
  ): Promise<PayoutSummary> {
    return this.request<PayoutSummary>(
      '/internal/payments/payouts',
      'POST',
      {
        userId,
        providerId,
        amount: input.amount,
        payoutMethodId: input.payoutMethodId,
      },
      idempotencyKey,
    );
  }

  private async request<T>(
    path: string,
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    body?: unknown,
    idempotencyKey?: string | null,
  ): Promise<T> {
    const baseUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://localhost:8507',
    );
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(idempotencyKey?.trim()
          ? { 'idempotency-key': idempotencyKey.trim() }
          : {}),
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
