import { Injectable } from '@nestjs/common';
import {
  PaymentSummary,
  CommissionRuleSummary,
  PromotionSummary,
  PayoutEventSummary,
  PayoutSummary,
  RecordPayoutEventRequest,
  RefundSummary,
  UpsertPromotionRequest,
  UpdateCommissionRuleRequest,
} from './admin-payment.types';
import { AdminServiceClient } from './clients/admin-service.client';

@Injectable()
export class AdminPaymentGatewayService {
  constructor(private readonly adminServiceClient: AdminServiceClient) {}

  getPayment(paymentId: string): Promise<PaymentSummary> {
    return this.adminServiceClient.getPayment(paymentId);
  }

  listPayments(status?: string | null): Promise<PaymentSummary[]> {
    return this.adminServiceClient.listPayments(status ?? null);
  }

  updatePaymentStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentSummary> {
    return this.adminServiceClient.updatePaymentStatus(paymentId, status);
  }

  recordPaymentFailure(
    paymentId: string,
    failureReason: string,
    failureCode: string | null,
    disputeId: string | null,
  ): Promise<PaymentSummary> {
    return this.adminServiceClient.recordPaymentFailure(
      paymentId,
      failureReason,
      failureCode,
      disputeId,
    );
  }

  retryPayment(paymentId: string): Promise<PaymentSummary> {
    return this.adminServiceClient.retryPayment(paymentId);
  }

  syncPaymentWithApicenter(paymentId: string): Promise<PaymentSummary> {
    return this.adminServiceClient.syncPaymentWithApicenter(paymentId);
  }

  listPromotions(status?: string | null): Promise<PromotionSummary[]> {
    return this.adminServiceClient.listPromotions(status ?? null);
  }

  createPromotion(input: UpsertPromotionRequest): Promise<PromotionSummary> {
    return this.adminServiceClient.createPromotion(input);
  }

  updatePromotion(
    promotionId: string,
    input: UpsertPromotionRequest,
  ): Promise<PromotionSummary> {
    return this.adminServiceClient.updatePromotion(promotionId, input);
  }

  deletePromotion(promotionId: string): Promise<PromotionSummary> {
    return this.adminServiceClient.deletePromotion(promotionId);
  }

  listPayouts(status?: string | null): Promise<PayoutSummary[]> {
    return this.adminServiceClient.listPayouts(status ?? null);
  }

  updatePayoutStatus(
    payoutId: string,
    status: string,
  ): Promise<PayoutSummary> {
    return this.adminServiceClient.updatePayoutStatus(payoutId, status);
  }

  releasePaymentToProvider(
    paymentId: string,
    adminUserId: string,
    note?: string | null,
  ): Promise<PayoutSummary> {
    return this.adminServiceClient.releasePaymentToProvider(
      paymentId,
      adminUserId,
      note ?? null,
    );
  }

  listPayoutEvents(payoutId: string): Promise<PayoutEventSummary[]> {
    return this.adminServiceClient.listPayoutEvents(payoutId);
  }

  recordPayoutEvent(
    payoutId: string,
    input: RecordPayoutEventRequest,
  ): Promise<PayoutEventSummary> {
    return this.adminServiceClient.recordPayoutEvent(payoutId, input);
  }

  listRefunds(status?: string | null): Promise<RefundSummary[]> {
    return this.adminServiceClient.listRefunds(status ?? null);
  }

  approveRefund(
    refundId: string,
    adminUserId: string,
    reason?: string | null,
  ): Promise<RefundSummary> {
    return this.adminServiceClient.approveRefund(
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
    return this.adminServiceClient.rejectRefund(refundId, adminUserId, reason);
  }

  listCommissionRules(): Promise<CommissionRuleSummary[]> {
    return this.adminServiceClient.listCommissionRules();
  }

  updateCommissionRule(
    ruleId: string,
    input: UpdateCommissionRuleRequest,
  ): Promise<CommissionRuleSummary> {
    return this.adminServiceClient.updateCommissionRule(ruleId, input);
  }
}
