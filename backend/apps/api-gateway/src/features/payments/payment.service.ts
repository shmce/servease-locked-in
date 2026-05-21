import { Injectable } from '@nestjs/common';
import { PaymentServiceClient } from './clients/payment-service.client';
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
} from './payment.types';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly paymentServiceClient: PaymentServiceClient) {}

  createPayment(input: CreatePaymentRequest): Promise<PaymentSummary> {
    return this.paymentServiceClient.createPayment(input);
  }

  confirmCashOnServicePayment(
    bookingId: string,
    providerId?: string | null,
  ): Promise<PaymentSummary> {
    return this.paymentServiceClient.confirmCashOnServicePayment(
      bookingId,
      providerId ?? null,
    );
  }

  createCheckoutSession(
    input: CreateCheckoutSessionInput,
    idempotencyKey?: string | null,
  ): Promise<PaymentCheckoutSessionSummary> {
    return this.paymentServiceClient.createCheckoutSession(
      input,
      idempotencyKey,
    );
  }

  getCheckoutStatus(checkoutId: string): Promise<PaymentCheckoutSessionSummary> {
    return this.paymentServiceClient.getCheckoutStatus(checkoutId);
  }

  syncApicenterCheckoutWebhook(
    input: ApicenterCheckoutWebhookRequest,
  ): Promise<PaymentCheckoutSessionSummary> {
    return this.paymentServiceClient.syncApicenterCheckoutWebhook(input);
  }

  listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    return this.paymentServiceClient.listPayments(visibility);
  }

  validatePromotion(
    code: string,
    amount: number,
  ): Promise<PromotionValidationSummary> {
    return this.paymentServiceClient.validatePromotion(code, amount);
  }

  getPayoutAccount(providerId: string): Promise<PayoutAccountSummary> {
    return this.paymentServiceClient.getPayoutAccount(providerId);
  }

  listPayoutMethods(providerId: string): Promise<PayoutMethodSummary[]> {
    return this.paymentServiceClient.listPayoutMethods(providerId);
  }

  upsertPayoutMethod(
    providerId: string,
    input: UpsertPayoutMethodRequest,
  ): Promise<PayoutMethodSummary> {
    return this.paymentServiceClient.upsertPayoutMethod(providerId, input);
  }

  listCustomerPaymentMethods(
    customerId: string,
  ): Promise<CustomerPaymentMethodSummary[]> {
    return this.paymentServiceClient.listCustomerPaymentMethods(customerId);
  }

  upsertCustomerPaymentMethod(
    customerId: string,
    input: UpsertCustomerPaymentMethodRequest,
  ): Promise<CustomerPaymentMethodSummary> {
    return this.paymentServiceClient.upsertCustomerPaymentMethod(
      customerId,
      input,
    );
  }

  deleteCustomerPaymentMethod(
    customerId: string,
    methodId: string,
  ): Promise<CustomerPaymentMethodSummary> {
    return this.paymentServiceClient.deleteCustomerPaymentMethod(
      customerId,
      methodId,
    );
  }

  listPayouts(providerId: string): Promise<PayoutSummary[]> {
    return this.paymentServiceClient.listPayouts(providerId);
  }

  createPayoutRequest(
    userId: string,
    providerId: string,
    input: { amount: number; payoutMethodId: string },
    idempotencyKey?: string | null,
  ): Promise<PayoutSummary> {
    return this.paymentServiceClient.createPayoutRequest(
      userId,
      providerId,
      input,
      idempotencyKey,
    );
  }
}
