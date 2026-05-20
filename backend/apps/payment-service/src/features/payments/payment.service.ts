import { Injectable } from '@nestjs/common';
import { InvalidPaymentRequestError } from './payment.errors';
import {
  CreatePaymentInput,
  ConfirmCashOnServicePaymentInput,
  CreatePayoutRequestInput,
  CustomerPaymentMethodSummary,
  PaymentSummary,
  PaymentVisibility,
  PromotionValidationSummary,
  PayoutMethodSummary,
  PayoutAccountSummary,
  PayoutSummary,
  UpsertPayoutMethodInput,
  UpsertCustomerPaymentMethodInput,
} from './payment.types';
import { SupabasePaymentRepository } from './supabase-payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: SupabasePaymentRepository) {}

  async createPayment(input: CreatePaymentInput): Promise<PaymentSummary> {
    if (
      !input.bookingId ||
      !input.customerId ||
      !input.providerId ||
      !input.paymentMethod?.trim() ||
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.createPayment({
      ...input,
      paymentMethod: input.paymentMethod.trim(),
    });
  }

  async confirmCashOnServicePayment(
    input: ConfirmCashOnServicePaymentInput,
  ): Promise<PaymentSummary> {
    if (!input.bookingId?.trim()) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.confirmCashOnServicePayment({
      bookingId: input.bookingId.trim(),
      providerId: input.providerId?.trim() || null,
    });
  }

  async listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    return this.paymentRepository.listPayments(visibility);
  }

  async validatePromotion(
    code: string,
    amount: number,
  ): Promise<PromotionValidationSummary> {
    if (!code?.trim() || !Number.isFinite(amount) || amount <= 0) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.validatePromotion(code.trim().toUpperCase(), amount);
  }

  listPayoutMethods(providerId: string): Promise<PayoutMethodSummary[]> {
    if (!providerId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listPayoutMethods(providerId);
  }

  upsertPayoutMethod(
    input: UpsertPayoutMethodInput,
  ): Promise<PayoutMethodSummary> {
    if (
      !input.providerId ||
      !input.accountLabel?.trim() ||
      !['bank', 'gcash', 'paymaya'].includes(input.methodType)
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.upsertPayoutMethod({
      ...input,
      accountLabel: input.accountLabel.trim(),
      accountName: input.accountName?.trim() || null,
      accountNumberLast4: input.accountNumberLast4?.trim() || null,
    });
  }

  listCustomerPaymentMethods(
    customerId: string,
  ): Promise<CustomerPaymentMethodSummary[]> {
    if (!customerId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listCustomerPaymentMethods(customerId);
  }

  upsertCustomerPaymentMethod(
    input: UpsertCustomerPaymentMethodInput,
  ): Promise<CustomerPaymentMethodSummary> {
    const last4 = input.last4?.trim() || null;
    if (
      !input.customerId ||
      !input.label?.trim() ||
      !['cash_on_service', 'card', 'gcash', 'paymaya'].includes(
        input.methodType,
      ) ||
      (last4 !== null && !/^[0-9]{1,4}$/.test(last4))
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.upsertCustomerPaymentMethod({
      ...input,
      label: input.label.trim(),
      brand: input.brand?.trim() || null,
      last4,
    });
  }

  deleteCustomerPaymentMethod(
    customerId: string,
    methodId: string,
  ): Promise<CustomerPaymentMethodSummary> {
    if (!customerId || !methodId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.deleteCustomerPaymentMethod(
      customerId,
      methodId,
    );
  }

  getPayoutAccount(providerId: string): Promise<PayoutAccountSummary> {
    if (!providerId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.getPayoutAccount(providerId);
  }

  listPayouts(providerId: string): Promise<PayoutSummary[]> {
    if (!providerId) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listPayouts(providerId);
  }

  createPayoutRequest(
    input: CreatePayoutRequestInput,
  ): Promise<PayoutSummary> {
    if (
      !input.providerId ||
      !input.userId ||
      !input.payoutMethodId ||
      !Number.isFinite(input.amount) ||
      input.amount <= 0
    ) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.createPayoutRequest(input);
  }
}
