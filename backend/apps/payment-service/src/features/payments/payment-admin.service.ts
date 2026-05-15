import { Injectable } from '@nestjs/common';
import { InvalidPaymentRequestError } from './payment.errors';
import { PaymentStatus, PaymentSummary } from './payment.types';
import { SupabasePaymentRepository } from './supabase-payment.repository';

const validStatuses = new Set(['pending', 'paid', 'cancelled', 'refunded']);

@Injectable()
export class PaymentAdminService {
  constructor(private readonly paymentRepository: SupabasePaymentRepository) {}

  async listPayments(status?: string | null): Promise<PaymentSummary[]> {
    if (status && !validStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.listAllPayments(
      (status as PaymentStatus | undefined) ?? null,
    );
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    if (!paymentId || !validStatuses.has(status)) {
      throw new InvalidPaymentRequestError();
    }

    return this.paymentRepository.updatePaymentStatus(
      paymentId,
      status as PaymentStatus,
    );
  }
}
