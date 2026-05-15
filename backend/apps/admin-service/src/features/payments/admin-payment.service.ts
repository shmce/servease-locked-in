import { Injectable } from '@nestjs/common';
import { PaymentSummary } from './admin-payment.types';
import { PaymentServiceClient } from './clients/payment-service.client';

@Injectable()
export class AdminPaymentService {
  constructor(private readonly paymentServiceClient: PaymentServiceClient) {}

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    return this.paymentServiceClient.listPayments(status ?? null);
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.paymentServiceClient.updatePaymentStatus(paymentId, status);
  }
}
