import { Injectable } from '@nestjs/common';
import {
  PaymentSummary,
  CommissionRuleSummary,
  PayoutEventSummary,
  PromotionSummary,
  PayoutSummary,
  RecordPayoutEventRequest,
  RefundSummary,
  UpsertPromotionRequest,
  UpdateCommissionRuleRequest,
} from './admin-payment.types';
import { PaymentServiceClient } from './clients/payment-service.client';

@Injectable()
export class AdminPaymentService {
  constructor(private readonly paymentServiceClient: PaymentServiceClient) {}

  getPayment(paymentId: string): Promise<PaymentSummary> {
    return this.paymentServiceClient.getPayment(paymentId);
  }

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    return this.paymentServiceClient.listPayments(status ?? null);
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.paymentServiceClient.updatePaymentStatus(paymentId, status);
  }

  recordPaymentFailure(
    paymentId: string,
    failureReason: string,
    failureCode: string | null,
    disputeId: string | null,
  ): Promise<PaymentSummary> {
    return this.paymentServiceClient.recordPaymentFailure(
      paymentId,
      failureReason,
      failureCode,
      disputeId,
    );
  }

  retryPayment(paymentId: string): Promise<PaymentSummary> {
    return this.paymentServiceClient.retryPayment(paymentId);
  }

  syncPaymentWithApicenter(paymentId: string): Promise<PaymentSummary> {
    return this.paymentServiceClient.syncPaymentWithApicenter(paymentId);
  }

  listPromotions(status?: string | null): Promise<PromotionSummary[]> {
    return this.paymentServiceClient.listPromotions(status ?? null);
  }

  createPromotion(input: UpsertPromotionRequest): Promise<PromotionSummary> {
    return this.paymentServiceClient.createPromotion(input);
  }

  updatePromotion(
    promotionId: string,
    input: UpsertPromotionRequest,
  ): Promise<PromotionSummary> {
    return this.paymentServiceClient.updatePromotion(promotionId, input);
  }

  deletePromotion(promotionId: string): Promise<PromotionSummary> {
    return this.paymentServiceClient.deletePromotion(promotionId);
  }

  listPayouts(status?: string | null): Promise<PayoutSummary[]> {
    return this.paymentServiceClient.listPayouts(status ?? null);
  }

  updatePayoutStatus(
    payoutId: string,
    status: string,
  ): Promise<PayoutSummary> {
    return this.paymentServiceClient.updatePayoutStatus(payoutId, status);
  }

  releasePaymentToProvider(
    paymentId: string,
    adminUserId: string,
    note?: string | null,
  ): Promise<PayoutSummary> {
    return this.paymentServiceClient.releasePaymentToProvider(
      paymentId,
      adminUserId,
      note ?? null,
    );
  }

  listPayoutEvents(payoutId: string): Promise<PayoutEventSummary[]> {
    return this.paymentServiceClient.listPayoutEvents(payoutId);
  }

  recordPayoutEvent(
    payoutId: string,
    input: RecordPayoutEventRequest,
  ): Promise<PayoutEventSummary> {
    return this.paymentServiceClient.recordPayoutEvent(payoutId, input);
  }

  listRefunds(status?: string | null): Promise<RefundSummary[]> {
    return this.paymentServiceClient.listRefunds(status ?? null);
  }

  approveRefund(
    refundId: string,
    adminUserId: string,
    reason?: string | null,
  ): Promise<RefundSummary> {
    return this.paymentServiceClient.approveRefund(
      refundId,
      adminUserId,
      reason ?? null,
    );
  }

  rejectRefund(
    refundId: string,
    adminUserId: string,
    reason: string,
  ): Promise<RefundSummary> {
    return this.paymentServiceClient.rejectRefund(refundId, adminUserId, reason);
  }

  listCommissionRules(): Promise<CommissionRuleSummary[]> {
    return this.paymentServiceClient.listCommissionRules();
  }

  updateCommissionRule(
    ruleId: string,
    input: UpdateCommissionRuleRequest,
  ): Promise<CommissionRuleSummary> {
    return this.paymentServiceClient.updateCommissionRule(ruleId, input);
  }
}
