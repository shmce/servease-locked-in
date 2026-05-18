import { Injectable, Optional } from '@nestjs/common';
import { createApicenterClient } from '../../../../../libs/common/src';
import { InvalidPaymentRequestError, PaymentNotFoundError } from './payment.errors';
import { SupabasePaymentRepository } from './supabase-payment.repository';
import {
  ApicenterCheckoutWebhookInput,
  CreateCheckoutSessionInput,
  CreatePaymentCustomerInput,
  CreatePaymentPriceInput,
  CreatePaymentProductInput,
  CreatePaymentRefundInput,
  CreatePaymentSubscriptionInput,
  PaymentCheckoutSessionSummary,
  PaymentCustomerSummary,
  PaymentInvoiceSummary,
  PaymentPriceSummary,
  PaymentProductSummary,
  PaymentRefundSummary,
  PaymentSubscriptionSummary,
} from './payment.types';

const CHECKOUT_STATUSES = new Set([
  'created',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'expired',
  'refunded',
  'partially_refunded',
]);

@Injectable()
export class SharedPaymentService {
  constructor(
    @Optional()
    private readonly paymentRepository?: SupabasePaymentRepository,
  ) {}

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<PaymentCheckoutSessionSummary> {
    this.assertValidCheckout(input);

    const session = await createApicenterClient().paymentCreateCheckoutSession({
      referenceId: input.referenceId.trim(),
      idempotencyKey: input.idempotencyKey?.trim() || undefined,
      mode: input.mode ?? 'payment',
      successUrl: input.successUrl.trim(),
      cancelUrl: input.cancelUrl.trim(),
      lineItems: input.lineItems.map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity,
        amount: item.amount,
      })),
      customerId: input.customerId?.trim() || undefined,
      priceId: input.priceId?.trim() || undefined,
      paymentMethods: input.paymentMethods,
      customer: input.customer,
      metadata: input.metadata,
    });

    const summary: PaymentCheckoutSessionSummary = {
      checkoutId: session.checkoutId,
      provider: session.provider,
      providerMode: session.providerMode,
      status: session.status,
      referenceId: session.referenceId,
      redirectUrl: session.redirectUrl,
      expiresAt: session.expiresAt,
      amount: session.amount,
      currency: session.currency,
      paymentMethodsAllowed: session.paymentMethodsAllowed,
      metadata: session.metadata,
    };

    if (!input.localPayment || !this.paymentRepository) {
      return summary;
    }

    const localPayment = await this.paymentRepository.recordApicenterCheckout({
      bookingId: input.localPayment.bookingId.trim(),
      customerId: input.localPayment.customerId.trim(),
      providerId: input.localPayment.providerId.trim(),
      amount: input.localPayment.amount,
      paymentMethod: input.localPayment.paymentMethod.trim(),
      session: summary,
    });

    return {
      ...summary,
      ...localPayment,
    };
  }

  async getCheckoutStatus(
    checkoutId: string,
  ): Promise<PaymentCheckoutSessionSummary> {
    const normalized = checkoutId.trim();
    if (!normalized) {
      throw new InvalidPaymentRequestError();
    }

    const session = await createApicenterClient().paymentGetCheckoutStatus(normalized);
    const summary: PaymentCheckoutSessionSummary = {
      checkoutId: session.checkoutId,
      provider: session.provider,
      providerMode: session.providerMode,
      status: session.status,
      referenceId: session.referenceId,
      redirectUrl: session.redirectUrl,
      expiresAt: session.expiresAt,
      amount: session.amount,
      currency: session.currency,
      paymentMethodsAllowed: session.paymentMethodsAllowed,
      metadata: session.metadata,
    };

    if (!this.paymentRepository) {
      return summary;
    }

    try {
      const localPayment =
        await this.paymentRepository.syncApicenterCheckoutStatus(summary);
      return {
        ...summary,
        ...localPayment,
      };
    } catch (error) {
      if (error instanceof PaymentNotFoundError) {
        return summary;
      }
      throw error;
    }
  }

  async syncCheckoutWebhook(
    input: ApicenterCheckoutWebhookInput,
  ): Promise<PaymentCheckoutSessionSummary> {
    const checkoutId = input.checkoutId?.trim();
    const referenceId = input.referenceId?.trim();
    const status = input.status?.trim() as PaymentCheckoutSessionSummary['status'];
    if (!checkoutId || !referenceId || !CHECKOUT_STATUSES.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    if (!this.paymentRepository) {
      throw new Error('payment_repository_unavailable');
    }

    const summary: PaymentCheckoutSessionSummary = {
      checkoutId,
      provider: input.provider ?? 'paymongo',
      providerMode: input.providerMode,
      status,
      referenceId,
      redirectUrl: input.redirectUrl?.trim() ?? '',
      expiresAt: input.expiresAt,
      amount: input.amount,
      currency: input.currency,
      paymentMethodsAllowed: input.paymentMethodsAllowed,
      metadata: input.metadata,
    };
    const localPayment =
      await this.paymentRepository.syncApicenterCheckoutStatus(summary);

    return {
      ...summary,
      ...localPayment,
    };
  }

  async createRefund(input: CreatePaymentRefundInput): Promise<PaymentRefundSummary> {
    const paymentId = input.paymentId?.trim();
    if (
      !paymentId ||
      !Number.isFinite(input.amount.value) ||
      input.amount.value <= 0 ||
      !input.amount.currency?.trim()
    ) {
      throw new InvalidPaymentRequestError();
    }

    return createApicenterClient().paymentCreateRefund(paymentId, {
      amount: {
        value: input.amount.value,
        currency: input.amount.currency.trim().toUpperCase(),
      },
      idempotencyKey: input.idempotencyKey?.trim() || undefined,
      reason: input.reason?.trim() || undefined,
      referenceId: input.referenceId?.trim() || undefined,
      metadata: input.metadata,
    });
  }

  async createCustomer(input: CreatePaymentCustomerInput): Promise<PaymentCustomerSummary> {
    if (!input.email?.trim() && !input.phone?.trim() && !input.customerId?.trim()) {
      throw new InvalidPaymentRequestError();
    }

    return createApicenterClient().paymentCreateCustomer({
      customerId: input.customerId?.trim() || undefined,
      idempotencyKey: input.idempotencyKey?.trim() || undefined,
      email: input.email?.trim().toLowerCase() || undefined,
      phone: input.phone?.trim() || undefined,
      name: input.name?.trim() || undefined,
      metadata: input.metadata,
    });
  }

  async createProduct(input: CreatePaymentProductInput): Promise<PaymentProductSummary> {
    if (!input.name?.trim()) {
      throw new InvalidPaymentRequestError();
    }

    return createApicenterClient().paymentCreateProduct({
      productId: input.productId?.trim() || undefined,
      idempotencyKey: input.idempotencyKey?.trim() || undefined,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      metadata: input.metadata,
    });
  }

  async createPrice(input: CreatePaymentPriceInput): Promise<PaymentPriceSummary> {
    if (
      !input.productId?.trim() ||
      !Number.isFinite(input.amount.value) ||
      input.amount.value <= 0 ||
      !input.amount.currency?.trim()
    ) {
      throw new InvalidPaymentRequestError();
    }

    return createApicenterClient().paymentCreatePrice({
      priceId: input.priceId?.trim() || undefined,
      idempotencyKey: input.idempotencyKey?.trim() || undefined,
      productId: input.productId.trim(),
      amount: {
        value: input.amount.value,
        currency: input.amount.currency.trim().toUpperCase(),
      },
      recurring: input.recurring,
      metadata: input.metadata,
    });
  }

  async createSubscription(
    input: CreatePaymentSubscriptionInput,
  ): Promise<PaymentSubscriptionSummary> {
    if (
      !input.referenceId?.trim() ||
      !input.customerId?.trim() ||
      !input.priceId?.trim()
    ) {
      throw new InvalidPaymentRequestError();
    }

    return createApicenterClient().paymentCreateSubscription({
      subscriptionId: input.subscriptionId?.trim() || undefined,
      referenceId: input.referenceId.trim(),
      idempotencyKey: input.idempotencyKey?.trim() || undefined,
      customerId: input.customerId.trim(),
      priceId: input.priceId.trim(),
      successUrl: input.successUrl?.trim() || undefined,
      cancelUrl: input.cancelUrl?.trim() || undefined,
      trialPeriodDays: input.trialPeriodDays,
      metadata: input.metadata,
    });
  }

  getSubscription(subscriptionId: string): Promise<PaymentSubscriptionSummary> {
    const normalized = subscriptionId.trim();
    if (!normalized) {
      throw new InvalidPaymentRequestError();
    }
    return createApicenterClient().paymentGetSubscription(normalized);
  }

  listSubscriptionInvoices(subscriptionId: string): Promise<PaymentInvoiceSummary[]> {
    const normalized = subscriptionId.trim();
    if (!normalized) {
      throw new InvalidPaymentRequestError();
    }
    return createApicenterClient().paymentListSubscriptionInvoices(normalized);
  }

  private assertValidCheckout(input: CreateCheckoutSessionInput): void {
    if (
      !input.referenceId?.trim() ||
      !this.isValidUrl(input.successUrl) ||
      !this.isValidUrl(input.cancelUrl) ||
      (input.localPayment !== undefined &&
        (!input.localPayment.bookingId?.trim() ||
          !input.localPayment.customerId?.trim() ||
          !input.localPayment.providerId?.trim() ||
          !Number.isFinite(input.localPayment.amount) ||
          input.localPayment.amount <= 0 ||
          !input.localPayment.paymentMethod?.trim())) ||
      !input.lineItems?.length ||
      input.lineItems.some(
        (item) =>
          !item.name?.trim() ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isFinite(item.amount.value) ||
          item.amount.value <= 0 ||
          !item.amount.currency?.trim(),
      )
    ) {
      throw new InvalidPaymentRequestError();
    }
  }

  private isValidUrl(value: string | undefined): boolean {
    try {
      if (!value?.trim()) {
        return false;
      }
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}
