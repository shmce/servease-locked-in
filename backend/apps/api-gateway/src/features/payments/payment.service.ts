import { Injectable } from '@nestjs/common';
import { PaymentServiceClient } from './clients/payment-service.client';
import {
  CreatePaymentRequest,
  PaymentSummary,
  PaymentVisibility,
} from './payment.types';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly paymentServiceClient: PaymentServiceClient) {}

  createPayment(input: CreatePaymentRequest): Promise<PaymentSummary> {
    return this.paymentServiceClient.createPayment(input);
  }

  listPayments(visibility: PaymentVisibility): Promise<PaymentSummary[]> {
    return this.paymentServiceClient.listPayments(visibility);
  }
}
