import { Injectable } from '@nestjs/common';
import { PaymentSummary } from './admin-payment.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminPaymentGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    return this.adminServiceClient.listPayments(status ?? null);
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.adminServiceClient.updatePaymentStatus(paymentId, status);
  }
}
