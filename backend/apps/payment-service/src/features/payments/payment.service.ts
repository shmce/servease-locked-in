import { Injectable } from '@nestjs/common';
import { InvalidPaymentRequestError } from './payment.errors';
import {
  CreatePaymentInput,
  PaymentSummary,
  PaymentVisibility,
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

  async listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    return this.paymentRepository.listPayments(visibility);
  }
}
